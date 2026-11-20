#!/usr/bin/env node
/**
 * wp-doctor — why is /blog empty?
 *
 *   node scripts/wp-doctor.mjs
 *   node scripts/wp-doctor.mjs https://staging.techbuzz.com.pk
 *
 * The site degrades to an empty state when WordPress cannot be reached, which
 * is correct behaviour but tells you nothing. This runs the same requests the
 * site makes, one layer at a time, and says which one refuses.
 *
 * No dependencies. Safe to run against production: it only reads.
 */

import { lookup } from "node:dns/promises";
import tls from "node:tls";

const BASE = (process.argv[2] ?? process.env.WP_BASE_URL ?? "https://techbuzz.com.pk").replace(/\/$/, "");
const API = `${BASE}/wp-json/wp/v2`;
const HOST = new URL(BASE).hostname;
const TIMEOUT = Number(process.env.WP_TIMEOUT_MS ?? "25000") || 25000;

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 TechBuzzSite/1.0";

const g = (s) => `\x1b[32m${s}\x1b[0m`;
const r = (s) => `\x1b[31m${s}\x1b[0m`;
const y = (s) => `\x1b[33m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

const PASS = g("PASS");
const FAIL = r("FAIL");
const WARN = y("WARN");

const findings = [];
const note = (verdict, text) => findings.push({ verdict, text });

function line(label, verdict, detail) {
  console.log(`  ${verdict}  ${label.padEnd(34)} ${dim(detail ?? "")}`);
}

function codeOf(err) {
  return err?.cause?.code ?? err?.code ?? err?.name ?? "unknown";
}

async function timed(fn) {
  const t = Date.now();
  try {
    const value = await fn();
    return { ok: true, value, ms: Date.now() - t };
  } catch (err) {
    return { ok: false, err, ms: Date.now() - t };
  }
}

console.log(`\n  wp-doctor  ${dim(BASE)}\n`);

/* 1 ------------------------------------------------------------------ DNS */
{
  const t = await timed(() => lookup(HOST));
  if (t.ok) {
    line("DNS resolves", PASS, `${HOST} -> ${t.value.address} (${t.ms}ms)`);
  } else {
    line("DNS resolves", FAIL, codeOf(t.err));
    note(
      FAIL,
      `This machine cannot resolve ${HOST}. Nothing below will work. Check your connection, VPN, or /etc/hosts.`,
    );
    report();
  }
}

/* 2 ------------------------------------------------------- TLS chain check */
{
  const t = await timed(
    () =>
      new Promise((resolve, reject) => {
        const socket = tls.connect(
          { host: HOST, port: 443, servername: HOST, timeout: 10000 },
          () => {
            const authorized = socket.authorized;
            const err = socket.authorizationError;
            const cert = socket.getPeerCertificate(true);
            socket.end();
            resolve({ authorized, err, issuer: cert?.issuer?.O, to: cert?.valid_to });
          },
        );
        socket.on("timeout", () => {
          socket.destroy();
          reject(new Error("TLS handshake timed out"));
        });
        socket.on("error", reject);
      }),
  );

  if (!t.ok) {
    line("TLS handshake", FAIL, codeOf(t.err));
    note(FAIL, `Could not complete a TLS handshake with ${HOST}: ${t.err?.message}`);
  } else if (t.value.authorized) {
    line("TLS chain complete", PASS, `issuer ${t.value.issuer ?? "?"}, expires ${t.value.to ?? "?"}`);
  } else {
    line("TLS chain complete", FAIL, t.value.err ?? "not authorized");
    note(
      FAIL,
      `The certificate chain is incomplete or invalid (${t.value.err}). Chrome papers over this by\n` +
        `       fetching the missing intermediate certificate itself; Node does not, so the site looks\n` +
        `       fine in a browser and every server-side fetch fails. Fix the chain on the host.`,
    );
  }
}

/* 3 ------------------------- bare fetch, the way the old code sent it */
{
  const t = await timed(async () => {
    const res = await fetch(`${API}/categories?per_page=1`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT),
    });
    return { status: res.status, ok: res.ok, body: (await res.text()).slice(0, 160) };
  });

  if (!t.ok) {
    line("fetch without a user agent", FAIL, `${codeOf(t.err)} after ${t.ms}ms`);
  } else if (t.value.ok) {
    line("fetch without a user agent", PASS, `HTTP ${t.value.status} in ${t.ms}ms`);
  } else {
    line("fetch without a user agent", FAIL, `HTTP ${t.value.status} in ${t.ms}ms`);
    note(
      WARN,
      `A plain request is rejected with HTTP ${t.value.status}. If the next check passes, the host is\n` +
        `       filtering on user agent and lib/wp.ts sending a browser one is what fixes it.\n` +
        `       Body: ${t.value.body.replace(/\s+/g, " ")}`,
    );
  }
}

/* 4 ----------------------------------- fetch with the UA lib/wp.ts sends */
let categoriesOk = false;
{
  const t = await timed(async () => {
    const res = await fetch(`${API}/categories?per_page=100&orderby=count&order=desc`, {
      headers: { Accept: "application/json", "User-Agent": BROWSER_UA },
      signal: AbortSignal.timeout(TIMEOUT),
    });
    const text = await res.text();
    let parsed = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      /* left null on purpose */
    }
    return { status: res.status, ok: res.ok, parsed, text: text.slice(0, 160) };
  });

  if (!t.ok) {
    line("GET /categories (browser UA)", FAIL, `${codeOf(t.err)} after ${t.ms}ms`);
    note(FAIL, `/categories failed: ${codeOf(t.err)}. This is the small, fast call; if it fails, the problem is the connection or the host, not payload size.`);
  } else if (t.value.ok && Array.isArray(t.value.parsed)) {
    categoriesOk = true;
    const shown = t.value.parsed.filter((c) => c.count >= 5 && !["uncategorized", "about"].includes(c.slug));
    line("GET /categories (browser UA)", PASS, `${t.value.parsed.length} categories in ${t.ms}ms`);
    line("categories above the filter floor", shown.length ? PASS : WARN, shown.map((c) => `${c.name} (${c.count})`).join(", ") || "none");
    if (!shown.length) {
      note(WARN, "No category clears the minCount floor in blog.config.ts, so the filter bar will show only All.");
    }
  } else {
    line("GET /categories (browser UA)", FAIL, `HTTP ${t.value.status} in ${t.ms}ms`);
    note(FAIL, `/categories returned HTTP ${t.value.status}: ${t.value.text.replace(/\s+/g, " ")}`);
  }
}

/* 5 ---------------------------- the real listing request, timed and sized */
{
  const t = await timed(async () => {
    const res = await fetch(`${API}/posts?per_page=12&page=1&orderby=date&order=desc`, {
      headers: { Accept: "application/json", "User-Agent": BROWSER_UA },
      signal: AbortSignal.timeout(TIMEOUT),
    });
    const text = await res.text();
    let parsed = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      /* left null on purpose */
    }
    return {
      status: res.status,
      ok: res.ok,
      bytes: Buffer.byteLength(text),
      count: Array.isArray(parsed) ? parsed.length : 0,
      totalPages: res.headers.get("x-wp-totalpages"),
      total: res.headers.get("x-wp-total"),
      sample: Array.isArray(parsed) ? parsed[0] : null,
      text: text.slice(0, 160),
    };
  });

  if (!t.ok) {
    line("GET /posts?per_page=12", FAIL, `${codeOf(t.err)} after ${t.ms}ms`);
    if (codeOf(t.err) === "TimeoutError") {
      note(
        FAIL,
        `The 12-post listing did not finish inside ${TIMEOUT}ms. WordPress builds a Yoast schema graph\n` +
          `       for every post in the page before it answers, so this is the slowest call on the site.\n` +
          `       Raise WP_TIMEOUT_MS, or install an object cache on the WordPress side.`,
      );
    } else {
      note(FAIL, `The listing request failed with ${codeOf(t.err)} while /categories ${categoriesOk ? "succeeded" : "also failed"}.`);
    }
  } else if (t.value.ok) {
    const kb = Math.round(t.value.bytes / 1024);
    line("GET /posts?per_page=12", PASS, `${t.value.count} posts, ${kb} KB in ${t.ms}ms`);
    line("pagination headers present", t.value.totalPages ? PASS : WARN, `X-WP-TotalPages: ${t.value.totalPages ?? "missing"}, X-WP-Total: ${t.value.total ?? "missing"}`);

    if (t.ms > 10000) {
      note(WARN, `That took ${(t.ms / 1000).toFixed(1)}s. It is inside the timeout but slow enough that a cold cache on a slower connection will fail. An object cache on WordPress is the real fix.`);
    }
    if (kb > 400) {
      note(WARN, `${kb} KB for one page, because this install ignores _fields and returns every post in full. Expected, and the reason the data layer throws article bodies away before they reach the browser.`);
    }

    const s = t.value.sample;
    if (s) {
      const hasYoast = Boolean(s.yoast_head_json);
      line("yoast_head_json present", hasYoast ? PASS : FAIL, hasYoast ? "og_image and twitter_misc available" : "missing");
      if (!hasYoast) {
        note(FAIL, "Without yoast_head_json there is no featured image and no byline, because _embed and /wp/v2/users are both unavailable on this install. Check that Yoast SEO is active.");
      } else {
        const img = s.yoast_head_json.og_image?.[0]?.url;
        line("featured image URL", img ? PASS : WARN, img ?? "no og_image on the newest post");
        if (img) {
          const host = new URL(img).hostname;
          line("image host matches remotePatterns", host === HOST ? PASS : WARN, host);
          if (host !== HOST) {
            note(WARN, `Images are served from ${host}, but next.config.ts only allows ${HOST}. next/image will throw until that hostname is added to images.remotePatterns.`);
          }
        }
        const by = s.yoast_head_json.twitter_misc?.["Written by"];
        line("byline present", by ? PASS : WARN, by ?? "no \"Written by\" in twitter_misc");
      }
    }
  } else {
    line("GET /posts?per_page=12", FAIL, `HTTP ${t.value.status} in ${t.ms}ms`);
    note(FAIL, `The listing returned HTTP ${t.value.status}: ${t.value.text.replace(/\s+/g, " ")}`);
  }
}

/* 6 ------------------------------------------- is _fields honoured at all */
{
  const t = await timed(async () => {
    const res = await fetch(`${API}/posts?per_page=1&_fields=id`, {
      headers: { Accept: "application/json", "User-Agent": BROWSER_UA },
      signal: AbortSignal.timeout(TIMEOUT),
    });
    const parsed = await res.json();
    return Array.isArray(parsed) ? Object.keys(parsed[0] ?? {}) : [];
  });

  if (t.ok) {
    const honoured = t.value.length > 0 && t.value.length <= 2;
    line("_fields honoured", honoured ? PASS : WARN, `${t.value.length} keys returned for _fields=id`);
    if (!honoured) {
      note(
        WARN,
        `_fields is ignored by this install: asking for one key returns all ${t.value.length}. That is why\n` +
          `       every request is heavy. Usually a caching plugin serving a response keyed without the query\n` +
          `       string. Worth fixing on the WordPress side; the site is built to cope either way.`,
      );
    }
  }
}

report();

function report() {
  console.log("");
  const fails = findings.filter((f) => f.verdict === FAIL);
  const warns = findings.filter((f) => f.verdict === WARN);

  if (!fails.length && !warns.length) {
    console.log(`  ${g("Everything the blog needs is reachable from this machine.")}`);
    console.log(dim("  If /blog is still empty, the cache is holding an old failed result:"));
    console.log(dim("  stop the dev server, delete .next, and start it again.\n"));
    process.exit(0);
  }

  if (fails.length) console.log(`  ${r("Blocking")}\n`);
  for (const f of fails) console.log(`    ${r("•")} ${f.text}\n`);
  if (warns.length) console.log(`  ${y("Worth knowing")}\n`);
  for (const f of warns) console.log(`    ${y("•")} ${f.text}\n`);

  process.exit(fails.length ? 1 : 0);
}

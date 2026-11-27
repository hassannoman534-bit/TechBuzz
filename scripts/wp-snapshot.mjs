#!/usr/bin/env node
/**
 * Captures the WordPress responses the blog needs into `.wp-cache/`, so the
 * site can be developed without calling the live CMS.
 *
 *   node scripts/wp-snapshot.mjs              capture from the default base
 *   node scripts/wp-snapshot.mjs <base-url>   capture from somewhere else
 *   node scripts/wp-snapshot.mjs --pages 3    how many archive pages to take
 *
 * ── When to run it ──────────────────────────────────────────────────────────
 *
 * Once, from a network the host's firewall is not blocking. If this machine's
 * address is currently banned by Imunify360 this script will fail exactly the
 * way the site does, because it is the address being refused rather than
 * anything about the request. A phone hotspot is usually enough to get a clean
 * capture; so is running it before the ban, or after the address is
 * whitelisted.
 *
 * Afterwards, put WP_SNAPSHOT=prefer in .env.local and the dev server stops
 * touching WordPress at all. That is also what keeps the address from being
 * banned again: the thing that gets a developer flagged is a hot reload loop
 * re-requesting half a megabyte of posts, not a person reading the site.
 *
 * The capture is a convenience, not a fixture: it is whatever the site was
 * serving that day, it is ignored by git, and production never reads it.
 */
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const pagesArg = args.indexOf("--pages");
const PAGES = pagesArg >= 0 ? Math.max(1, Number(args[pagesArg + 1]) || 1) : 2;
const BASE = (args.find((a) => a.startsWith("http")) ?? process.env.WP_BASE_URL ?? "https://techbuzz.com.pk").replace(/\/$/, "");
const API = `${BASE}/wp-json/wp/v2`;
const DIR = path.join(process.cwd(), ".wp-cache");
const PER_PAGE = 12; // POSTS_PER_PAGE in lib/wp.ts

// Must match lib/wp.ts, or the dev server will not find what this writes.
const KEPT_HEADERS = ["x-wp-totalpages", "x-wp-total"];
const HEADERS = {
  Accept: "application/json",
  // The same browser User-Agent the app sends. Node's default is rejected
  // outright by some security plugins.
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
};

const dim = (s) => `\x1b[2m${s}\x1b[0m`;
const g = (s) => `\x1b[32m${s}\x1b[0m`;
const r = (s) => `\x1b[31m${s}\x1b[0m`;

function fileFor(requestPath) {
  const slug = requestPath.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").slice(0, 48);
  const hash = createHash("sha1").update(requestPath).digest("hex").slice(0, 8);
  return path.join(DIR, `${slug || "root"}.${hash}.json`);
}

async function capture(requestPath) {
  const url = `${API}${requestPath}`;
  const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(30000) });
  const body = await res.text();
  if (!res.ok) {
    const blocked = /imunify|bot.?protection/i.test(body);
    throw Object.assign(new Error(`HTTP ${res.status} ${res.statusText}`), {
      blocked,
      detail: body.slice(0, 200).replace(/\s+/g, " "),
    });
  }
  const headers = {};
  for (const name of KEPT_HEADERS) {
    const value = res.headers.get(name);
    if (value !== null) headers[name] = value;
  }
  await mkdir(DIR, { recursive: true });
  await writeFile(
    fileFor(requestPath),
    JSON.stringify({ body, headers, capturedAt: new Date().toISOString(), path: requestPath }, null, 2),
    "utf8",
  );
  return { bytes: body.length, headers, body };
}

console.log(`\n  wp-snapshot  ${dim(BASE)}\n`);

let failed = 0;
const want = ["/categories?per_page=100&orderby=count&order=desc"];
for (let page = 1; page <= PAGES; page++) {
  want.push(`/posts?per_page=${PER_PAGE}&page=${page}&orderby=date&order=desc`);
}

let categoryIds = [];
for (const requestPath of want) {
  try {
    const { bytes, body } = await capture(requestPath);
    if (requestPath.startsWith("/categories")) {
      try {
        categoryIds = JSON.parse(body).map((c) => c.id).filter(Boolean);
      } catch {
        /* the archive still works without the per category captures */
      }
    }
    console.log(`  ${g("captured")}  ${requestPath.padEnd(58)} ${dim(`${(bytes / 1024).toFixed(0)} KB`)}`);
  } catch (err) {
    failed++;
    console.log(`  ${r("failed")}    ${requestPath}`);
    console.log(dim(`            ${err.message}${err.detail ? ` :: ${err.detail}` : ""}`));
    if (err.blocked) {
      console.log(
        `\n  ${r("This machine's IP is blocked by the host's firewall, not by WordPress.")}\n` +
          dim("  The API answers normally from other addresses. Either whitelist this IP in\n") +
          dim("  Imunify360 (cPanel, Security, Imunify360, Firewall, White List), or run this\n") +
          dim("  script from another network such as a phone hotspot.\n"),
      );
      process.exit(1);
    }
  }
}

// The category filter is URL driven, so each category's first page is its own
// request and needs its own capture to be usable offline.
for (const id of categoryIds) {
  const requestPath = `/posts?per_page=${PER_PAGE}&page=1&orderby=date&order=desc&categories=${id}`;
  try {
    const { bytes } = await capture(requestPath);
    console.log(`  ${g("captured")}  ${requestPath.padEnd(58)} ${dim(`${(bytes / 1024).toFixed(0)} KB`)}`);
  } catch (err) {
    failed++;
    console.log(`  ${r("failed")}    ${requestPath} ${dim(err.message)}`);
  }
}

console.log("");
if (failed) {
  console.log(`  ${r(`${failed} request(s) failed.`)} The rest were captured and are usable.\n`);
  process.exit(1);
}
console.log(`  ${g(`Captured into .wp-cache/`)}`);
console.log(dim("  Add WP_SNAPSHOT=prefer to .env.local to develop without calling WordPress.\n"));

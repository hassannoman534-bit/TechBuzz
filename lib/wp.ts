/**
 * WordPress as a headless CMS for /blog.
 *
 * techbuzz.com.pk stays the place the team writes. This module is the only
 * thing that talks to it, so a future move to MDX or another CMS replaces this
 * file and nothing else.
 *
 * Four things about that install, all verified against the live API. Do not
 * "simplify" any of them back:
 *
 *  1. `_embed` returns no `_embedded` object at all, in either the targeted
 *     (`_embed=wp:featuredmedia,author,wp:term`) or the plain (`_embed=1`)
 *     form. Featured image and author have to come from elsewhere.
 *  2. `/wp/v2/users` is blocked, so author ids cannot be resolved to names.
 *  3. `_fields` IS IGNORED. `?_fields=id` still returns all 28 keys of the
 *     post, including `content.rendered` and the whole `yoast_head` blob:
 *     about 47 KB per post, so a 12-post page is well over half a megabyte
 *     and WordPress has to build Yoast's JSON-LD for all twelve before it
 *     sends a byte. That is why the timeout here is generous and why the
 *     listing throws the article bodies away (see `toPost`).
 *  4. What does work: the featured image is in `yoast_head_json.og_image[0]`,
 *     the byline in `yoast_head_json.twitter_misc["Written by"]` and the
 *     reading time in `yoast_head_json.twitter_misc["Est. reading time"]`,
 *     all per post with no extra request. Category ids resolve against
 *     `/wp/v2/categories`, one cached call for the whole site.
 */

import { cacheLife } from "next/cache";

/** Override for staging or a CMS move. Production needs no env set. */
const WP_BASE = process.env.WP_BASE_URL ?? "https://techbuzz.com.pk";
const API = `${WP_BASE}/wp-json/wp/v2`;

/**
 * Generous because of quirk 3 above: an uncached 12-post page makes WordPress
 * render twelve Yoast schema graphs before responding. 15s was not enough on
 * a cold cache and produced a silent empty grid. Tune with WP_TIMEOUT_MS.
 */
const TIMEOUT_MS = Number(process.env.WP_TIMEOUT_MS ?? "25000") || 25000;

/**
 * Some managed WordPress hosts and security plugins (Wordfence, Sucuri,
 * Imunify360, and Cloudflare's bot rules) reject requests carrying Node's
 * default `undici` user agent, or no user agent at all, with a 403 that looks
 * exactly like an outage from here. This is our own site asking for our own
 * posts, so it identifies itself as a normal client.
 */
const HEADERS: Record<string, string> = {
  Accept: "application/json",
  "Accept-Language": "en-GB,en;q=0.9",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 TechBuzzSite/1.0",
};

export const POSTS_PER_PAGE = 12;

/* ------------------------------------------------------------------ types */

type YoastImage = { url?: string; width?: number; height?: number };

type YoastHead = {
  og_image?: YoastImage[];
  description?: string;
  twitter_misc?: Record<string, string>;
  og_description?: string;
  title?: string;
};

/** Only the fields actually read. The real payload is much larger. */
type RawPost = {
  id: number;
  slug: string;
  date: string;
  title?: { rendered?: string };
  excerpt?: { rendered?: string };
  content?: { rendered?: string };
  categories?: number[];
  yoast_head_json?: YoastHead;
};

type RawCategory = {
  id: number;
  name: string;
  slug: string;
  count: number;
};

export type BlogImage = {
  url: string;
  width: number;
  height: number;
  alt: string;
};

export type BlogPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  /**
   * Raw WordPress HTML, and empty string on the listing.
   *
   * The listing hands its posts to a client component, so anything kept here
   * is serialised into the RSC payload and shipped to the browser. Twelve
   * article bodies is roughly half a megabyte of HTML that the grid never
   * renders, so `getPosts` drops it and only `getPostBySlug` keeps it.
   */
  html: string;
  dateISO: string;
  dateLabel: string;
  /** Undefined when Yoast carries no byline. Never guessed. */
  author?: string;
  categoryIds: number[];
  categoryNames: string[];
  readMinutes: number;
  image?: BlogImage;
  description?: string;
};

export type BlogCategory = {
  id: number;
  name: string;
  slug: string;
  count: number;
};

export type PostsPage = {
  posts: BlogPost[];
  totalPages: number;
  total: number;
  /** True when the CMS could not be reached. The page renders an honest
   *  empty state instead of throwing, so a WordPress outage does not take
   *  the whole route down. */
  failed: boolean;
  /** One line naming the actual cause. Development only; never shown in
   *  production, where the user gets the neutral copy instead. */
  reason?: string;
};

/* -------------------------------------------------------------- utilities */

const NAMED: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  ndash: "–",
  mdash: "—",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  laquo: "«",
  raquo: "»",
  deg: "°",
  eacute: "é",
};

/**
 * WordPress returns titles and excerpts HTML encoded ("Advertising &amp; PPC",
 * "Google&#8217;s"). There is no DOM on the server, so decode by hand. Runs on
 * short strings only, never on article bodies.
 */
export function decodeEntities(input: string): string {
  return input
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) =>
      String.fromCodePoint(parseInt(h, 16)),
    )
    .replace(/&([a-z]+);/gi, (m, n: string) => NAMED[n.toLowerCase()] ?? m);
}

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function clip(input: string, max: number): string {
  if (input.length <= max) return input;
  const cut = input.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max).trimEnd()}…`;
}

/**
 * Yoast already computes a reading time and puts it in twitter_misc as
 * "9 minutes". Preferred over counting words, which would mean stripping tags
 * from 47 KB of HTML for every post on every page. Falls back to counting at
 * 220 wpm, the usual figure for screen reading of B2B prose.
 */
function readingMinutes(yoast: YoastHead | undefined, html: string): number {
  const stated = yoast?.twitter_misc?.["Est. reading time"];
  if (stated) {
    const n = parseInt(stated, 10);
    if (Number.isFinite(n) && n > 0) return n;
  }
  if (!html) return 1;
  const words = stripHtml(html).split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

/* ----------------------------------------------------------------- mapping */

function toImage(raw: RawPost): BlogImage | undefined {
  const og = raw.yoast_head_json?.og_image?.[0];
  if (!og?.url) return undefined;
  return {
    url: og.url,
    width: og.width && og.width > 0 ? og.width : 1200,
    height: og.height && og.height > 0 ? og.height : 675,
    alt: decodeEntities(stripHtml(raw.title?.rendered ?? "")),
  };
}

/**
 * @param keepHtml only the article route needs the body. See `BlogPost.html`.
 */
function toPost(
  raw: RawPost,
  categories: BlogCategory[],
  keepHtml: boolean,
): BlogPost {
  const html = raw.content?.rendered ?? "";
  const ids = raw.categories ?? [];
  const yoast = raw.yoast_head_json;
  const author = yoast?.twitter_misc?.["Written by"];
  const rawExcerpt = stripHtml(raw.excerpt?.rendered ?? "");

  return {
    id: raw.id,
    slug: raw.slug,
    title: decodeEntities(stripHtml(raw.title?.rendered ?? "")),
    excerpt: clip(decodeEntities(rawExcerpt), 180),
    html: keepHtml ? html : "",
    dateISO: raw.date,
    dateLabel: formatDate(raw.date),
    author: author ? decodeEntities(author) : undefined,
    categoryIds: ids,
    categoryNames: ids
      .map((id) => categories.find((c) => c.id === id)?.name)
      .filter((n): n is string => Boolean(n))
      .map(decodeEntities),
    readMinutes: readingMinutes(yoast, html),
    image: toImage(raw),
    description: yoast?.description
      ? decodeEntities(yoast.description)
      : undefined,
  };
}

/* ---------------------------------------------------------------- fetchers */

type Fetched = { res: Response | null; reason?: string };

/**
 * Turns a thrown fetch error into a line that names the actual cause, because
 * the generic "could not load" that the page shows is useless when something
 * really is broken. The code is what distinguishes a firewall from a dead DNS
 * record from an incomplete TLS chain, and Node reports all three the same way
 * to anyone who only catches the error.
 */
function describe(err: unknown): string {
  const e = err as { name?: string; message?: string; cause?: { code?: string } };
  const code = e?.cause?.code ?? e?.name ?? "unknown";

  switch (code) {
    case "TimeoutError":
      return `timed out after ${TIMEOUT_MS}ms (WordPress is slow to build this response, or the host is throttling)`;
    case "ENOTFOUND":
    case "EAI_AGAIN":
      return `DNS lookup failed for ${WP_BASE} (no network on this machine, or a VPN or split DNS is in the way)`;
    case "ECONNREFUSED":
      return "connection refused (nothing is listening, or the host firewalls this server's IP)";
    case "ECONNRESET":
      return "connection reset by the host (often a WAF dropping the request mid-flight)";
    case "UNABLE_TO_VERIFY_LEAF_SIGNATURE":
    case "SELF_SIGNED_CERT_IN_CHAIN":
    case "CERT_HAS_EXPIRED":
      return `TLS chain rejected (${code}). Browsers fetch the missing intermediate certificate for themselves and Node does not, so the site can look fine in Chrome and still fail here. Fix the chain on the host.`;
    default:
      return `${code}${e?.message ? `: ${e.message}` : ""}`;
  }
}

/**
 * One request, with a retry. Returns the response and, when it failed, a line
 * naming why.
 *
 * Never throws: a CMS outage degrades to an empty state rather than taking the
 * route down with it. But it does log, loudly, on the server. The previous
 * version swallowed every failure into a bare `catch {}`, which meant a 403
 * from the host's firewall and a genuinely empty blog looked identical in the
 * terminal.
 */
async function get(path: string): Promise<Fetched> {
  const url = `${API}${path}`;
  let reason = "unknown";

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(url, {
        headers: HEADERS,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

      if (res.ok) return { res };

      const body = await res.text().catch(() => "");
      reason = `HTTP ${res.status} ${res.statusText}${
        body ? ` :: ${body.slice(0, 180).replace(/\s+/g, " ")}` : ""
      }`;

      // A 4xx other than 429 will not change on a retry.
      if (res.status < 500 && res.status !== 429) break;
    } catch (err) {
      reason = describe(err);
    }

    if (attempt === 1) await new Promise((r) => setTimeout(r, 600));
  }

  console.error(
    `[wp] request failed\n     url:    ${url}\n     reason: ${reason}\n` +
      `     hint:   run \`node scripts/wp-doctor.mjs\` to find out which layer is refusing.`,
  );
  return { res: null, reason };
}

/**
 * Categories change at most a few times a year, so they sit on a long life and
 * every post mapping reads from this one result.
 */
export async function getCategories(): Promise<BlogCategory[]> {
  "use cache";
  cacheLife("days");

  const { res } = await get("/categories?per_page=100&orderby=count&order=desc");
  if (!res) return [];

  try {
    const raw = (await res.json()) as RawCategory[];
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((c) => c.count > 0)
      .map((c) => ({
        id: c.id,
        name: decodeEntities(c.name),
        slug: c.slug,
        count: c.count,
      }));
  } catch {
    console.error("[wp] /categories returned a body that is not JSON");
    return [];
  }
}

/**
 * One page of posts, optionally for one category.
 *
 * On an hour profile, so a post published in WordPress is live on the Next
 * site within the hour without a redeploy. The total page count comes from the
 * X-WP-TotalPages header rather than being inferred.
 */
export async function getPosts(
  page: number,
  categoryId?: number,
): Promise<PostsPage> {
  "use cache";
  cacheLife("hours");

  const categories = await getCategories();
  const params = new URLSearchParams({
    per_page: String(POSTS_PER_PAGE),
    page: String(Math.max(1, page)),
    orderby: "date",
    order: "desc",
  });
  if (categoryId) params.set("categories", String(categoryId));

  const { res, reason } = await get(`/posts?${params.toString()}`);
  if (!res) {
    return { posts: [], totalPages: 0, total: 0, failed: true, reason };
  }

  try {
    const raw = (await res.json()) as RawPost[];
    if (!Array.isArray(raw)) {
      return {
        posts: [],
        totalPages: 0,
        total: 0,
        failed: true,
        reason: "the posts endpoint returned an object where an array was expected",
      };
    }
    return {
      posts: raw.map((p) => toPost(p, categories, false)),
      totalPages: Number(res.headers.get("X-WP-TotalPages") ?? "1") || 1,
      total: Number(res.headers.get("X-WP-Total") ?? "0") || 0,
      failed: false,
    };
  } catch {
    return {
      posts: [],
      totalPages: 0,
      total: 0,
      failed: true,
      reason: "the posts endpoint returned a body that is not JSON",
    };
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  "use cache";
  cacheLife("hours");

  const categories = await getCategories();
  const { res } = await get(`/posts?slug=${encodeURIComponent(slug)}`);
  if (!res) return null;

  try {
    const raw = (await res.json()) as RawPost[];
    const found = Array.isArray(raw) ? raw[0] : undefined;
    return found ? toPost(found, categories, true) : null;
  } catch {
    return null;
  }
}

/** A few more from the same category, for the foot of an article. */
export async function getRelated(
  post: BlogPost,
  limit: number,
): Promise<BlogPost[]> {
  "use cache";
  cacheLife("hours");

  const primary = post.categoryIds[0];
  const { posts } = await getPosts(1, primary);
  return posts.filter((p) => p.slug !== post.slug).slice(0, limit);
}

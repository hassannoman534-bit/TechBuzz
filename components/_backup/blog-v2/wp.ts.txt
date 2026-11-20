/**
 * WordPress as a headless CMS for /blog.
 *
 * techbuzz.com.pk stays the place the team writes. This module is the only
 * thing that talks to it, so a future move to MDX or another CMS replaces this
 * file and nothing else.
 *
 * Two things that install does NOT support, both verified against the live
 * API before this was written, so do not "simplify" back to them:
 *  - `_embed` returns no `_embedded` object at all, in either the targeted
 *    (`_embed=wp:featuredmedia,author,wp:term`) or the plain (`_embed=1`)
 *    form. Featured image and author have to come from elsewhere.
 *  - `/wp/v2/users` is blocked, so author ids cannot be resolved to names.
 *
 * What works: the featured image is in `yoast_head_json.og_image[0]` and the
 * byline is in `yoast_head_json.twitter_misc["Written by"]`, both per post and
 * with no extra request. Category ids resolve against `/wp/v2/categories`,
 * which is one cached call for the whole site rather than one per post.
 */

import { cacheLife } from "next/cache";

/** Override for staging or a CMS move. Production needs no env set. */
const WP_BASE = process.env.WP_BASE_URL ?? "https://techbuzz.com.pk";
const API = `${WP_BASE}/wp-json/wp/v2`;

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
  /** Raw WordPress HTML. Only the article page renders it. */
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

/** 220 wpm, the usual figure for screen reading of B2B prose. */
function readingMinutes(html: string): number {
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

function toPost(raw: RawPost, categories: BlogCategory[]): BlogPost {
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
    html,
    dateISO: raw.date,
    dateLabel: formatDate(raw.date),
    author: author ? decodeEntities(author) : undefined,
    categoryIds: ids,
    categoryNames: ids
      .map((id) => categories.find((c) => c.id === id)?.name)
      .filter((n): n is string => Boolean(n))
      .map(decodeEntities),
    readMinutes: readingMinutes(html),
    image: toImage(raw),
    description: yoast?.description
      ? decodeEntities(yoast.description)
      : undefined,
  };
}

/* ---------------------------------------------------------------- fetchers */

/** 15s, so a slow CMS degrades to an empty state instead of hanging a render. */
async function get(path: string): Promise<Response | null> {
  try {
    const res = await fetch(`${API}${path}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15_000),
    });
    return res.ok ? res : null;
  } catch {
    return null;
  }
}

/**
 * Categories change at most a few times a year, so they sit on a long life and
 * every post mapping reads from this one result.
 */
export async function getCategories(): Promise<BlogCategory[]> {
  "use cache";
  cacheLife("days");

  const res = await get("/categories?per_page=100&orderby=count&order=desc");
  if (!res) return [];
  const raw = (await res.json()) as RawCategory[];
  return raw
    .filter((c) => c.count > 0)
    .map((c) => ({
      id: c.id,
      name: decodeEntities(c.name),
      slug: c.slug,
      count: c.count,
    }));
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
    _fields:
      "id,slug,date,title,excerpt,content,categories,yoast_head_json",
  });
  if (categoryId) params.set("categories", String(categoryId));

  const res = await get(`/posts?${params.toString()}`);
  if (!res) return { posts: [], totalPages: 0, total: 0, failed: true };

  const raw = (await res.json()) as RawPost[];
  return {
    posts: raw.map((p) => toPost(p, categories)),
    totalPages: Number(res.headers.get("X-WP-TotalPages") ?? "1") || 1,
    total: Number(res.headers.get("X-WP-Total") ?? "0") || 0,
    failed: false,
  };
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  "use cache";
  cacheLife("hours");

  const categories = await getCategories();
  const res = await get(
    `/posts?slug=${encodeURIComponent(slug)}&_fields=id,slug,date,title,excerpt,content,categories,yoast_head_json`,
  );
  if (!res) return null;
  const raw = (await res.json()) as RawPost[];
  const found = raw[0];
  return found ? toPost(found, categories) : null;
}

/** Newest slugs, for generateStaticParams. The long tail renders on demand. */
export async function getRecentSlugs(limit: number): Promise<string[]> {
  "use cache";
  cacheLife("hours");

  const res = await get(`/posts?per_page=${limit}&_fields=slug&orderby=date&order=desc`);
  if (!res) return [];
  const raw = (await res.json()) as { slug: string }[];
  return raw.map((p) => p.slug);
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

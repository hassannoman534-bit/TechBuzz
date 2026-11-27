/**
 * On-disk snapshots of WordPress responses, for development only.
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 *
 * The host runs Imunify360, and its bot protection bans by IP. A dev server is
 * a very convincing bot: every hot reload re-runs the page, each uncached
 * `/posts` call is over half a megabyte because this install ignores `_fields`,
 * and the requests all come from one address in a tight loop. Sooner or later
 * the firewall decides that address is scraping the site and starts answering
 * 403 to everything, including the browser.
 *
 * That is not a bug in the data layer, and nothing in the data layer can fix
 * it. What this can do is make the loop that causes it unnecessary: capture the
 * handful of responses the blog needs once, then develop against the capture.
 * WordPress is touched once a day instead of once a keystroke, which keeps the
 * address off the firewall's radar, and a ban that does happen stops being a
 * thing that blocks work.
 *
 * ── Modes ───────────────────────────────────────────────────────────────────
 *
 *   off     never read or write. The default in production, where responses are
 *           already held by `"use cache"` and the requests come from the host's
 *           own addresses rather than one developer's.
 *   on      record every success, and replay only when a request has failed.
 *           The default in development: WordPress is still the source of truth,
 *           and a 403 or an outage no longer empties the page.
 *   prefer  replay whenever a snapshot exists and never call WordPress at all.
 *           Use this while working on the blog's UI. It is also the setting
 *           that stops the address being banned again.
 *
 * Set WP_SNAPSHOT to pick one. The snapshots live in `.wp-cache/`, which is
 * ignored by git: they are a convenience, not fixtures to be committed, and
 * they contain whatever the live site happened to be serving that day.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type Snapshot = {
  /** The raw response body, exactly as WordPress sent it. */
  body: string;
  /**
   * Only the headers the blog actually reads. Pagination comes from
   * X-WP-TotalPages and X-WP-Total rather than being inferred, so a snapshot
   * that dropped them would replay as a one page archive.
   */
  headers: Record<string, string>;
  capturedAt: string;
  path: string;
};

export type SnapshotMode = "off" | "on" | "prefer";

function resolveMode(): SnapshotMode {
  const raw = process.env.WP_SNAPSHOT?.trim().toLowerCase();
  if (raw === "off" || raw === "on" || raw === "prefer") return raw;
  // Unset: on in development, off in production. Snapshots are a development
  // aid, and a production deploy silently serving a developer's week old
  // capture would be a far worse failure than an honest empty state.
  return process.env.NODE_ENV === "production" ? "off" : "on";
}

export const SNAPSHOT_MODE: SnapshotMode = resolveMode();

/** Headers worth keeping. Everything else is noise or varies per request. */
export const KEPT_HEADERS = ["x-wp-totalpages", "x-wp-total"] as const;

const DIR = path.join(process.cwd(), ".wp-cache");

/**
 * A stable filename per request path.
 *
 * The readable part is for whoever opens the folder; the hash is what makes it
 * unique, because query strings carry characters a filename cannot and two
 * different queries must never collide onto one file.
 */
function fileFor(requestPath: string): string {
  const slug = requestPath.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").slice(0, 48);
  const hash = createHash("sha1").update(requestPath).digest("hex").slice(0, 8);
  return path.join(DIR, `${slug || "root"}.${hash}.json`);
}

export async function readSnapshot(requestPath: string): Promise<Snapshot | null> {
  try {
    const raw = await readFile(fileFor(requestPath), "utf8");
    const snap = JSON.parse(raw) as Snapshot;
    return typeof snap?.body === "string" ? snap : null;
  } catch {
    // Missing or unreadable is the normal case, not an error worth reporting.
    return null;
  }
}

export async function writeSnapshot(requestPath: string, snap: Snapshot): Promise<void> {
  try {
    await mkdir(DIR, { recursive: true });
    await writeFile(fileFor(requestPath), JSON.stringify(snap, null, 2), "utf8");
  } catch {
    // A snapshot that cannot be written must never take a page down with it.
  }
}

/** Rebuilds a Response so callers cannot tell a replay from a live answer. */
export function snapshotToResponse(snap: Snapshot): Response {
  return new Response(snap.body, { status: 200, headers: snap.headers });
}

export function pickHeaders(headers: Headers): Record<string, string> {
  const out: Record<string, string> = {};
  for (const name of KEPT_HEADERS) {
    const value = headers.get(name);
    if (value !== null) out[name] = value;
  }
  return out;
}

"use client";

import Link from "next/link";
import { CloudOff, SearchX } from "lucide-react";
import { BLOG_COPY } from "./blog.config";

type BlogStateProps = {
  kind: "offline" | "empty";
  /** Development only. The real reason the fetch failed. */
  reason?: string;
};

/**
 * What the archive shows when it has nothing to show.
 *
 * The previous version was one grey sentence floating in a very tall empty
 * page, which read as a broken layout rather than a considered state. It also
 * gave a developer nothing to act on, so in development this surfaces the
 * actual failure and the command that diagnoses it.
 */
export function BlogState({ kind, reason }: BlogStateProps) {
  const offline = kind === "offline";
  const Icon = offline ? CloudOff : SearchX;
  const showReason = offline && process.env.NODE_ENV !== "production" && reason;

  return (
    <div className="flex min-h-[22rem] items-center justify-center px-6 py-16">
      <div className="relative w-full max-w-xl overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.025] p-10 text-center shadow-[inset_0_1px_0_0_rgb(255_255_255/0.06)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(90% 60% at 50% 0%, rgba(123,97,255,0.12), transparent 70%)",
          }}
        />

        <div className="relative flex flex-col items-center gap-4">
          <span className="flex size-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
            <Icon className="size-5 text-[#c9c2ff]" strokeWidth={1.6} />
          </span>

          <h2>
            <span className="font-footer-display text-[1.25rem] font-semibold text-white">
              {offline ? BLOG_COPY.offline : BLOG_COPY.empty}
            </span>
          </h2>

          <p className="font-footer-text max-w-[42ch] text-[0.9rem] leading-relaxed text-white/55">
            {offline ? BLOG_COPY.offlineHint : BLOG_COPY.emptyHint}
          </p>

          {!offline ? (
            <Link
              href="/blog"
              className="font-footer-text mt-2 rounded-full border border-white/15 bg-white/[0.05] px-5 py-2 text-[0.82rem] text-white transition-colors duration-300 hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b61ff]/50"
            >
              {BLOG_COPY.backToBlog}
            </Link>
          ) : null}

          {showReason ? (
            <div className="mt-4 w-full rounded-xl border border-[#7b61ff]/25 bg-[#7b61ff]/[0.06] p-4 text-left">
              <p className="font-footer-text text-[0.62rem] uppercase tracking-[0.2em] text-[#c9c2ff]/80">
                Development only
              </p>
              <p className="mt-2 break-words font-mono text-[0.76rem] leading-relaxed text-white/70">
                {reason}
              </p>
              <p className="mt-3 font-mono text-[0.72rem] text-[#7ce9ff]">
                node scripts/wp-doctor.mjs
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

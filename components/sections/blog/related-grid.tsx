"use client";

import { useState } from "react";
import type { BlogPost } from "@/lib/wp";
import { PostCard } from "./post-card";

type RelatedGridProps = { posts: BlogPost[] };

/**
 * The foot of an article reuses the grid card rather than a plainer variant,
 * so a reader who scrolls to the end meets the same object they clicked at the
 * top. Exists as a client component only to own the shared hover index, which
 * a server component cannot pass down.
 */
export function RelatedGrid({ posts }: RelatedGridProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {posts.map((post, i) => (
        <PostCard
          key={post.id}
          post={post}
          index={i}
          hovered={hovered}
          onHover={setHovered}
        />
      ))}
    </div>
  );
}

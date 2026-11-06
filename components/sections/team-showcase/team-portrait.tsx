import Image from "next/image";
import { cn } from "@/lib/utils";
import type { TeamMemberData } from "./team-library";
import { DISPLAY_FONT } from "./team-motion";

type TeamPortraitProps = {
  member: TeamMemberData;
  /** sizes hint for next/image */
  sizes: string;
  priority?: boolean;
  className?: string;
};

/**
 * The photo (or a monogram when no photo exists yet), filling its 4:5 parent.
 * Purely visual: dimming and hover live on the parent so the same piece works in the
 * slider and on the stage.
 */
export function TeamPortrait({ member, sizes, priority = false, className }: TeamPortraitProps) {
  if (member.image) {
    return (
      <Image
        src={member.image}
        alt=""
        fill
        sizes={sizes}
        priority={priority}
        draggable={false}
        className={cn("select-none object-cover", className)}
        style={{ objectPosition: "50% 22%" }}
      />
    );
  }

  return (
    <div
      aria-hidden
      className={cn("absolute inset-0 flex items-center justify-center", className)}
      style={{
        background:
          "radial-gradient(120% 90% at 30% 15%, rgba(123,97,255,0.32), transparent 60%), radial-gradient(90% 80% at 80% 100%, rgba(34,168,255,0.22), transparent 65%), #0a0f1d",
      }}
    >
      <span
        className="select-none font-extrabold uppercase text-white/80"
        style={{ fontFamily: DISPLAY_FONT, fontSize: "clamp(2rem, 28cqw, 9rem)", letterSpacing: "-0.04em" }}
      >
        {member.initials}
      </span>
    </div>
  );
}

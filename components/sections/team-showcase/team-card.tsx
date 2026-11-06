"use client";

import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { SocialIcon } from "@/components/sections/site-footer/social-icons";
import type { TeamMemberData } from "./team-library";
import { DISPLAY_FONT, EASE, TEXT_FONT } from "./team-motion";

type TeamCardProps = {
  member: TeamMemberData;
  index: number;
  total: number;
};

const pad = (n: number): string => String(n).padStart(2, "0");

/**
 * Small glass card under the portrait on the second click: team, name, full designation,
 * optional bio and links. Small and flat, so backdrop blur is fine here.
 */
export function TeamCard({ member, index, total }: TeamCardProps) {
  const { linkedin, email } = member.links ?? {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE, delay: 0.32 } }}
      exit={{ opacity: 0, y: 16, transition: { duration: 0.35, ease: EASE } }}
      className="pointer-events-auto absolute left-1/2 z-30 rounded-[20px] bg-white/[0.05] backdrop-blur-md"
      style={{
        x: "-50%",
        bottom: "clamp(1rem, 4svh, 2.25rem)",
        width: "min(92vw, 30rem)",
        padding: "clamp(1rem, 2.2vw, 1.4rem)",
        fontFamily: TEXT_FONT,
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.12), 0 24px 60px -24px rgba(0,0,0,0.8)",
      }}
    >
      <div className="flex items-center justify-between gap-4 whitespace-nowrap text-[0.65rem] uppercase tracking-[0.2em] text-white/45">
        <span>{member.team}</span>
        <span className="tabular-nums">
          {pad(index + 1)} / {pad(total)}
        </span>
      </div>

      <p className="mt-3 text-[clamp(1.1rem,2vw,1.4rem)] font-semibold leading-tight text-white" style={{ fontFamily: DISPLAY_FONT }}>
        {member.name}
      </p>
      <p className="mt-1 text-[0.9rem] text-[#7ce9ff]">{member.role}</p>

      {member.bio ? <p className="mt-3 line-clamp-3 text-[0.85rem] leading-relaxed text-white/60">{member.bio}</p> : null}

      {linkedin || email ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {linkedin ? (
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="magnetic"
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-white/[0.06] px-3.5 py-2 text-[0.78rem] text-white/80 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] transition-colors duration-300 hover:bg-white/[0.12] hover:text-white"
            >
              <SocialIcon name="linkedin" className="h-3.5 w-3.5" />
              LinkedIn
            </a>
          ) : null}
          {email ? (
            <a
              href={`mailto:${email}`}
              data-cursor="magnetic"
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-white/[0.06] px-3.5 py-2 text-[0.78rem] text-white/80 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] transition-colors duration-300 hover:bg-white/[0.12] hover:text-white"
            >
              <Mail aria-hidden className="h-3.5 w-3.5" />
              Email
            </a>
          ) : null}
        </div>
      ) : null}
    </motion.div>
  );
}

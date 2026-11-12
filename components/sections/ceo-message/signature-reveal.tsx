"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { ceoMessage, EASE } from "./ceo-message.config";

type SignatureRevealProps = {
  /** Gates the write on. */
  play: boolean;
  delay?: number;
  className?: string;
};

/**
 * The CEO's name written on, left to right.
 *
 * clip-path does the work rather than opacity, so the strokes appear in the order
 * a pen would lay them down instead of the whole word fading up at once. The rule
 * under it draws with the same curve, a beat later, like the flourish at the end.
 *
 * Caveat is already loaded for the site (--font-caveat, exposed as
 * font-signature-hand), so this costs no new font.
 */
export function SignatureReveal({
  play,
  delay = 0,
  className,
}: SignatureRevealProps): React.ReactElement {
  const reduce = useReducedMotionSafe();
  const hidden = { clipPath: "inset(0 100% 0 0)" };
  const shown = { clipPath: "inset(0 0% 0 0)" };

  return (
    <span className={cn("inline-flex flex-col items-start", className)}>
      <motion.span
        className="font-signature-hand block origin-left select-none text-[#c9c2ff]"
        style={{
          fontSize: "clamp(2.1rem,5.4vw,3.4rem)",
          fontWeight: 600,
          lineHeight: 1.05,
          transform: "rotate(-2.5deg)",
          paddingInline: "0.06em",
        }}
        initial={reduce ? { opacity: 0 } : hidden}
        animate={play ? (reduce ? { opacity: 1 } : shown) : reduce ? { opacity: 0 } : hidden}
        transition={{ duration: reduce ? 0.3 : 1.25, ease: EASE, delay: reduce ? 0 : delay }}
      >
        {ceoMessage.signature.name}
      </motion.span>

      <motion.span
        aria-hidden
        className="mt-1 block h-px w-[clamp(7rem,16vw,11rem)] origin-left"
        style={{
          background:
            "linear-gradient(90deg, rgba(201,194,255,0.75), rgba(123,97,255,0.35) 60%, rgba(3,7,18,0))",
          transform: "rotate(-2.5deg)",
        }}
        initial={{ scaleX: 0 }}
        animate={play ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: reduce ? 0.3 : 0.9, ease: EASE, delay: reduce ? 0 : delay + 0.5 }}
      />
    </span>
  );
}

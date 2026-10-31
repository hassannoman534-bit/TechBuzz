import {
  ClapperboardIcon,
  CodeXmlIcon,
  MegaphoneIcon,
  MonitorPlayIcon,
  PenToolIcon,
  SearchCheckIcon,
  Share2Icon,
  SparklesIcon,
  type LucideIcon,
} from "lucide-react";
import type { ServiceIcon } from "@/components/sections/pricing/pricing.config";

const ICONS: Record<ServiceIcon, LucideIcon> = {
  smm: Share2Icon,
  ads: MegaphoneIcon,
  content: ClapperboardIcon,
  brand: PenToolIcon,
  ai: SparklesIcon,
  seo: SearchCheckIcon,
  web: CodeXmlIcon,
  yt: MonitorPlayIcon,
};

type ServiceArtProps = { id: ServiceIcon; index: string; accent: [string, string] };

/**
 * Built in card art, used until a real image is set in the config. Pure CSS gradients and one icon,
 * so it costs nothing to render or animate.
 */
export function ServiceArt({ id, index, accent }: ServiceArtProps) {
  const Icon = ICONS[id];
  const [a, b] = accent;
  return (
    <div
      aria-hidden
      className="absolute inset-0 bg-[#080b18]"
      style={{
        backgroundImage: `radial-gradient(80% 60% at 18% 12%, ${a}59, transparent 70%), radial-gradient(70% 55% at 88% 92%, ${b}4d, transparent 72%), linear-gradient(160deg, #0d1124, #05070f)`,
      }}
    >
      {/* fine grid */}
      <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgb(255_255_255/0.12)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.12)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(90%_80%_at_50%_45%,#000,transparent)]" />
      {/* big faint index */}
      <span className="absolute -bottom-[0.12em] -right-[0.04em] font-footer-display text-[clamp(5rem,11vw,10rem)] font-semibold leading-none tracking-[-0.06em] text-white/[0.05]">
        {index}
      </span>
      {/* glass icon tile */}
      <div className="absolute left-1/2 top-[44%] grid size-[38%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[28%] bg-white/[0.04] shadow-[inset_0_1px_0_rgb(255_255_255/0.14),inset_0_0_0_1px_rgb(255_255_255/0.08),0_30px_60px_-20px_rgb(0_0_0/0.8)]">
        <div className="absolute inset-0 rounded-[inherit] opacity-60" style={{ background: `linear-gradient(140deg, ${a}33, transparent 55%, ${b}26)` }} />
        <Icon className="relative size-[42%] text-white/85" strokeWidth={1.25} />
      </div>
    </div>
  );
}

import { Play } from "lucide-react";
import { MetalButton } from "@/components/ui/MetalButton";

export const metadata = { robots: { index: false } };

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">{label}</p>
      <div className="flex flex-wrap items-center gap-6">{children}</div>
    </section>
  );
}

export default function MetalTestPage() {
  return (
    <main className="min-h-screen bg-[#030712] px-6 py-24 text-neutral-100">
      <div className="mx-auto flex max-w-4xl flex-col gap-12">
        <header>
          <h1 className="text-2xl font-semibold">MetalButton playground</h1>
          <p className="mt-1 text-sm text-neutral-500">Not linked anywhere · noindex</p>
        </header>

        <Row label="Presets · pill · size md">
          <MetalButton preset="chromatic">Chromatic</MetalButton>
          <MetalButton preset="silver">Silver</MetalButton>
          <MetalButton preset="gold">Gold</MetalButton>
        </Row>

        <Row label="Presets · size lg · rendered as links (href=#)">
          <MetalButton href="#" size="lg" preset="chromatic">Chromatic</MetalButton>
          <MetalButton href="#" size="lg" preset="silver">Silver</MetalButton>
          <MetalButton href="#" size="lg" preset="gold">Gold</MetalButton>
        </Row>

        <Row label="Sizes · chromatic">
          <MetalButton size="sm" preset="chromatic">Small</MetalButton>
          <MetalButton size="md" preset="chromatic">Medium</MetalButton>
          <MetalButton size="lg" preset="chromatic">Large</MetalButton>
        </Row>

        <Row label="Circle variant · Play icon">
          <MetalButton variant="circle" preset="chromatic" aria-label="Play"><Play className="size-4" /></MetalButton>
          <MetalButton variant="circle" preset="silver" aria-label="Play"><Play className="size-4" /></MetalButton>
          <MetalButton variant="circle" preset="gold" aria-label="Play"><Play className="size-4" /></MetalButton>
        </Row>

        <Row label="Modifiers · strength 0.5 · disableGlow · paused">
          <MetalButton preset="chromatic" strength={0.5}>strength 0.5</MetalButton>
          <MetalButton preset="chromatic" disableGlow>disableGlow</MetalButton>
          <MetalButton preset="chromatic" paused>paused</MetalButton>
        </Row>
      </div>
    </main>
  );
}

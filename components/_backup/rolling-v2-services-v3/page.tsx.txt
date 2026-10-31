import { TunnelHero } from "@/components/sections/tunnel-hero/tunnel-hero";
import { RollingStatement } from "@/components/sections/rolling-statement/rolling-statement";
import { SignatureReveal } from "@/components/sections/signature-reveal/signature-reveal";
import { ImpactReveal } from "@/components/sections/impact-reveal/impact-reveal";
import { ServicesAccordion } from "@/components/sections/services-accordion/services-accordion";
import { SiteFooter } from "@/components/sections/site-footer/site-footer";
export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#030712] overflow-x-clip">
      <main>
        <TunnelHero />
        <RollingStatement />
        <SignatureReveal showIntro={false} />
        <ImpactReveal overlapPrevious />
        {/* Impact's pinned stage already leaves space under its CTA, so drop Services' top padding (one side only) */}
        <ServicesAccordion className="pt-0" />
      </main>
      <SiteFooter />
    </div>
  );
}

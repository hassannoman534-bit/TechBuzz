import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { SignatureReveal } from "@/components/sections/signature-reveal/signature-reveal";
import { ImpactReveal } from "@/components/sections/impact-reveal/impact-reveal";
import { ServicesAccordion } from "@/components/sections/services-accordion/services-accordion";
export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#030712] overflow-x-clip">
      <Navbar />
      <main>
        <Hero />
        <SignatureReveal />
        <ImpactReveal />
        <ServicesAccordion />
      </main>
    </div>
  );
}

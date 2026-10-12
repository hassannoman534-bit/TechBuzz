import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { SignatureReveal } from "@/components/sections/signature-reveal/signature-reveal";
import FloatingCTASection from "@/components/FloatingCTASection";
import ServicesSection from "@/components/ServiceSection";
export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#030712] overflow-x-clip">
      <Navbar />
      <main>
        <Hero />
        <SignatureReveal />
        <FloatingCTASection />
        <ServicesSection />
      </main>
    </div>
  );
}

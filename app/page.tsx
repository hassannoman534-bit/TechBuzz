import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FloatingCTASection from "@/components/FloatingCTASection";
import ServicesSection from "@/components/ServiceSection";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#030712] overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <FloatingCTASection />
        <ServicesSection />
      </main>
    </div>
  );
}

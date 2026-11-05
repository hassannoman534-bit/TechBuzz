import type { Metadata } from "next";
import { ContactPage } from "@/components/sections/contact/contact-page";
import { SiteFooter } from "@/components/sections/site-footer/site-footer";

export const metadata: Metadata = {
  title: "Contact | TechBuzz",
  description: "Start a project with TechBuzz, a digital marketing and development agency in Lahore. WhatsApp, email or send us a brief.",
};

export default function Contact() {
  return (
    <main className="bg-[#030712]">
      <ContactPage />
      <SiteFooter />
    </main>
  );
}

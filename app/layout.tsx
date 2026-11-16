import type { Metadata } from "next";
import { Geist, Geist_Mono, Urbanist, Syne, Inter } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import CustomCursor from "@/components/ui/CustomCursor";
import Navbar from "@/components/Navbar";
import { HideOnScroll } from "@/components/ui/hide-on-scroll";
import { AtmosphereController } from "@/components/atmosphere/atmosphere-controller";
import { pretendard, newsreader, caveat, lexendGiga, outfit, interTight, montserrat } from "./fonts";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-urbanist",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-syne",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TechBuzz — Award-Winning Digital Agency",
  description: "Designing brands and experiences worth remembering.",
};

/**
 * montserrat is in the html className rather than only on the team page.
 *
 * useResolvedFont appends its probe to document.body, so a font variable
 * scoped to a section is invisible to it. Montserrat was scoped to the team
 * showcase wrapper, which meant both liquid surfaces on the CEO page asked for
 * var(--font-montserrat), got an undefined variable, and rasterised their word
 * in the body fallback instead of the Montserrat 800 the config asks for.
 * Revert by deleting one token here if the extra face is not wanted site wide.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${urbanist.variable} ${syne.variable} ${inter.variable} ${pretendard.variable} ${newsreader.variable} ${caveat.variable} ${lexendGiga.variable} ${outfit.variable} ${interTight.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="bg-void text-ink antialiased" suppressHydrationWarning>
        <div aria-hidden className="atmosphere" />
        <AtmosphereController />
        <HideOnScroll>
          <Navbar />
        </HideOnScroll>
        <SmoothScrollProvider>
          <main className="relative overflow-x-clip">{children}</main>
        </SmoothScrollProvider>
        <CustomCursor />
      </body>
    </html>
  );
}

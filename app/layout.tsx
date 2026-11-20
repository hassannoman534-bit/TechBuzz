import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import CustomCursor from "@/components/ui/CustomCursor";
import Navbar from "@/components/Navbar";
import { HideOnScroll } from "@/components/ui/hide-on-scroll";
import { AtmosphereController } from "@/components/atmosphere/atmosphere-controller";
import { pretendard, newsreader, caveat, lexendGiga, outfit, interTight, montserrat } from "./fonts";

/**
 * Self-hosted via @fontsource's variable woff2 files, through next/font/local
 * rather than next/font/google. See the long comment at the top of ./fonts.ts
 * for why: next/font/google depends on Turbopack reaching Google's font CDN
 * at build time, and on a host where that fails the build dies with "Module
 * not found: Can't resolve '@vercel/turbopack-next/internal/font/google/font'".
 * Do not move any of these back to next/font/google.
 */
const geistSans = localFont({
  src: "../node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: "../node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-geist-mono",
});

const urbanist = localFont({
  src: "../node_modules/@fontsource-variable/urbanist/files/urbanist-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-urbanist",
});

const syne = localFont({
  src: "../node_modules/@fontsource-variable/syne/files/syne-latin-wght-normal.woff2",
  weight: "400 800",
  variable: "--font-syne",
});

const inter = localFont({
  src: "../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  weight: "100 900",
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

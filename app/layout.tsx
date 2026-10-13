import type { Metadata } from "next";
import { Geist, Geist_Mono, Urbanist, Syne, Inter } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import CustomCursor from "@/components/ui/CustomCursor";
import { AtmosphereController } from "@/components/atmosphere/atmosphere-controller";
import { pretendard, newsreader, caveat, lexendGiga } from "./fonts";

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${urbanist.variable} ${syne.variable} ${inter.variable} ${pretendard.variable} ${newsreader.variable} ${caveat.variable} ${lexendGiga.variable} h-full antialiased`}
    >
      <body className="bg-void text-ink antialiased" suppressHydrationWarning>
        <div aria-hidden className="atmosphere" />
        <AtmosphereController />
        <SmoothScrollProvider>
          <main className="relative overflow-x-clip">{children}</main>
        </SmoothScrollProvider>
        <CustomCursor />
      </body>
    </html>
  );
}

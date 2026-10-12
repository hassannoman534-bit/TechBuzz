"use client";

import { ReactLenis } from "lenis/react";
import { useLenisSync } from "@/hooks/useLenisSync";

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

function LenisSyncInner({ children }: SmoothScrollProviderProps) {
  useLenisSync();
  return <>{children}</>;
}

export default function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.08,
        duration: 1.4,
        smoothWheel: true,
      }}
    >
      <LenisSyncInner>{children}</LenisSyncInner>
    </ReactLenis>
  );
}

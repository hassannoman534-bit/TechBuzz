"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Like framer-motion's useReducedMotion, but hydration-safe: the server cannot know the user's
 * preference, so the first client render must match the server (false). The real preference
 * is applied right after mount.
 */
export function useReducedMotionSafe(): boolean {
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? Boolean(prefersReduced) : false;
}

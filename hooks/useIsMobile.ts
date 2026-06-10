"use client";
import { useState, useEffect } from "react";

/**
 * Returns true when the viewport is narrower than `breakpoint` (default 768px).
 * Safe for SSR — always returns false on the server so hydration matches.
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return isMobile;
}

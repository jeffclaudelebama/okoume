"use client";

import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { motionTokens } from "@/lib/motion/tokens";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  return <AnimatePresence mode="wait" initial={false}><m.div key={pathname} initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -5 }} transition={{ duration: reducedMotion ? 0.12 : motionTokens.duration.standard, ease: motionTokens.ease.soft }}>{children}</m.div></AnimatePresence>;
}

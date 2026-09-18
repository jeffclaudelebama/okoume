"use client";

import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { motionTokens } from "@/lib/motion/tokens";

const SPLASH_KEY = "okoume-splash-seen";

export function OrganicSplash() {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!window.sessionStorage.getItem(SPLASH_KEY)) {
      window.sessionStorage.setItem(SPLASH_KEY, "true");
      const timer = window.setTimeout(() => setVisible(true), 0);
      return () => window.clearTimeout(timer);
    }
  }, []);

  return <AnimatePresence>{visible ? <m.div aria-hidden="true" className="fixed inset-0 z-50 grid place-items-center bg-black text-white" initial={{ opacity: 1 }} animate={reducedMotion ? { opacity: 0 } : { clipPath: "ellipse(84% 34% at 50% 0%)" }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0.14 : motionTokens.duration.signature, ease: motionTokens.ease.premium }} onAnimationComplete={() => setVisible(false)}><m.span initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: motionTokens.duration.standard, ease: motionTokens.ease.soft }} className="text-3xl font-black tracking-[-0.08em]">OKOUMÉ</m.span></m.div> : null}</AnimatePresence>;
}

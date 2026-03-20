"use client";

import type { ReactNode } from "react";
import { LazyMotion, domAnimation, MotionConfig } from "framer-motion";
import { DictionaryProvider } from "@/hooks/use-dictionary";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <DictionaryProvider>
      <MotionConfig reducedMotion="user">
        <LazyMotion features={domAnimation} strict>
          {children}
        </LazyMotion>
      </MotionConfig>
    </DictionaryProvider>
  );
}

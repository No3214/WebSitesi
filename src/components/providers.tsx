"use client";

import type { ReactNode } from "react";
import { DictionaryProvider } from "@/hooks/use-dictionary";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <DictionaryProvider>
      {children}
    </DictionaryProvider>
  );
}

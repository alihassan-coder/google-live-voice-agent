"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { personas, type NicheId, type Persona } from "@/lib/demo/personas";

type NicheContextValue = { niche: NicheId; persona: Persona; setNiche: (n: NicheId) => void };

const NicheContext = createContext<NicheContextValue | null>(null);

/** Holds the Roofing / Water damage choice and re-themes everything inside it. */
export function NicheProvider({ children }: { children: ReactNode }) {
  const [niche, setNiche] = useState<NicheId>("roofing");
  return (
    <NicheContext.Provider value={{ niche, persona: personas[niche], setNiche }}>
      <div data-niche={niche} className="min-h-full">
        {children}
      </div>
    </NicheContext.Provider>
  );
}

export function useNiche() {
  const ctx = useContext(NicheContext);
  if (!ctx) throw new Error("useNiche must be used inside <NicheProvider>");
  return ctx;
}

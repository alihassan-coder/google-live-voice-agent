"use client";

import { useEffect, useRef, type RefObject } from "react";
import { cx } from "@/components/ui/primitives";

const BARS = 24;

/**
 * Voice bars driven by requestAnimationFrame straight from the level ref.
 * No React state per frame: heights are written to the DOM directly.
 */
export function Waveform({
  levels,
  active,
  className,
}: {
  levels: RefObject<{ agent: number; caller: number }>;
  active: boolean;
  className?: string;
}) {
  const barsRef = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    let raf = 0;
    const smoothed = new Array<number>(BARS).fill(0);
    let agentSmooth = 0;
    let callerSmooth = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = (now - start) / 1000;
      const agent = active ? Math.min(1, (levels.current?.agent ?? 0) * 5) : 0;
      const caller = active ? Math.min(1, (levels.current?.caller ?? 0) * 6) : 0;
      agentSmooth += (agent - agentSmooth) * 0.25;
      callerSmooth += (caller - callerSmooth) * 0.25;
      const agentLeads = agentSmooth >= callerSmooth;
      const energy = Math.max(agentSmooth, callerSmooth);

      for (let i = 0; i < BARS; i++) {
        const el = barsRef.current[i];
        if (!el) continue;
        // Centre-weighted shape, with a little per-bar motion so it reads as speech.
        const centre = 1 - Math.abs(i - (BARS - 1) / 2) / (BARS / 2);
        const wobble = 0.55 + 0.45 * Math.sin(t * 9 + i * 1.7) * Math.sin(t * 4.3 + i * 0.6);
        const breathing = 0.08 + 0.05 * Math.sin(t * 1.6 + i * 0.35);
        const target = Math.max(breathing, energy * (0.35 + 0.65 * centre) * wobble);
        smoothed[i] += (target - smoothed[i]) * 0.3;
        el.style.transform = `scaleY(${Math.max(0.06, Math.min(1, smoothed[i]))})`;
        el.dataset.who = energy > 0.05 ? (agentLeads ? "agent" : "caller") : "idle";
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [levels, active]);

  return (
    <div aria-hidden className={cx("flex h-14 items-center justify-center gap-[5px]", className)}>
      {Array.from({ length: BARS }, (_, i) => (
        <span
          key={i}
          ref={(el) => {
            barsRef.current[i] = el;
          }}
          data-who="idle"
          className="h-full w-[4px] origin-center scale-y-[0.08] rounded-full bg-night-line transition-colors duration-200 data-[who=agent]:bg-accent data-[who=caller]:bg-night-ink-2"
        />
      ))}
    </div>
  );
}

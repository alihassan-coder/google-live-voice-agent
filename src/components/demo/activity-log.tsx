"use client";

import { AnimatePresence, motion } from "motion/react";
import { cx } from "@/components/ui/primitives";
import type { LogEntry } from "@/lib/demo/lead";

function offset(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

const dot: Record<NonNullable<LogEntry["tone"]>, string> = {
  info: "bg-line-2",
  good: "bg-good",
  warn: "bg-warn",
};

export function ActivityLog({ log }: { log: LogEntry[] }) {
  return (
    <div>
      <h4 className="font-mono text-[11px] font-medium tracking-[0.14em] text-ink-3 uppercase">Activity</h4>
      {log.length === 0 ? (
        <p className="mt-2 text-sm text-ink-3">Nothing yet.</p>
      ) : (
        <ol className="relative mt-3 space-y-2.5 before:absolute before:top-1 before:bottom-1 before:left-[3px] before:w-px before:bg-line">
          <AnimatePresence initial={false}>
            {log.map((entry, i) => (
              <motion.li
                key={`${entry.at}-${i}`}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative flex items-baseline gap-3 pl-5 text-sm"
              >
                <span className={cx("absolute top-[7px] left-0 size-[7px] rounded-full", dot[entry.tone ?? "info"])} />
                <span className="w-11 shrink-0 font-mono text-xs tabular text-ink-3">{offset(entry.at)}</span>
                <span className={cx("text-ink-2", entry.tone === "good" && "text-ink")}>{entry.text}</span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>
      )}
    </div>
  );
}

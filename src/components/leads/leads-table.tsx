"use client";

import { AnimatePresence, motion } from "motion/react";
import { cx } from "@/components/ui/primitives";
import { useNow, type CallRecord } from "@/lib/demo/call-records";
import {
  SourceTag,
  StatusBadge,
  TradeBadge,
  UrgencyBadge,
  appointmentText,
  formatWhen,
  isAfterHours,
} from "./lead-badges";

/** A value that flashes when it first appears. While the call is live, empty values read "Listening…". */
function LiveValue({
  value,
  live,
  className,
  empty = "—",
}: {
  value?: string | null;
  live: boolean;
  className?: string;
  empty?: string;
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {value ? (
        <motion.span
          key={value}
          initial={{ opacity: 0, backgroundColor: "var(--accent-soft)" }}
          animate={{ opacity: 1, backgroundColor: "rgba(0,0,0,0)" }}
          transition={{ opacity: { duration: 0.2 }, backgroundColor: { duration: 1.4, delay: 0.3 } }}
          className={cx("-mx-1 inline rounded px-1 box-decoration-clone", className)}
        >
          {value}
        </motion.span>
      ) : live ? (
        <motion.span key="listening" className="inline-flex items-center gap-1 text-[13px] text-ink-3 italic">
          <Dots />
          Listening
        </motion.span>
      ) : (
        <motion.span key="empty" className="text-ink-3">
          {empty}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

function Dots() {
  return (
    <span className="inline-flex gap-0.5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1 animate-pulse rounded-full bg-ink-3"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </span>
  );
}

function When({ record, now }: { record: CallRecord; now: number }) {
  return (
    <div className="min-w-[7.5rem]">
      <p className="text-[13px] whitespace-nowrap text-ink">{formatWhen(record.at, now)}</p>
      <div className="mt-1 flex flex-wrap items-center gap-1.5">
        <SourceTag source={record.source} />
        {record.source === "example" && isAfterHours(record.at) && (
          <span className="font-mono text-[10px] tracking-wide text-ink-3 uppercase">After hours</span>
        )}
      </div>
    </div>
  );
}

function isActive(r: CallRecord) {
  return r.state === "live" || r.state === "ringing";
}

export function LeadsTable({
  records,
  onSelect,
  emptyText = "No calls match.",
}: {
  records: CallRecord[];
  onSelect?: (id: string) => void;
  emptyText?: string;
}) {
  const now = useNow();

  // Dates depend on the browser's time zone, so render them only once it's known.
  if (!now) {
    return (
      <div aria-busy className="space-y-2 rounded-2xl border border-line bg-card p-4 shadow-card">
        {Array.from({ length: Math.min(records.length, 5) || 1 }, (_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-paper-2/70" />
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return <p className="rounded-2xl border border-dashed border-line-2 px-5 py-10 text-center text-sm text-ink-3">{emptyText}</p>;
  }

  return (
    <>
      {/* Desktop: a real table */}
      <div className="hidden overflow-hidden rounded-2xl border border-line bg-card shadow-card md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-paper-2/60">
            <tr className="font-mono text-[11px] tracking-[0.1em] text-ink-3 uppercase">
              <th scope="col" className="px-4 py-3 font-medium">When</th>
              <th scope="col" className="px-4 py-3 font-medium">Caller</th>
              <th scope="col" className="px-4 py-3 font-medium">Problem</th>
              <th scope="col" className="px-4 py-3 font-medium">Urgency</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
              <th scope="col" className="px-4 py-3 font-medium">Appointment</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {records.map((r) => {
                const live = isActive(r);
                return (
                  <motion.tr
                    key={r.id}
                    layout="position"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    onClick={onSelect ? () => onSelect(r.id) : undefined}
                    className={cx(
                      "border-b border-line/70 align-top transition-colors last:border-b-0",
                      live ? "bg-accent-soft/45 shadow-[inset_3px_0_0_var(--accent)]" : r.source !== "example" && "animate-row-in",
                      onSelect && "cursor-pointer hover:bg-paper-2/70",
                    )}
                  >
                    <td className="px-4 py-3.5">
                      <When record={r} now={now} />
                    </td>
                    <td className="px-4 py-3.5">
                      {onSelect ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(r.id);
                          }}
                          className="text-left font-medium text-ink hover:underline hover:decoration-line-2 hover:underline-offset-4"
                        >
                          <LiveValue value={r.lead.name} live={live} />
                        </button>
                      ) : (
                        <span className="font-medium text-ink">
                          <LiveValue value={r.lead.name} live={live} />
                        </span>
                      )}
                      <p className="mt-0.5 text-[13px] text-ink-3">
                        <LiveValue value={r.lead.address} live={false} empty={live ? "" : "—"} />
                      </p>
                      <div className="mt-1.5">
                        <TradeBadge niche={r.niche} />
                      </div>
                    </td>
                    <td className="max-w-[16rem] px-4 py-3.5">
                      <p className="text-ink">
                        <LiveValue value={r.lead.issue} live={live} />
                      </p>
                      <p className="mt-0.5 text-[13px] text-ink-3">
                        <LiveValue value={r.lead.detail} live={false} empty="" />
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      {r.lead.urgency ? (
                        <UrgencyBadge level={r.lead.urgency.level} />
                      ) : (
                        <LiveValue value={null} live={live} />
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge record={r} />
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-ink-2">
                      <LiveValue value={appointmentText(r)} live={live} empty="Not booked" />
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Phone: stacked cards */}
      <ul className="space-y-3 md:hidden">
        <AnimatePresence initial={false}>
          {records.map((r) => {
            const live = isActive(r);
            return (
              <motion.li
                key={r.id}
                layout="position"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cx(
                  "rounded-2xl border bg-card p-4 shadow-card",
                  live ? "border-accent bg-accent-soft/40" : "border-line",
                )}
              >
                <button
                  type="button"
                  disabled={!onSelect}
                  onClick={onSelect ? () => onSelect(r.id) : undefined}
                  className="block w-full text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-ink">
                        <LiveValue value={r.lead.name} live={live} />
                      </p>
                      <p className="mt-0.5 truncate text-[13px] text-ink-3">{r.lead.address ?? ""}</p>
                    </div>
                    <StatusBadge record={r} />
                  </div>
                  <p className="mt-3 text-[15px] text-ink">
                    <LiveValue value={r.lead.issue} live={live} />
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <TradeBadge niche={r.niche} />
                    <UrgencyBadge level={r.lead.urgency?.level} />
                    <SourceTag source={r.source} />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-line/70 pt-3 text-[13px]">
                    <span className="text-ink-3">{formatWhen(r.at, now)}</span>
                    <span className="text-right text-ink-2">{appointmentText(r) ?? (live ? "" : "Not booked")}</span>
                  </div>
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </>
  );
}

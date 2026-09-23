"use client";

import { AnimatePresence, motion } from "motion/react";
import { cx } from "@/components/ui/primitives";
import type { CallController } from "@/lib/demo/call-types";
import { fieldLabels, type Lead, type LeadField, type Urgency } from "@/lib/demo/lead";
import type { Persona } from "@/lib/demo/personas";
import { ActivityLog } from "./activity-log";

const FIELDS: LeadField[] = ["name", "address", "issue", "detail", "insurance", "callback"];

const insuranceText = { yes: "Yes — claim", no: "No — paying direct", unsure: "Not sure yet" } as const;

const urgencyStyle: Record<Urgency, { chip: string; label: string }> = {
  emergency: { chip: "bg-warn-soft text-warn ring-warn/25", label: "Emergency" },
  urgent: { chip: "bg-amber-soft text-amber ring-amber/25", label: "Urgent" },
  routine: { chip: "bg-good-soft text-good ring-good/25", label: "Routine" },
};

function SectionTitle({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h4 className="font-mono text-[11px] font-medium tracking-[0.14em] text-ink-3 uppercase">{children}</h4>
      {aside}
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="grid grid-cols-[92px_1fr] items-start gap-3 border-b border-line/70 py-2.5 last:border-b-0 sm:grid-cols-[110px_1fr]">
      <dt className="pt-0.5 text-[13px] text-ink-3">{label}</dt>
      <dd className="min-w-0">
        <AnimatePresence mode="wait" initial={false}>
          {value ? (
            <motion.span
              key={value}
              initial={{ opacity: 0, backgroundColor: "var(--accent-soft)" }}
              animate={{ opacity: 1, backgroundColor: "rgba(0,0,0,0)" }}
              transition={{ opacity: { duration: 0.2 }, backgroundColor: { duration: 1.4, delay: 0.3 } }}
              className="-mx-1.5 inline-block rounded px-1.5 text-[15px] leading-snug break-words text-ink"
            >
              {value}
            </motion.span>
          ) : (
            <motion.span
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 block h-[6px] w-24 rounded-full border border-dashed border-line-2"
              aria-label="not captured yet"
            />
          )}
        </AnimatePresence>
      </dd>
    </div>
  );
}

function valueFor(lead: Lead, field: LeadField) {
  if (field === "insurance") return lead.insurance ? insuranceText[lead.insurance] : undefined;
  return lead[field];
}

export function OwnerPanel({ call, persona }: { call: CallController; persona: Persona }) {
  const { lead, log, status } = call;
  const started = status !== "idle" && status !== "error";
  const booked = lead.booked;

  return (
    <div className="rounded-[22px] border border-line bg-card shadow-lift">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <p className="font-display text-lg leading-tight text-ink">What {persona.ownerName} sees, live</p>
          <p className="mt-0.5 text-[13px] text-ink-3">{persona.business} · owner dashboard</p>
        </div>
        <span
          className={cx(
            "flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px]",
            status === "live" ? "bg-good-soft text-good" : "bg-paper-2 text-ink-3",
          )}
        >
          <span className={cx("size-1.5 rounded-full", status === "live" ? "bg-good" : "bg-line-2")} />
          {status === "live" ? "Syncing" : status === "ended" ? "Saved" : "Waiting"}
        </span>
      </div>

      {!started && log.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="mx-auto max-w-xs text-[15px] text-ink-2">As the caller talks, this fills in on its own.</p>
          <p className="mx-auto mt-2 max-w-xs text-sm text-ink-3">
            Name, address, what happened, how urgent it is, and the booked inspection — before anyone at the office wakes up.
          </p>
          <dl className="mx-auto mt-6 max-w-sm text-left opacity-60">
            {FIELDS.slice(0, 3).map((f) => (
              <FieldRow key={f} label={f === "detail" ? persona.detailLabel : fieldLabels[f]} />
            ))}
          </dl>
        </div>
      ) : (
        <div className="grid gap-6 p-5 md:grid-cols-2 md:gap-x-8">
          {/* Lead card */}
          <div className="md:col-span-2">
            <SectionTitle
              aside={
                <AnimatePresence>
                  {lead.urgency && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={cx(
                        "rounded-full px-2.5 py-1 text-xs font-medium ring-1",
                        urgencyStyle[lead.urgency.level].chip,
                      )}
                    >
                      {urgencyStyle[lead.urgency.level].label}
                    </motion.span>
                  )}
                </AnimatePresence>
              }
            >
              New lead
            </SectionTitle>
            {lead.urgency?.reason && <p className="mt-1 text-[13px] text-ink-3">{lead.urgency.reason}</p>}
            <dl aria-live="polite" aria-label="Lead details" className="mt-2">
              {FIELDS.map((f) => (
                <FieldRow key={f} label={f === "detail" ? persona.detailLabel : fieldLabels[f]} value={valueFor(lead, f)} />
              ))}
            </dl>
          </div>

          {/* Calendar */}
          <div>
            <SectionTitle>Calendar</SectionTitle>
            {lead.slots?.length ? (
              <ul className="mt-3 space-y-2">
                {lead.slots.map((slot) => {
                  const isBooked = booked?.id === slot.id;
                  return (
                    <motion.li
                      key={slot.id}
                      layout
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: booked && !isBooked ? 0.45 : 1, y: 0 }}
                      className={cx(
                        "flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm",
                        isBooked ? "border-accent bg-accent-soft text-ink" : "border-line bg-paper/60 text-ink-2",
                      )}
                    >
                      <span className="min-w-0">
                        <span className={cx("block font-medium", slot.tonight && "text-warn")}>
                          {slot.tonight ? "Dispatch · " : ""}
                          {slot.day}
                        </span>
                        <span className="font-mono text-xs text-ink-3">{slot.tonight ? slot.label : slot.time}</span>
                      </span>
                      {isBooked && (
                        <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-accent-strong">
                          <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Booked
                        </span>
                      )}
                    </motion.li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-ink-3">Open slots appear once the problem and address are known.</p>
            )}
          </div>

          {/* Owner SMS */}
          <div>
            <SectionTitle>Text to {persona.ownerName}</SectionTitle>
            <AnimatePresence mode="wait">
              {lead.ownerText ? (
                <motion.div
                  key="sms"
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="mt-3 rounded-2xl bg-paper-2 p-3"
                >
                  <p className="font-mono text-[10px] tracking-wide text-ink-3 uppercase">
                    Messages · just now
                  </p>
                  <p className="mt-2 rounded-2xl rounded-tl-sm bg-card px-3 py-2 text-sm leading-snug text-ink shadow-card">
                    New lead: {lead.ownerText}
                    {booked && <span className="block pt-1 text-ink-2">Booked · {booked.label}</span>}
                  </p>
                </motion.div>
              ) : (
                <motion.p key="none" className="mt-2 text-sm text-ink-3">
                  Sent automatically when the job is booked.
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="border-t border-line pt-5 md:col-span-2">
            <ActivityLog log={log} />
          </div>
        </div>
      )}
    </div>
  );
}

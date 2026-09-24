"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { buttonClass } from "@/components/ui/primitives";
import { useNow, type CallRecord } from "@/lib/demo/call-records";
import { fieldLabels, type LeadField } from "@/lib/demo/lead";
import { personas } from "@/lib/demo/personas";
import { StatusBadge, TradeBadge, UrgencyBadge, appointmentText, formatDuration, formatWhen } from "./lead-badges";

const FIELDS: LeadField[] = ["name", "address", "issue", "detail", "insurance", "callback"];
const insuranceText = { yes: "Yes — insurance claim", no: "No — paying direct", unsure: "Not sure yet" } as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line px-5 py-5">
      <h3 className="font-mono text-[11px] font-medium tracking-[0.14em] text-ink-3 uppercase">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function LeadDrawer({ record, onClose }: { record: CallRecord; onClose: () => void }) {
  const now = useNow();
  const closeRef = useRef<HTMLButtonElement>(null);
  const transcriptEnd = useRef<HTMLDivElement>(null);
  const persona = personas[record.niche];
  const { lead } = record;

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (record.state === "live") transcriptEnd.current?.scrollIntoView({ block: "nearest" });
  }, [record.state, record.transcript.length]);

  const value = (f: LeadField) => (f === "insurance" ? (lead.insurance ? insuranceText[lead.insurance] : undefined) : lead[f]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal aria-labelledby="lead-drawer-title">
      <motion.button
        type="button"
        aria-label="Close details"
        tabIndex={-1}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-ink/35 backdrop-blur-[2px]"
      />
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 320 }}
        className="relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-card shadow-lift"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-line bg-card/95 px-5 py-4 backdrop-blur">
          <div className="min-w-0">
            <p id="lead-drawer-title" className="font-display text-xl leading-tight text-ink">
              {lead.name ?? "New caller"}
            </p>
            <p className="mt-1 text-[13px] text-ink-3">
              {persona.business} · {formatWhen(record.at, now)}
              {record.duration > 0 && ` · ${formatDuration(record.duration)} call`}
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <StatusBadge record={record} />
              <TradeBadge niche={record.niche} />
              <UrgencyBadge level={lead.urgency?.level} />
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-ink-2 hover:bg-paper-2 hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {lead.urgency?.reason && (
          <p className="mx-5 mt-4 rounded-xl bg-paper-2 px-3.5 py-2.5 text-sm text-ink-2">
            <span className="font-medium text-ink">Why: </span>
            {lead.urgency.reason}
          </p>
        )}

        <Section title="Lead details">
          <dl>
            {FIELDS.map((f) => (
              <div key={f} className="grid grid-cols-[104px_1fr] gap-3 border-b border-line/70 py-2.5 last:border-b-0">
                <dt className="text-[13px] text-ink-3">{f === "detail" ? persona.detailLabel : fieldLabels[f]}</dt>
                <dd className="text-[15px] text-ink">{value(f) ?? <span className="text-ink-3">—</span>}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section title="Appointment">
          {lead.booked ? (
            <p className="flex items-center gap-2 rounded-xl border border-accent bg-accent-soft px-3.5 py-3 text-[15px] font-medium text-ink">
              <svg viewBox="0 0 24 24" className="size-5 text-accent-strong" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
                <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
                <path d="M3.5 10h17M8 3v4M16 3v4" strokeLinecap="round" />
              </svg>
              {appointmentText(record)}
            </p>
          ) : (
            <p className="text-sm text-ink-3">
              {record.state === "live" ? "Not booked yet — the call is still going." : "Not booked. Call this lead back."}
            </p>
          )}
        </Section>

        <Section title={`Text sent to ${persona.ownerName}`}>
          {lead.ownerText ? (
            <p className="rounded-2xl rounded-tl-sm bg-paper-2 px-3.5 py-2.5 text-sm leading-snug text-ink">
              New lead: {lead.ownerText}
            </p>
          ) : (
            <p className="text-sm text-ink-3">Sent automatically once the job is booked.</p>
          )}
        </Section>

        <Section title="Call transcript">
          {record.transcript.length > 0 ? (
            <div className="space-y-2.5">
              {record.transcript.map((line, i) => (
                <div key={i} className={line.role === "caller" ? "flex flex-col items-end" : "flex flex-col items-start"}>
                  <span className="mb-0.5 font-mono text-[10px] tracking-[0.12em] text-ink-3 uppercase">
                    {line.role === "agent" ? persona.agentName : "Caller"}
                  </span>
                  <p
                    className={
                      line.role === "agent"
                        ? "max-w-[88%] rounded-2xl rounded-tl-sm bg-paper-2 px-3 py-2 text-sm text-ink"
                        : "max-w-[88%] rounded-2xl rounded-tr-sm bg-accent-soft px-3 py-2 text-sm text-ink"
                    }
                  >
                    {line.text}
                  </p>
                </div>
              ))}
              <div ref={transcriptEnd} />
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-line-2 px-4 py-5 text-center">
              <p className="text-sm text-ink-2">
                {record.source === "example"
                  ? "This is an example lead, so there's no recording."
                  : "The transcript appears here as the call goes."}
              </p>
              {record.source === "example" && (
                <Link href="/demo" className={`${buttonClass("secondary", "md")} mt-3`}>
                  Make a call to see one
                </Link>
              )}
            </div>
          )}
        </Section>
      </motion.aside>
    </div>
  );
}

"use client";

import { AnimatePresence } from "motion/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button, cx } from "@/components/ui/primitives";
import { clearSavedCalls, useCallRecords, type CallRecord } from "@/lib/demo/call-records";
import { personas, type NicheId } from "@/lib/demo/personas";
import { LeadDrawer } from "./lead-drawer";
import { LeadsTable } from "./leads-table";

function useSelected(records: CallRecord[]) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? records.find((r) => r.id === selectedId) : undefined;
  const drawer = (
    <AnimatePresence>
      {selected && <LeadDrawer key={selected.id} record={selected} onClose={() => setSelectedId(null)} />}
    </AnimatePresence>
  );
  return { select: setSelectedId, drawer };
}

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function Stat({ label, value, hint, tone }: { label: string; value: string; hint: string; tone?: "good" | "warn" }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-4 shadow-card sm:p-5">
      <p className="text-[13px] text-ink-3">{label}</p>
      <p
        className={cx(
          "mt-1 font-display text-3xl leading-none tabular sm:text-4xl",
          tone === "good" ? "text-good" : tone === "warn" ? "text-warn" : "text-ink",
        )}
      >
        {value}
      </p>
      <p className="mt-2 text-xs text-ink-3">{hint}</p>
    </div>
  );
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ id: T; label: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-full border border-line bg-paper-2 p-1">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={cx(
            "h-8 rounded-full px-3.5 text-sm font-medium whitespace-nowrap transition-colors duration-150",
            value === o.id ? "bg-card text-ink shadow-card" : "text-ink-3 hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

type TradeFilter = "all" | NicheId;
type StatusFilter = "all" | "booked" | "callback";

export function LeadsDashboard() {
  const records = useCallRecords();
  const { select, drawer } = useSelected(records);
  const [trade, setTrade] = useState<TradeFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");

  const stats = useMemo(() => {
    const booked = records.filter((r) => r.state === "booked");
    return {
      answered: records.filter((r) => r.state !== "ringing").length,
      booked: booked.length,
      emergencies: records.filter((r) => r.lead.urgency?.level === "emergency").length,
      value: booked.reduce((sum, r) => sum + personas[r.niche].jobValue, 0),
    };
  }, [records]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter((r) => {
      if (trade !== "all" && r.niche !== trade) return false;
      if (status !== "all" && r.state !== status) return false;
      if (!q) return true;
      return [r.lead.name, r.lead.address, r.lead.issue, r.lead.detail].some((v) => v?.toLowerCase().includes(q));
    });
  }, [records, trade, status, query]);

  const hasOwnCalls = records.some((r) => r.source !== "example" && r.state !== "live" && r.state !== "ringing");

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat label="Calls answered" value={String(stats.answered)} hint="Every call picked up — none sent to voicemail" />
        <Stat label="Jobs booked" value={String(stats.booked)} hint="Inspection or visit on the calendar" tone="good" />
        <Stat label="Emergencies" value={String(stats.emergencies)} hint="Flagged so you see them first" tone="warn" />
        <Stat label="Booked job value" value={money.format(stats.value)} hint="Estimated, at your average job size" />
      </div>

      <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Segmented<TradeFilter>
            label="Filter by trade"
            value={trade}
            onChange={setTrade}
            options={[
              { id: "all", label: "All trades" },
              { id: "roofing", label: personas.roofing.label },
              { id: "water", label: personas.water.label },
            ]}
          />
          <Segmented<StatusFilter>
            label="Filter by status"
            value={status}
            onChange={setStatus}
            options={[
              { id: "all", label: "All" },
              { id: "booked", label: "Booked" },
              { id: "callback", label: "Call back" },
            ]}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="relative block flex-1 lg:w-64 lg:flex-none">
            <span className="sr-only">Search leads</span>
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-3"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              aria-hidden
            >
              <circle cx="11" cy="11" r="6.5" />
              <path d="M20 20l-4-4" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, address, problem"
              className="h-10 w-full rounded-full border border-line bg-card pr-4 pl-10 text-sm text-ink placeholder:text-ink-3 focus:border-line-2 focus:outline-none"
            />
          </label>
          {hasOwnCalls && (
            <Button variant="ghost" onClick={clearSavedCalls} className="shrink-0">
              Clear my calls
            </Button>
          )}
        </div>
      </div>

      <p className="mt-4 text-[13px] text-ink-3">
        Rows marked <span className="font-mono text-[11px] uppercase">Example</span> are sample data. Calls you make on the{" "}
        <Link href="/demo" className="text-ink underline decoration-line-2 underline-offset-4 hover:decoration-ink">
          Live call
        </Link>{" "}
        page show up here at the top. Click any row for the full details.
      </p>

      <div className="mt-4">
        <LeadsTable
          records={shown}
          onSelect={select}
          emptyText="No leads match these filters."
        />
      </div>
      {drawer}
    </div>
  );
}

/** The newest few leads, for the demo and home pages. A call in progress sits at the top and fills in live. */
export function RecentLeads({ limit = 5 }: { limit?: number }) {
  const records = useCallRecords();
  const { select, drawer } = useSelected(records);
  return (
    <>
      <LeadsTable records={records.slice(0, limit)} onSelect={select} />
      {drawer}
    </>
  );
}

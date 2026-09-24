import { cx } from "@/components/ui/primitives";
import type { CallRecord } from "@/lib/demo/call-records";
import type { Urgency } from "@/lib/demo/lead";
import { personas, type NicheId } from "@/lib/demo/personas";

export function formatDuration(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** "Just now", "12 min ago", "Yesterday, 9:47 PM", "Mon, 2:13 AM". Empty until the browser clock is known. */
export function formatWhen(at: number, now: number) {
  if (!now) return "";
  const diff = now - at;
  if (diff < 60_000) return "Just now";
  if (diff < 60 * 60_000) return `${Math.floor(diff / 60_000)} min ago`;
  const time = new Date(at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const day = new Date(at);
  const today = new Date(now);
  const yesterday = new Date(now);
  yesterday.setDate(today.getDate() - 1);
  if (day.toDateString() === today.toDateString()) return `Today, ${time}`;
  if (day.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`;
  return `${day.toLocaleDateString("en-US", { weekday: "short" })}, ${time}`;
}

export function isAfterHours(at: number) {
  const h = new Date(at).getHours();
  const weekend = new Date(at).getDay() === 0;
  return weekend || h >= 18 || h < 8;
}

const urgencyStyle: Record<Urgency, { chip: string; dot: string; label: string }> = {
  emergency: { chip: "bg-warn-soft text-warn ring-warn/20", dot: "bg-warn", label: "Emergency" },
  urgent: { chip: "bg-amber-soft text-amber ring-amber/20", dot: "bg-amber", label: "Urgent" },
  routine: { chip: "bg-good-soft text-good ring-good/20", dot: "bg-good", label: "Routine" },
};

const chipBase = "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1";

export function UrgencyBadge({ level }: { level?: Urgency }) {
  if (!level) return null;
  const s = urgencyStyle[level];
  return (
    <span className={cx(chipBase, s.chip)}>
      <span className={cx("size-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

export function StatusBadge({ record }: { record: CallRecord }) {
  switch (record.state) {
    case "ringing":
      return (
        <span className={cx(chipBase, "bg-paper-2 text-ink-2 ring-line")}>
          <span className="size-1.5 animate-pulse rounded-full bg-ink-3" />
          Ringing…
        </span>
      );
    case "live":
      return (
        <span className={cx(chipBase, "bg-good text-white ring-good")}>
          <span className="relative flex size-1.5">
            <span className="absolute inset-0 animate-pulse-ring rounded-full bg-white" />
            <span className="relative size-1.5 rounded-full bg-white" />
          </span>
          On call · <span className="font-mono tabular">{formatDuration(record.duration)}</span>
        </span>
      );
    case "booked":
      return (
        <span className={cx(chipBase, "bg-good-soft text-good ring-good/20")}>
          <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden>
            <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Booked
        </span>
      );
    case "callback":
      return (
        <span className={cx(chipBase, "bg-amber-soft text-amber ring-amber/20")}>
          <svg viewBox="0 0 24 24" className="size-3" fill="currentColor" aria-hidden>
            <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.2 1L6.6 10.8Z" />
          </svg>
          Call back
        </span>
      );
  }
}

const tradeStyle: Record<NicheId, string> = {
  roofing: "bg-roof-soft text-roof",
  water: "bg-water-soft text-water",
};

export function TradeBadge({ niche }: { niche: NicheId }) {
  return (
    <span className={cx("inline-flex rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap", tradeStyle[niche])}>
      {personas[niche].label}
    </span>
  );
}

export function SourceTag({ source }: { source: CallRecord["source"] }) {
  if (source === "example") {
    return (
      <span className="rounded border border-line px-1.5 py-px font-mono text-[10px] tracking-wide text-ink-3 uppercase">
        Example
      </span>
    );
  }
  return (
    <span className="rounded bg-accent-soft px-1.5 py-px font-mono text-[10px] tracking-wide text-accent-strong uppercase">
      {source === "live" ? "Your call" : "Sample call"}
    </span>
  );
}

export function appointmentText(record: CallRecord) {
  const b = record.lead.booked;
  if (!b) return null;
  return b.tonight ? "Tech on the way (within 1 hr)" : b.label;
}

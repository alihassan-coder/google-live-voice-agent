import type { NicheId } from "./personas";

export type Urgency = "emergency" | "urgent" | "routine";

export type Slot = { id: string; label: string; day: string; time: string; iso: string; tonight?: boolean };

export type Lead = {
  name?: string;
  address?: string;
  issue?: string;
  detail?: string;
  insurance?: "yes" | "no" | "unsure";
  callback?: string;
  urgency?: { level: Urgency; reason: string };
  slots?: Slot[];
  booked?: Slot;
  ownerText?: string;
};

export type LogEntry = { at: number; text: string; tone?: "info" | "good" | "warn" };

export type LeadField = "name" | "address" | "issue" | "detail" | "insurance" | "callback";

export const fieldLabels: Record<LeadField, string> = {
  name: "Caller",
  address: "Address",
  issue: "Problem",
  detail: "Detail",
  insurance: "Insurance",
  callback: "Callback",
};

const TZ = "America/New_York";

function partsInTz(date: Date) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    hour12: false,
  });
  const p = Object.fromEntries(fmt.formatToParts(date).map((x) => [x.type, x.value]));
  return { weekday: p.weekday, month: p.month, day: p.day, hour: Number(p.hour) % 24 };
}

/** Next open slots in Tampa time. Water damage emergencies get a tonight slot first. */
export function openSlots(niche: NicheId, urgency?: Urgency, now = new Date()): Slot[] {
  const slots: Slot[] = [];
  const DAY = 24 * 60 * 60 * 1000;

  if (niche === "water" && urgency === "emergency") {
    slots.push({
      id: "tonight",
      label: "On-call technician, within the hour",
      day: "Tonight",
      time: "Within 1 hr",
      iso: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
      tonight: true,
    });
  }

  // Business days only (Mon–Sat), starting tomorrow. Two times on the first day, one on the next.
  const plan = [["8:00 AM", "1:00 PM"], ["10:30 AM"]];
  let offset = 1;
  for (const times of plan) {
    let d = new Date(now.getTime() + offset * DAY);
    while (partsInTz(d).weekday === "Sun") {
      d = new Date(d.getTime() + DAY);
      offset++;
    }
    const p = partsInTz(d);
    const day = offset === 1 ? "Tomorrow" : `${p.weekday} ${p.month} ${p.day}`;
    for (const time of times) {
      if (slots.length >= 3) break;
      slots.push({
        id: `${p.month}-${p.day}-${time}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        label: `${day} at ${time}`,
        day,
        time,
        iso: d.toISOString(),
      });
    }
    offset++;
  }
  return slots;
}

export function localTimeString(now = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(now);
}

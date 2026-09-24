"use client";

import { useSyncExternalStore } from "react";
import type { Lead, Slot } from "./lead";
import type { NicheId } from "./personas";

export type RecordState = "ringing" | "live" | "booked" | "callback";

/** One row in the leads table: an example lead, or a call made from the demo page. */
export type CallRecord = {
  id: string;
  niche: NicheId;
  /** "example" rows are dummy data so the table never looks empty. */
  source: "live" | "sample" | "example";
  /** Epoch ms when the call started. */
  at: number;
  /** Talk time in seconds. */
  duration: number;
  state: RecordState;
  phone?: string;
  lead: Lead;
  transcript: Array<{ role: "agent" | "caller"; text: string }>;
};

const STORAGE_KEY = "missed-call-demo.calls.v1";
const MAX_SAVED = 30;

// ---------------------------------------------------------------------------
// Example rows. Times are "N days ago at HH:MM" so they always look like last
// night's after-hours calls, whatever day the page is opened.
// ---------------------------------------------------------------------------

function daysAgoAt(days: number, hh: number, mm: number, now: Date) {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  d.setHours(hh, mm, 0, 0);
  return d.getTime();
}

function slotAfter(at: number, days: number, time: string): Slot {
  const d = new Date(at);
  d.setDate(d.getDate() + days);
  const day = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  return { id: `ex-${at}`, label: `${day} at ${time}`, day, time, iso: d.toISOString() };
}

function dispatch(at: number): Slot {
  return {
    id: `ex-${at}`,
    label: "On-call technician, within the hour",
    day: "Same night",
    time: "Within 1 hr",
    iso: new Date(at + 60 * 60 * 1000).toISOString(),
    tonight: true,
  };
}

type Seed = Omit<CallRecord, "id" | "at" | "source" | "transcript" | "lead"> & {
  when: [days: number, hh: number, mm: number];
  lead: Omit<Lead, "booked">;
  book?: { days: number; time: string } | "dispatch";
};

const seedRows: Seed[] = [
  {
    when: [1, 21, 47],
    niche: "roofing",
    duration: 142,
    state: "booked",
    phone: "(813) 555-0142",
    lead: {
      name: "Carlos M.",
      address: "1208 N Rome Ave, Tampa",
      issue: "Shingles blown off in the storm",
      detail: "~12-year-old roof, dripping in bedroom",
      insurance: "yes",
      callback: "(813) 555-0142",
      urgency: { level: "emergency", reason: "Water coming in through the bedroom ceiling" },
      ownerText: "Carlos, 1208 N Rome Ave — storm damage, active leak, insurance claim",
    },
    book: { days: 1, time: "8:00 AM" },
  },
  {
    when: [1, 23, 5],
    niche: "water",
    duration: 118,
    state: "booked",
    phone: "(727) 555-0117",
    lead: {
      name: "Priya S.",
      address: "88 Bayview Dr, St. Petersburg",
      issue: "Water heater leaking into the garage",
      detail: "Water heater — shut off, floor still wet",
      insurance: "unsure",
      callback: "(727) 555-0117",
      urgency: { level: "urgent", reason: "Leak stopped, garage floor and drywall wet" },
      ownerText: "Priya, 88 Bayview Dr — water heater leak, garage wet, unsure on insurance",
    },
    book: { days: 1, time: "10:30 AM" },
  },
  {
    when: [2, 2, 13],
    niche: "water",
    duration: 96,
    state: "booked",
    phone: "(813) 555-0198",
    lead: {
      name: "Jordan K.",
      address: "4410 W Kennedy Blvd, Tampa",
      issue: "Burst pipe under the kitchen sink",
      detail: "Supply pipe — still flowing, main not found",
      insurance: "yes",
      callback: "(813) 555-0198",
      urgency: { level: "emergency", reason: "Water still spreading across the kitchen" },
      ownerText: "Jordan, 4410 W Kennedy — burst pipe, still flowing, tech dispatched",
    },
    book: "dispatch",
  },
  {
    when: [2, 19, 30],
    niche: "roofing",
    duration: 164,
    state: "booked",
    phone: "(813) 555-0163",
    lead: {
      name: "Linda T.",
      address: "702 S Oregon Ave, Tampa",
      issue: "Roof inspection before selling the house",
      detail: "~22-year-old roof, no leaks",
      insurance: "no",
      callback: "(813) 555-0163",
      urgency: { level: "routine", reason: "Pre-sale inspection, nothing urgent" },
      ownerText: "Linda, 702 S Oregon — pre-sale inspection, 22-yr roof, paying direct",
    },
    book: { days: 2, time: "1:00 PM" },
  },
  {
    when: [3, 22, 40],
    niche: "roofing",
    duration: 131,
    state: "booked",
    phone: "(813) 555-0120",
    lead: {
      name: "Marcus J.",
      address: "5319 Bayshore Blvd, Tampa",
      issue: "Tree branch fell on the roof",
      detail: "~8-year-old roof, hole near the chimney",
      insurance: "yes",
      callback: "(813) 555-0120",
      urgency: { level: "emergency", reason: "Open hole in the roof, rain expected" },
      ownerText: "Marcus, 5319 Bayshore — branch through roof, needs tarp, insurance",
    },
    book: { days: 1, time: "8:00 AM" },
  },
  {
    when: [3, 6, 15],
    niche: "water",
    duration: 88,
    state: "callback",
    phone: "(813) 555-0175",
    lead: {
      name: "Sofia R.",
      address: "1502 E 7th Ave, Ybor City",
      issue: "Ceiling stain from the upstairs neighbor",
      detail: "Neighbor's washer — leak has stopped",
      insurance: "unsure",
      callback: "(813) 555-0175",
      urgency: { level: "urgent", reason: "Stain spreading, wants landlord to approve first" },
      ownerText: "Sofia, 1502 E 7th Ave — ceiling stain, checking with landlord, call back",
    },
  },
  {
    when: [4, 20, 55],
    niche: "roofing",
    duration: 109,
    state: "booked",
    phone: "(727) 555-0134",
    lead: {
      name: "Greg W.",
      address: "310 Davis Blvd, Tampa",
      issue: "Gutter pulling away, small drip",
      detail: "~15-year-old roof, drip by the porch",
      insurance: "no",
      callback: "(727) 555-0134",
      urgency: { level: "urgent", reason: "Small leak at the porch, getting worse with rain" },
      ownerText: "Greg, 310 Davis Blvd — gutter + small leak, paying direct",
    },
    book: { days: 1, time: "1:00 PM" },
  },
  {
    when: [5, 1, 48],
    niche: "water",
    duration: 102,
    state: "booked",
    phone: "(813) 555-0151",
    lead: {
      name: "Ahmed B.",
      address: "2201 W Swann Ave, Tampa",
      issue: "Dishwasher flooded the kitchen",
      detail: "Dishwasher — shut off, water under cabinets",
      insurance: "yes",
      callback: "(813) 555-0151",
      urgency: { level: "urgent", reason: "Water under cabinets and flooring" },
      ownerText: "Ahmed, 2201 W Swann — dishwasher flood, water under cabinets, insurance",
    },
    book: { days: 1, time: "8:00 AM" },
  },
];

function buildExamples(now = new Date()): CallRecord[] {
  return seedRows.map(({ when, book, lead, ...rest }, i) => {
    const at = daysAgoAt(...when, now);
    const booked = book === "dispatch" ? dispatch(at) : book ? slotAfter(at, book.days, book.time) : undefined;
    return { ...rest, id: `example-${i}`, source: "example", at, transcript: [], lead: { ...lead, booked } };
  });
}

// ---------------------------------------------------------------------------
// Store: example rows + calls made in this browser (saved to localStorage).
// ---------------------------------------------------------------------------

const listeners = new Set<() => void>();
const examples = buildExamples();
let saved: CallRecord[] | null = null;
let snapshot: CallRecord[] = examples;

function rebuild() {
  snapshot = [...(saved ?? []), ...examples].sort((a, b) => b.at - a.at);
}

function load() {
  if (saved) return;
  saved = [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      // A call still "on the line" when the tab closed has ended since.
      saved = (parsed as CallRecord[])
        .filter((r) => r && typeof r.id === "string" && r.state !== "ringing")
        .map((r) => (r.state === "live" ? { ...r, state: r.lead.booked ? "booked" : "callback" } : r));
    }
  } catch {
    // Storage blocked or corrupt: start empty.
  }
  rebuild();
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify((saved ?? []).slice(0, MAX_SAVED)));
  } catch {
    // Storage full or blocked: the table still works for this visit.
  }
}

function emit() {
  rebuild();
  persist();
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  load();
  return snapshot;
}

const getServerSnapshot = () => examples;

export function useCallRecords() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function upsertCallRecord(record: CallRecord) {
  load();
  const list = saved ?? [];
  const i = list.findIndex((r) => r.id === record.id);
  saved = i === -1 ? [record, ...list] : list.map((r) => (r.id === record.id ? record : r));
  emit();
}

export function removeCallRecord(id: string) {
  load();
  saved = (saved ?? []).filter((r) => r.id !== id);
  emit();
}

/** Removes the calls made from the demo page; the example rows stay. */
export function clearSavedCalls() {
  load();
  saved = (saved ?? []).filter((r) => r.state === "live" || r.state === "ringing");
  emit();
}

// ---------------------------------------------------------------------------
// A shared clock for "5 min ago" labels. It is 0 during server render and
// hydration, since server and browser clocks and time zones differ.
// ---------------------------------------------------------------------------

let now = 0;
const clockListeners = new Set<() => void>();
let clockTimer: number | undefined;

function subscribeClock(listener: () => void) {
  clockListeners.add(listener);
  if (clockTimer === undefined) {
    now = Date.now();
    clockTimer = window.setInterval(() => {
      now = Date.now();
      for (const l of clockListeners) l();
    }, 15_000);
  }
  return () => {
    clockListeners.delete(listener);
    if (clockListeners.size === 0) {
      window.clearInterval(clockTimer);
      clockTimer = undefined;
    }
  };
}

export function useNow() {
  return useSyncExternalStore(
    subscribeClock,
    () => (now ||= Date.now()),
    () => 0,
  );
}

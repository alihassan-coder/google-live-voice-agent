import { openSlots, type Lead, type LogEntry, type Urgency } from "./lead";
import type { NicheId } from "./personas";

export type ToolResult = {
  lead: Lead;
  /** Timeline entry for the owner panel, or null if nothing visible changed. */
  logText: string | null;
  tone: LogEntry["tone"];
  /** Sent back to the model as the function response. */
  response: Record<string, unknown>;
  /** The agent asked to hang up. */
  endCall?: boolean;
};

const fieldNames: Record<string, string> = {
  name: "Name",
  address: "Address",
  issue: "Problem",
  detail: "Details",
  callback: "Callback number",
  insurance: "Insurance",
};

/**
 * Pure reducer for agent tool calls. Used by both the live call and the scripted
 * sample so the owner panel behaves identically.
 */
export function applyTool(lead: Lead, name: string, args: Record<string, unknown>, niche: NicheId): ToolResult {
  switch (name) {
    case "update_caller": {
      const patch: Partial<Lead> = {};
      for (const k of ["name", "address", "issue", "detail", "callback"] as const) {
        const v = args[k];
        if (typeof v === "string" && v.trim() && v.trim() !== lead[k]) patch[k] = v.trim();
      }
      const ins = args.insurance;
      if ((ins === "yes" || ins === "no" || ins === "unsure") && ins !== lead.insurance) patch.insurance = ins;
      const keys = Object.keys(patch);
      return {
        lead: keys.length ? { ...lead, ...patch } : lead,
        logText: keys.length ? `${keys.map((k) => fieldNames[k]).join(", ")} captured` : null,
        tone: "info",
        response: { saved: true },
      };
    }
    case "set_urgency": {
      const raw = String(args.level);
      const level: Urgency = raw === "emergency" || raw === "urgent" || raw === "routine" ? raw : "urgent";
      return {
        lead: { ...lead, urgency: { level, reason: String(args.reason ?? "") } },
        logText: `Marked ${level}`,
        tone: level === "emergency" ? "warn" : "info",
        response: { saved: true },
      };
    }
    case "get_open_slots": {
      const slots = openSlots(niche, lead.urgency?.level);
      return {
        lead: { ...lead, slots },
        logText: "Checked the calendar",
        tone: "info",
        response: { slots: slots.map((s) => ({ slot_id: s.id, when: s.label })) },
      };
    }
    case "book_inspection": {
      const slots = lead.slots ?? openSlots(niche, lead.urgency?.level);
      const slot = slots.find((s) => s.id === args.slot_id) ?? slots[0];
      return {
        lead: { ...lead, slots, booked: slot },
        logText: slot.tonight ? "On-call technician dispatched" : `Inspection booked · ${slot.label}`,
        tone: "good",
        response: { booked: true, when: slot.label },
      };
    }
    case "notify_owner":
      return {
        lead: { ...lead, ownerText: String(args.summary ?? "") },
        logText: "Owner texted",
        tone: "good",
        response: { sent: true },
      };
    case "end_call":
      return { lead, logText: null, tone: "info", response: { ok: true }, endCall: true };
    default:
      return { lead, logText: null, tone: "info", response: { error: "unknown tool" } };
  }
}

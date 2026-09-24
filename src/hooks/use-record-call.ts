"use client";

import { useEffect, useRef } from "react";
import type { CallController } from "@/lib/demo/call-types";
import { removeCallRecord, upsertCallRecord, type CallRecord, type RecordState } from "@/lib/demo/call-records";
import type { NicheId } from "@/lib/demo/personas";

/**
 * Mirrors a call into the leads table while it happens: a row appears when the
 * phone starts ringing and fills in as the agent captures each detail.
 * Calls that never connect are removed again.
 */
export function useRecordCall(call: CallController, niche: NicheId) {
  const current = useRef<{ id: string; at: number; niche: NicheId; wentLive: boolean; last?: CallRecord } | null>(
    null,
  );
  const { status, lead, lines, elapsed, kind } = call;

  useEffect(() => {
    const ringing = status === "mic" || status === "connecting";
    const onCall = status === "live" || status === "ending";

    if (!current.current) {
      if (!ringing && !onCall) return;
      const at = Date.now();
      current.current = { id: `${kind}-${at}`, at, niche, wentLive: false };
    }
    const rec = current.current;
    if (onCall) rec.wentLive = true;

    if (status === "error" || status === "idle") {
      if (!rec.wentLive) {
        // The call never got through (mic blocked, quota, reset while ringing): drop its row.
        removeCallRecord(rec.id);
      } else if (rec.last) {
        // Reset mid-call clears the lead, so finish the row from its last good copy.
        upsertCallRecord({ ...rec.last, state: rec.last.lead.booked ? "booked" : "callback" });
      }
      current.current = null;
      return;
    }

    const state: RecordState = ringing ? "ringing" : onCall ? "live" : lead.booked ? "booked" : "callback";
    const record: CallRecord = {
      id: rec.id,
      niche: rec.niche,
      source: kind,
      at: rec.at,
      duration: elapsed,
      state,
      phone: kind === "live" ? "Your browser" : "Sample caller",
      lead,
      transcript: lines.filter((l) => l.text.trim()).map((l) => ({ role: l.role, text: l.text })),
    };
    upsertCallRecord(record);
    rec.last = record;

    // Finished: the next call gets a fresh row.
    if (status === "ended") current.current = null;
  }, [status, lead, lines, elapsed, kind, niche]);
}

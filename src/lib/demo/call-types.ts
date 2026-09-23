import type { RefObject } from "react";
import type { Lead, LogEntry } from "./lead";

export type CallStatus = "idle" | "mic" | "connecting" | "live" | "ending" | "ended" | "error";

export type CallError =
  | "mic_denied"
  | "mic_missing"
  | "not_configured"
  | "rate_limited"
  | "quota"
  | "network";

export type Line = { id: number; role: "agent" | "caller"; text: string; final: boolean };

/**
 * Everything the demo UI needs from a call. Implemented by the real voice call
 * (useLiveCall) and by the scripted fallback (useSampleCall), so the UI doesn't care which.
 */
export type CallController = {
  kind: "live" | "sample";
  status: CallStatus;
  error: CallError | null;
  lines: Line[];
  lead: Lead;
  log: LogEntry[];
  speaking: "agent" | "caller" | null;
  /** Seconds since the call was answered. */
  elapsed: number;
  /** Time from connect to the first word of the greeting. */
  answeredMs: number | null;
  muted: boolean;
  /** Live audio levels 0..~0.5, read in rAF loops (not React state). */
  levels: RefObject<{ agent: number; caller: number }>;
  start: () => void | Promise<void>;
  hangUp: () => void;
  toggleMute: () => void;
  reset: () => void;
};

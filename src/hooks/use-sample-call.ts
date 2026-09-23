"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { applyTool } from "@/lib/demo/apply-tool";
import type { CallController, CallStatus, Line } from "@/lib/demo/call-types";
import type { Lead, LogEntry } from "@/lib/demo/lead";
import type { NicheId } from "@/lib/demo/personas";
import { sampleCalls } from "@/lib/demo/sample-calls";

const MS_PER_WORD = 260;

/** Plays a scripted call through the same UI as the live one. No mic, no network. */
export function useSampleCall(niche: NicheId): CallController {
  const [status, setStatus] = useState<CallStatus>("idle");
  const [lines, setLines] = useState<Line[]>([]);
  const [lead, setLead] = useState<Lead>({});
  const [log, setLog] = useState<LogEntry[]>([]);
  const [speaking, setSpeaking] = useState<"agent" | "caller" | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [answeredMs, setAnsweredMs] = useState<number | null>(null);

  const levels = useRef({ agent: 0, caller: 0 });
  const timers = useRef<number[]>([]);
  const intervals = useRef<number[]>([]);
  const leadRef = useRef<Lead>({});
  const startedAt = useRef(0);
  const lineId = useRef(0);
  const typing = useRef<{ role: Line["role"]; timer: number; id: number; text: string } | null>(null);

  const clearAll = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    intervals.current.forEach((t) => window.clearInterval(t));
    timers.current = [];
    intervals.current = [];
    if (typing.current) window.clearInterval(typing.current.timer);
    typing.current = null;
    levels.current.agent = 0;
    levels.current.caller = 0;
  }, []);

  const addLog = useCallback((text: string, tone: LogEntry["tone"] = "info") => {
    const at = startedAt.current ? Date.now() - startedAt.current : 0;
    setLog((l) => [...l, { at, text, tone }]);
  }, []);

  const finishTyping = useCallback(() => {
    if (!typing.current) return;
    const { timer, id, text } = typing.current;
    window.clearInterval(timer);
    typing.current = null;
    // Always show the whole sentence, even if the next speaker cut in.
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, text, final: true } : l.final ? l : { ...l, final: true })));
    setSpeaking(null);
  }, []);

  const hangUp = useCallback(() => {
    if (!startedAt.current) return;
    finishTyping();
    clearAll();
    startedAt.current = 0;
    setSpeaking(null);
    addLog("Call ended");
    setStatus("ended");
  }, [addLog, clearAll, finishTyping]);

  const say = useCallback(
    (role: Line["role"], text: string) => {
      finishTyping();
      const words = text.split(" ");
      const id = ++lineId.current;
      let shown = 1;
      setLines((prev) => [...prev, { id, role, text: words[0], final: false }]);
      setSpeaking(role);
      const timer = window.setInterval(() => {
        shown += 1;
        if (shown >= words.length) {
          setLines((prev) => prev.map((l) => (l.id === id ? { ...l, text, final: true } : l)));
          window.clearInterval(timer);
          if (typing.current?.timer === timer) typing.current = null;
          setSpeaking(null);
          return;
        }
        const partial = words.slice(0, shown).join(" ");
        setLines((prev) => prev.map((l) => (l.id === id ? { ...l, text: partial } : l)));
      }, MS_PER_WORD);
      typing.current = { role, timer, id, text };
    },
    [finishTyping],
  );

  const start = useCallback(() => {
    clearAll();
    leadRef.current = {};
    lineId.current = 0;
    setLines([]);
    setLog([]);
    setLead({});
    setElapsed(0);
    setSpeaking(null);
    setAnsweredMs(null);
    setStatus("connecting");

    const events = sampleCalls[niche];
    const connectDelay = 700;

    timers.current.push(
      window.setTimeout(() => {
        startedAt.current = Date.now();
        setStatus("live");
        addLog("Call answered", "good");

        // Fake audio level for whoever is talking.
        intervals.current.push(
          window.setInterval(() => {
            const role = typing.current?.role;
            const wobble = 0.08 + Math.random() * 0.2;
            levels.current.agent = role === "agent" ? wobble : levels.current.agent * 0.6;
            levels.current.caller = role === "caller" ? wobble : levels.current.caller * 0.6;
          }, 80),
          window.setInterval(() => {
            setElapsed(Math.floor((Date.now() - startedAt.current) / 1000));
          }, 250),
        );

        for (const ev of events) {
          timers.current.push(
            window.setTimeout(() => {
              if (ev.type === "say") {
                if (ev.role === "agent") setAnsweredMs((v) => v ?? ev.at);
                say(ev.role, ev.text);
                return;
              }
              const result = applyTool(leadRef.current, ev.name, ev.args, niche);
              leadRef.current = result.lead;
              setLead(result.lead);
              if (result.logText) addLog(result.logText, result.tone);
              if (result.endCall) {
                timers.current.push(
                  window.setTimeout(() => {
                    addLog("Call ended by the assistant");
                    finishTyping();
                    clearAll();
                    startedAt.current = 0;
                    setStatus("ended");
                  }, 1200),
                );
              }
            }, ev.at),
          );
        }
      }, connectDelay),
    );
  }, [addLog, clearAll, finishTyping, niche, say]);

  const reset = useCallback(() => {
    clearAll();
    startedAt.current = 0;
    leadRef.current = {};
    setStatus("idle");
    setLines([]);
    setLog([]);
    setLead({});
    setElapsed(0);
    setSpeaking(null);
    setAnsweredMs(null);
  }, [clearAll]);

  // Switching trade mid-sample restarts from a clean slate.
  useEffect(() => reset, [niche, reset]);
  useEffect(() => clearAll, [clearAll]);

  return {
    kind: "sample",
    status,
    error: null,
    lines,
    lead,
    log,
    speaking,
    elapsed,
    answeredMs,
    muted: false,
    levels,
    start,
    hangUp,
    toggleMute: () => {},
    reset,
  };
}

"use client";

import { GoogleGenAI, Modality, type FunctionResponse, type LiveServerMessage, type Session } from "@google/genai";
import { useCallback, useEffect, useRef, useState } from "react";
import { MicCapture, PcmPlayer, arrayBufferToBase64 } from "@/lib/audio/pcm";
import { applyTool } from "@/lib/demo/apply-tool";
import type { CallController, CallError, CallStatus, Line } from "@/lib/demo/call-types";
import type { Lead, LogEntry } from "@/lib/demo/lead";
import type { NicheId } from "@/lib/demo/personas";

type SessionResponse = { token: string; model: string; maxSeconds: number } | { error: string };

const OPENING_CUE =
  "(The phone is ringing and you pick it up. Greet the caller with your opening line now. Do not mention this note.)";

const PCM_MIME = "audio/pcm;rate=16000";

export function useLiveCall(niche: NicheId): CallController {
  const [status, setStatus] = useState<CallStatus>("idle");
  const [error, setError] = useState<CallError | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [lead, setLead] = useState<Lead>({});
  const [log, setLog] = useState<LogEntry[]>([]);
  const [speaking, setSpeaking] = useState<"agent" | "caller" | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [answeredMs, setAnsweredMs] = useState<number | null>(null);
  const [muted, setMuted] = useState(false);

  const session = useRef<Session | null>(null);
  const mic = useRef<MicCapture | null>(null);
  const player = useRef<PcmPlayer | null>(null);
  const leadRef = useRef<Lead>({});
  const startedAt = useRef(0);
  const lineId = useRef(0);
  const endRequested = useRef(false);
  const endTimer = useRef<number | null>(null);
  const maxSeconds = useRef(240);
  const levels = useRef({ agent: 0, caller: 0 });
  /** Bumped on every teardown so an in-flight start() knows it was cancelled. */
  const attempt = useRef(0);
  const nicheRef = useRef(niche);
  useEffect(() => {
    nicheRef.current = niche;
  }, [niche]);

  const addLog = useCallback((text: string, tone: LogEntry["tone"] = "info") => {
    const at = startedAt.current ? Date.now() - startedAt.current : 0;
    setLog((l) => [...l, { at, text, tone }]);
  }, []);

  /** Append streaming transcription text to the current line for that speaker. */
  const appendText = useCallback((role: Line["role"], text: string) => {
    if (!text) return;
    setLines((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.role === role && !last.final) {
        return [...prev.slice(0, -1), { ...last, text: last.text + text }];
      }
      const closed = last && !last.final ? [...prev.slice(0, -1), { ...last, final: true }] : prev;
      return [...closed, { id: ++lineId.current, role, text: text.trimStart(), final: false }];
    });
  }, []);

  const finalizeLines = useCallback(() => {
    setLines((prev) =>
      prev.length && !prev[prev.length - 1].final
        ? [...prev.slice(0, -1), { ...prev[prev.length - 1], final: true }]
        : prev,
    );
  }, []);

  const teardown = useCallback(() => {
    attempt.current += 1;
    if (endTimer.current) window.clearTimeout(endTimer.current);
    endTimer.current = null;
    mic.current?.stop();
    mic.current = null;
    const s = session.current;
    session.current = null; // clear first so onclose knows we closed it on purpose
    try {
      s?.close();
    } catch {}
    player.current?.close();
    player.current = null;
    levels.current.agent = 0;
    levels.current.caller = 0;
    setSpeaking(null);
  }, []);

  const hangUp = useCallback(
    (reason: "caller" | "agent" | "timeout" = "caller") => {
      if (!session.current && !mic.current) return; // already down
      if (reason === "timeout") addLog("Demo time limit reached", "warn");
      addLog(reason === "agent" ? "Call ended by the assistant" : "Call ended");
      finalizeLines();
      teardown();
      setStatus("ended");
    },
    [addLog, finalizeLines, teardown],
  );

  /** After end_call: hang up once the goodbye has finished playing and no more audio is arriving. */
  const scheduleAgentHangUp = useCallback(
    (delay: number) => {
      if (endTimer.current) window.clearTimeout(endTimer.current);
      endTimer.current = window.setTimeout(() => {
        endTimer.current = null;
        if (player.current?.playing) return; // onIdle will reschedule
        hangUp("agent");
      }, delay);
    },
    [hangUp],
  );

  const handleTool = useCallback(
    (name: string, args: Record<string, unknown>) => {
      const result = applyTool(leadRef.current, name, args, nicheRef.current);
      if (result.lead !== leadRef.current) {
        leadRef.current = result.lead;
        setLead(result.lead);
      }
      if (result.logText) addLog(result.logText, result.tone);
      if (result.endCall) {
        endRequested.current = true;
        scheduleAgentHangUp(1200);
      }
      return result.response;
    },
    [addLog, scheduleAgentHangUp],
  );

  const onMessage = useCallback(
    (msg: LiveServerMessage) => {
      const sc = msg.serverContent;
      if (sc) {
        if (sc.interrupted) {
          player.current?.flush();
          finalizeLines();
        }
        for (const part of sc.modelTurn?.parts ?? []) {
          const data = part.inlineData?.data;
          if (!data) continue;
          if (startedAt.current) setAnsweredMs((v) => v ?? Date.now() - startedAt.current);
          player.current?.enqueue(data);
          setSpeaking("agent");
        }
        if (sc.inputTranscription?.text) {
          appendText("caller", sc.inputTranscription.text);
          setSpeaking((s) => (s === "agent" ? s : "caller"));
        }
        if (sc.outputTranscription?.text) appendText("agent", sc.outputTranscription.text);
        if (sc.turnComplete) {
          finalizeLines();
          setSpeaking((s) => (s === "caller" ? null : s));
        }
      }

      const calls = msg.toolCall?.functionCalls;
      if (calls?.length) {
        const functionResponses: FunctionResponse[] = calls.map((fc) => ({
          id: fc.id,
          name: fc.name,
          response: handleTool(fc.name ?? "", (fc.args ?? {}) as Record<string, unknown>),
        }));
        try {
          session.current?.sendToolResponse({ functionResponses });
        } catch (e) {
          console.warn("[live] tool response failed", e);
        }
      }

      if (msg.goAway) addLog("Connection closing soon", "warn");
    },
    [addLog, appendText, finalizeLines, handleTool],
  );

  // The socket callbacks are bound once at connect time; route them through refs
  // so they always run the latest handlers.
  const onMessageRef = useRef(onMessage);
  const hangUpRef = useRef(hangUp);
  const scheduleRef = useRef(scheduleAgentHangUp);
  useEffect(() => {
    onMessageRef.current = onMessage;
    hangUpRef.current = hangUp;
    scheduleRef.current = scheduleAgentHangUp;
  });

  const start = useCallback(async () => {
    teardown();
    const my = attempt.current;
    const cancelled = () => attempt.current !== my;

    setError(null);
    setLines([]);
    setLog([]);
    setLead({});
    leadRef.current = {};
    setAnsweredMs(null);
    setElapsed(0);
    setMuted(false);
    endRequested.current = false;
    startedAt.current = 0;

    // Create the player synchronously inside the click so browsers (Safari) allow audio.
    const out = new PcmPlayer();
    player.current = out;
    const resumed = out.resume();
    out.onIdle = () => {
      setSpeaking((s) => (s === "agent" ? null : s));
      if (endRequested.current) scheduleRef.current(700);
    };

    setStatus("mic");
    const capture = new MicCapture();
    const pending: ArrayBuffer[] = [];
    let live = false;
    try {
      await resumed;
      await capture.start((pcm, level) => {
        levels.current.caller = level;
        if (!live) {
          if (pending.length < 25) pending.push(pcm); // ~1s, so the first word isn't lost
          return;
        }
        try {
          session.current?.sendRealtimeInput({ audio: { data: arrayBufferToBase64(pcm), mimeType: PCM_MIME } });
        } catch {
          // socket closing; teardown will stop the mic
        }
      });
    } catch (e) {
      capture.stop();
      if (cancelled()) return;
      teardown();
      const name = e instanceof DOMException ? e.name : "";
      setError(name === "NotFoundError" ? "mic_missing" : "mic_denied");
      setStatus("error");
      return;
    }
    if (cancelled()) return capture.stop();
    mic.current = capture;

    setStatus("connecting");
    let res: SessionResponse;
    try {
      const r = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: nicheRef.current }),
      });
      res = (await r.json()) as SessionResponse;
    } catch {
      res = { error: "network" };
    }
    if (cancelled()) return;
    if ("error" in res) {
      teardown();
      const map: Record<string, CallError> = {
        not_configured: "not_configured",
        rate_limited: "rate_limited",
        quota: "quota",
      };
      setError(map[res.error] ?? "network");
      setStatus("error");
      return;
    }
    maxSeconds.current = res.maxSeconds;

    let opened: Session;
    try {
      // Ephemeral tokens only work against v1alpha.
      const ai = new GoogleGenAI({ apiKey: res.token, httpOptions: { apiVersion: "v1alpha" } });
      opened = await ai.live.connect({
        model: res.model,
        config: { responseModalities: [Modality.AUDIO] },
        callbacks: {
          onmessage: (m) => onMessageRef.current(m),
          onerror: (e) => console.warn("[live] socket error", e),
          onclose: (e) => {
            if (!session.current) return; // we closed it
            const abnormal = e.code !== 1000;
            if (abnormal) console.warn("[live] closed", e.code, e.reason);
            if (abnormal && /quota|exhaust|rate/i.test(e.reason ?? "")) {
              teardown();
              setError("quota");
              setStatus("error");
              return;
            }
            hangUpRef.current(endRequested.current ? "agent" : "caller");
          },
        },
      });
    } catch (e) {
      console.error("[live] connect failed", e);
      if (cancelled()) return;
      teardown();
      setError("network");
      setStatus("error");
      return;
    }
    if (cancelled()) {
      try {
        opened.close();
      } catch {}
      return;
    }
    session.current = opened;

    startedAt.current = Date.now();
    live = true;
    setStatus("live");
    addLog("Call answered", "good");
    opened.sendClientContent({ turns: [{ role: "user", parts: [{ text: OPENING_CUE }] }], turnComplete: true });
    for (const pcm of pending.splice(0)) {
      opened.sendRealtimeInput({ audio: { data: arrayBufferToBase64(pcm), mimeType: PCM_MIME } });
    }
  }, [addLog, teardown]);

  const toggleMute = useCallback(() => {
    if (!mic.current) return;
    mic.current.muted = !mic.current.muted;
    setMuted(mic.current.muted);
  }, []);

  // Call timer + hard stop.
  useEffect(() => {
    if (status !== "live") return;
    const t = window.setInterval(() => {
      const s = Math.floor((Date.now() - startedAt.current) / 1000);
      setElapsed(s);
      if (s >= maxSeconds.current) hangUpRef.current("timeout");
    }, 250);
    return () => window.clearInterval(t);
  }, [status]);

  // Agent output level for the waveform (caller level comes from the mic worklet).
  useEffect(() => {
    if (status !== "live") return;
    let raf = 0;
    const tick = () => {
      levels.current.agent = player.current?.level() ?? 0;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [status]);

  // Close everything if the component unmounts or the trade changes mid-call.
  useEffect(() => teardown, [teardown]);

  const reset = useCallback(() => {
    teardown();
    startedAt.current = 0;
    leadRef.current = {};
    setStatus("idle");
    setError(null);
    setLines([]);
    setLog([]);
    setLead({});
    setElapsed(0);
    setAnsweredMs(null);
    setMuted(false);
  }, [teardown]);

  useEffect(() => {
    // Switching trade during a call ends it: the persona is locked into the token.
    return () => {
      if (session.current || mic.current) teardown();
    };
  }, [niche, teardown]);

  const hangUpCaller = useCallback(() => hangUp("caller"), [hangUp]);

  return {
    kind: "live",
    status,
    error,
    lines,
    lead,
    log,
    speaking,
    elapsed,
    answeredMs,
    muted,
    levels,
    start,
    hangUp: hangUpCaller,
    toggleMute,
    reset,
  };
}

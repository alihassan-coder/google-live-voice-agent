"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { cx } from "@/components/ui/primitives";
import type { CallController } from "@/lib/demo/call-types";
import type { Persona } from "@/lib/demo/personas";
import { Waveform } from "./waveform";

export function formatClock(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function StatusLine({ call }: { call: CallController }) {
  switch (call.status) {
    case "mic":
      return <span>Waiting for microphone…</span>;
    case "connecting":
      return <span>Connecting…</span>;
    case "live":
      return (
        <span className="flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-pulse-ring rounded-full bg-good" />
            <span className="relative size-2 rounded-full bg-good" />
          </span>
          Live <span className="font-mono tabular text-night-ink">{formatClock(call.elapsed)}</span>
        </span>
      );
    case "ending":
      return <span>Wrapping up…</span>;
    case "ended":
      return (
        <span>
          Call ended <span className="font-mono tabular">· {formatClock(call.elapsed)}</span>
        </span>
      );
    case "error":
      return <span>Call didn&apos;t connect</span>;
    default:
      return <span>Ready</span>;
  }
}

function RoundButton({
  label,
  onClick,
  tone = "neutral",
  pressed,
  children,
}: {
  label: string;
  onClick: () => void;
  tone?: "neutral" | "danger";
  pressed?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={cx(
        "flex size-12 items-center justify-center rounded-full transition-colors duration-150",
        tone === "danger"
          ? "bg-warn text-white hover:bg-[#8f1c13]"
          : pressed
            ? "bg-night-ink text-night"
            : "bg-night-3 text-night-ink hover:bg-night-line",
      )}
    >
      {children}
    </button>
  );
}

function MicIcon({ off }: { off?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
      {off && <path d="M4 4l16 16" />}
    </svg>
  );
}

function HangUpIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
      <path d="M12 9c-3.1 0-6 .9-8.3 2.5-.6.4-.8 1.3-.4 1.9l1.3 2c.4.6 1.2.8 1.8.5l2.3-1.1c.5-.2.8-.8.7-1.3l-.3-1.6a13 13 0 0 1 5.8 0l-.3 1.6c-.1.5.2 1.1.7 1.3l2.3 1.1c.6.3 1.4.1 1.8-.5l1.3-2c.4-.6.2-1.5-.4-1.9C18 9.9 15.1 9 12 9Z" />
    </svg>
  );
}

export function CallPanel({
  call,
  persona,
  sample,
  idleSlot,
  endSlot,
}: {
  call: CallController;
  persona: Persona;
  sample: boolean;
  /** Shown in the panel body before a call starts. */
  idleSlot?: ReactNode;
  /** Shown below the captions after the call ends. */
  endSlot?: ReactNode;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const inCall = call.status === "live" || call.status === "ending";
  const connecting = call.status === "mic" || call.status === "connecting";
  const lastText = call.lines[call.lines.length - 1]?.text;

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [call.lines.length, lastText]);

  return (
    <div className="flex flex-col overflow-hidden rounded-[28px] bg-[linear-gradient(145deg,#1d304b,#101c2e)] text-night-ink shadow-lift ring-1 ring-night-line">
      {/* Caller ID header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-night-ink">
            {persona.business}
          </p>
          <p className="mt-1 flex items-center gap-2 text-xs text-night-ink-2">
            {call.status === "idle" && <span className="size-1.5 rounded-full bg-emerald-300" aria-hidden />}
            <StatusLine call={call} />
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {sample && call.status !== "idle" && (
            <span className="rounded-full border border-night-line px-2.5 py-1 font-mono text-[10px] tracking-wide text-night-ink-2 uppercase">
              Sample call
            </span>
          )}
          <AnimatePresence>
            {call.answeredMs !== null && (
              <motion.span
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-full bg-good/20 px-2.5 py-1 font-mono text-[11px] text-[#9fd8b2]"
              >
                Answered in {(call.answeredMs / 1000).toFixed(1)}s
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Agent identity + waveform */}
      <div className="flex flex-col items-center px-6 pt-7 pb-5">
        <div className="relative flex size-20 items-center justify-center">
          {(connecting || (inCall && call.speaking === "agent")) && (
            <>
              <span className="absolute inset-0 animate-pulse-ring rounded-full bg-accent/40" />
              <span className="absolute inset-0 animate-pulse-ring rounded-full bg-accent/30 [animation-delay:0.6s]" />
            </>
          )}
          <span className="relative flex size-20 items-center justify-center rounded-[26px] border border-white/20 bg-[linear-gradient(145deg,#455d7b,#233953)] text-3xl font-medium text-white shadow-lg">
            {persona.agentName.charAt(0)}
          </span>
        </div>
        <p className="mt-4 text-xl font-semibold tracking-tight text-night-ink">
          {persona.agentName}
        </p>
        <p className="mt-1 text-sm text-night-ink-2">Your AI receptionist</p>
        {call.status !== "idle" && <Waveform levels={call.levels} active={inCall} className="mt-4 w-full max-w-xs" />}
      </div>

      {call.status === "idle" && <div className="px-6 pb-6">{idleSlot}</div>}
      {/* Captions */}
      {call.status !== "idle" && (
      <div
        ref={scroller}
        aria-live="polite"
        aria-label="Live captions"
        className="relative h-64 space-y-3 overflow-y-auto px-6 pb-5 [scrollbar-width:thin]"
      >
        {connecting && call.lines.length === 0 && (
          <p className="pt-6 text-center text-sm text-night-ink-2">
            {call.status === "mic" ? "Allow the microphone to start the call." : "Ringing…"}
          </p>
        )}
        {call.lines.map((line) => (
          <motion.div
            key={line.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={cx("flex flex-col", line.role === "caller" ? "items-end" : "items-start")}
          >
            <span className="mb-1 font-mono text-[10px] tracking-[0.12em] text-night-ink-2 uppercase">
              {line.role === "agent" ? persona.agentName : "You"}
            </span>
            <p
              className={cx(
                "max-w-[88%] rounded-2xl px-3.5 py-2 text-[15px] leading-snug",
                line.role === "agent" ? "rounded-tl-sm bg-night-2 text-night-ink" : "rounded-tr-sm bg-night-3 text-night-ink",
                !line.final && "opacity-75",
              )}
            >
              {line.text}
              {!line.final && <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-night-ink-2" />}
            </p>
          </motion.div>
        ))}
      </div>
      )}

      {/* Controls */}
      <div className="shrink-0 border-t border-white/10 bg-black/10 px-6 py-4">
        {inCall || connecting ? (
          <div className="flex items-center justify-center gap-5">
            {call.kind === "live" && (
              <RoundButton label={call.muted ? "Unmute" : "Mute"} onClick={call.toggleMute} pressed={call.muted}>
                <MicIcon off={call.muted} />
              </RoundButton>
            )}
            <RoundButton label="Hang up" onClick={call.hangUp} tone="danger">
              <HangUpIcon />
            </RoundButton>
          </div>
        ) : call.status === "ended" && endSlot ? (
          endSlot
        ) : (
          <p className="text-center text-xs text-night-ink-2">
            No signup · Up to 4 minutes per call
          </p>
        )}
      </div>
    </div>
  );
}

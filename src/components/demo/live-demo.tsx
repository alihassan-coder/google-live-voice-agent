"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useNiche } from "@/components/niche-context";
import { Button, Container, Eyebrow } from "@/components/ui/primitives";
import { useLiveCall } from "@/hooks/use-live-call";
import { useSampleCall } from "@/hooks/use-sample-call";
import type { CallController, CallError } from "@/lib/demo/call-types";
import { nicheOrder, personas } from "@/lib/demo/personas";
import { CallPanel } from "./call-panel";
import { NicheSwitch } from "./niche-switch";
import { OwnerPanel } from "./owner-panel";

const errorCopy: Record<CallError, { title: string; body: string }> = {
  mic_denied: {
    title: "The microphone is blocked",
    body: "Allow microphone access in your browser's address bar and try again — or watch a sample call instead.",
  },
  mic_missing: {
    title: "No microphone found",
    body: "Plug in a headset or try from your phone. You can also watch a sample call right here.",
  },
  not_configured: {
    title: "The live line isn't switched on yet",
    body: "The sample call below shows exactly what happens on a real one.",
  },
  rate_limited: {
    title: "That's a lot of calls in a row",
    body: "Give it a few minutes before calling again, or watch the sample call.",
  },
  quota: {
    title: "Today's free demo minutes are used up",
    body: "The live line resets tomorrow. The sample call shows the full flow in the meantime.",
  },
  network: {
    title: "Couldn't connect the call",
    body: "Check your connection and try again, or watch the sample call.",
  },
};

function isActive(call: CallController) {
  return call.status === "mic" || call.status === "connecting" || call.status === "live" || call.status === "ending";
}

export function LiveDemo() {
  const { niche, persona, setNiche } = useNiche();
  const [mode, setMode] = useState<"live" | "sample">("live");
  const live = useLiveCall(niche);
  const sample = useSampleCall(niche);
  const call = mode === "live" ? live : sample;
  const busy = isActive(call);

  const stopAll = () => {
    for (const c of [live, sample]) {
      if (isActive(c)) c.hangUp();
      c.reset();
    }
  };

  const onNicheChange = () => {
    stopAll();
  };

  const startLive = () => {
    if (isActive(sample)) sample.hangUp();
    sample.reset();
    setMode("live");
    void live.start();
  };

  const startSample = () => {
    if (isActive(live)) live.hangUp();
    live.reset();
    setMode("sample");
    void sample.start();
  };

  const otherNiche = nicheOrder.find((n) => n !== niche) ?? "water";
  const tryOther = () => {
    stopAll();
    setMode("live");
    setNiche(otherNiche);
  };

  const idle = (
    <div className="pt-2">
      <div className="rounded-2xl border border-night-line bg-night-2 p-4">
        <p className="font-mono text-[10px] tracking-[0.14em] text-night-ink-2 uppercase">Your role</p>
        <p className="mt-2 text-[15px] leading-snug text-night-ink">{persona.scenario}</p>
        <p className="mt-2 text-sm text-night-ink-2">
          {persona.agentName} will pick up. Answer her questions the way a real homeowner would — interrupt, ramble, change your mind.
        </p>
      </div>
      <div className="mt-5 flex flex-col items-center gap-3">
        <Button size="lg" onClick={startLive} className="w-full sm:w-auto">
          <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
            <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.2 1L6.6 10.8Z" />
          </svg>
          Start the call
        </Button>
        <p className="text-center text-xs text-night-ink-2">Uses your microphone. Headphones sound best.</p>
        <button
          type="button"
          onClick={startSample}
          className="text-sm text-night-ink-2 underline decoration-night-line underline-offset-4 hover:text-night-ink"
        >
          No mic? Watch a sample call
        </button>
      </div>
    </div>
  );

  const ended = (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
      <Button onClick={mode === "live" ? startLive : startSample} className="w-full sm:w-auto">
        Call again
      </Button>
      <Button
        variant="ghost"
        onClick={tryOther}
        className="w-full text-night-ink-2 hover:bg-night-3 hover:text-night-ink sm:w-auto"
      >
        Try {personas[otherNiche].label.toLowerCase()}
      </Button>
      {mode === "sample" && (
        <Button
          variant="ghost"
          onClick={startLive}
          className="w-full text-night-ink-2 hover:bg-night-3 hover:text-night-ink sm:w-auto"
        >
          Try it live
        </Button>
      )}
    </div>
  );

  const err = call.status === "error" && call.error ? errorCopy[call.error] : null;

  return (
    <section id="demo" className="scroll-mt-16 border-y border-line bg-paper-2/60 py-16 sm:py-24">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <Eyebrow>Live demo · {persona.business}</Eyebrow>
            <h2 className="mt-3 font-display text-[34px] leading-[1.08] tracking-tight text-ink sm:text-[44px]">
              Call the demo. Talk to it like a homeowner would.
            </h2>
            <p className="mt-3 max-w-xl text-[15px] text-ink-2">
              On the left is the call. On the right is what the owner gets while it&apos;s happening — no app to open,
              nothing to type.
            </p>
          </div>
          <NicheSwitch onChange={onNicheChange} disabled={busy} className="self-start md:self-auto" />
        </div>

        <AnimatePresence>
          {err && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              role="alert"
              className="mt-8 flex flex-col gap-3 rounded-2xl border border-warn/25 bg-warn-soft px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-ink">{err.title}</p>
                <p className="mt-0.5 text-sm text-ink-2">{err.body}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="secondary" onClick={() => call.reset()}>
                  Dismiss
                </Button>
                <Button onClick={startSample}>Watch a sample call</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5 lg:sticky lg:top-20 lg:self-start">
            <CallPanel
              call={call}
              persona={persona}
              sample={mode === "sample"}
              idleSlot={call.status === "idle" ? idle : undefined}
              endSlot={ended}
            />
            {call.status === "error" && (
              <div className="mt-4 flex justify-center">
                <Button variant="secondary" onClick={startLive}>
                  Try the live call again
                </Button>
              </div>
            )}
          </div>
          <div className="lg:col-span-7">
            <OwnerPanel call={call} persona={persona} />
          </div>
        </div>
      </Container>
    </section>
  );
}

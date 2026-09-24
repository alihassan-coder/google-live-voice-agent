"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { RecentLeads } from "@/components/leads/leads-dashboard";
import { useNiche } from "@/components/niche-context";
import { Button, Container, Eyebrow, buttonClass, cx } from "@/components/ui/primitives";
import { useLiveCall } from "@/hooks/use-live-call";
import { useRecordCall } from "@/hooks/use-record-call";
import { useSampleCall } from "@/hooks/use-sample-call";
import type { CallController, CallError } from "@/lib/demo/call-types";
import { nicheOrder, personas } from "@/lib/demo/personas";
import { CallPanel } from "./call-panel";
import { NicheSwitch } from "./niche-switch";
import { OwnerPanel } from "./owner-panel";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

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

const stepLabels = [
  { title: "Start the call", body: "Press \"Start the call\"" },
  { title: "Talk to the receptionist", body: "Answer her questions out loud" },
  { title: "Job booked", body: "The owner gets a text" },
];

/** Where the caller is in the call, as a simple 1-2-3 so anyone can follow along. */
function Steps({ call }: { call: CallController }) {
  const done = Boolean(call.lead.booked);
  const current = done ? 2 : isActive(call) || call.status === "ended" ? 1 : 0;
  return (
    <ol className="grid grid-cols-3 gap-2 sm:gap-3" aria-label="Call progress">
      {stepLabels.map((s, i) => {
        const complete = i < current || (done && i === 2);
        const active = i === current && !complete;
        return (
          <li
            key={s.title}
            aria-current={active ? "step" : undefined}
            className={cx(
              "rounded-xl border px-3 py-2.5 transition-colors duration-300 sm:px-4 sm:py-3",
              complete ? "border-good/30 bg-good-soft" : active ? "border-accent bg-card shadow-card" : "border-line bg-paper/60",
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cx(
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  complete ? "bg-good text-white" : active ? "bg-accent text-white" : "bg-paper-2 text-ink-3",
                )}
              >
                {complete ? (
                  <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden>
                    <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              <span className={cx("text-[13px] font-medium leading-tight sm:text-sm", complete || active ? "text-ink" : "text-ink-3")}>
                {s.title}
              </span>
            </div>
            <p className="mt-1 hidden pl-8 text-xs text-ink-3 sm:block">{s.body}</p>
          </li>
        );
      })}
    </ol>
  );
}

export function LiveDemo() {
  const { niche, persona, setNiche } = useNiche();
  const [mode, setMode] = useState<"live" | "sample">("live");
  const live = useLiveCall(niche);
  const sample = useSampleCall(niche);
  const call = mode === "live" ? live : sample;
  const busy = isActive(call);
  useRecordCall(live, niche);
  useRecordCall(sample, niche);

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
    <div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-orange-200 uppercase">Try saying</p>
        <p className="mt-2 text-base leading-relaxed text-white">
          {niche === "water" ? "“A pipe just burst in my kitchen. Can you help?”" : "“My roof is leaking. Can I book an inspection?”"}
        </p>
      </div>
      <div className="mt-5 flex flex-col items-center gap-3">
        <Button size="lg" onClick={startLive} className="call-start-button w-full">
          <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
            <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.2 1L6.6 10.8Z" />
          </svg>
          Start the call
        </Button>
        <p className="text-center text-xs text-night-ink-2">Allow your mic, then just talk naturally.</p>
        <Button
          variant="ghost"
          onClick={startSample}
          className="w-full border border-white/15 text-night-ink hover:bg-white/10 hover:text-white"
        >
          <span aria-hidden>▷</span> Watch a sample instead
        </Button>
      </div>
    </div>
  );

  const ended = (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
      <Link href="/contact" className={cx(buttonClass("primary", "md"), "w-full sm:w-auto")}>
        Get this on my number
      </Link>
      <Button
        variant="ghost"
        onClick={mode === "live" ? startLive : startSample}
        className="w-full text-night-ink-2 hover:bg-night-3 hover:text-night-ink sm:w-auto"
      >
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
    <section id="demo" className="py-10 sm:py-14">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <Eyebrow>Live call · {persona.business}</Eyebrow>
            <h1 className="mt-3 font-display text-[34px] leading-[1.08] tracking-tight text-ink sm:text-[44px]">
              Meet your next receptionist.
            </h1>
            <p className="mt-3 max-w-xl text-[15px] text-ink-2">
              Start a call. Play the customer. Watch your lead appear.
            </p>
          </div>
          <div className="flex flex-col gap-1.5 self-start md:items-end md:self-auto">
            <span className="text-xs text-ink-3">Pick a business</span>
            <NicheSwitch onChange={onNicheChange} disabled={busy} />
          </div>
        </div>

        <div className="mt-8">
          <Steps call={call} />
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

        <AnimatePresence>
          {call.status === "ended" && call.lead.booked && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-10 flex flex-col gap-5 rounded-[22px] bg-night p-6 text-night-ink shadow-lift sm:p-8 md:flex-row md:items-center md:justify-between"
            >
              <div className="max-w-xl">
                <p className="font-mono text-[11px] tracking-[0.14em] text-night-ink-2 uppercase">What just happened</p>
                <p className="mt-2 font-display text-2xl leading-snug sm:text-3xl">
                  That call booked {niche === "water" ? "a visit" : "an inspection"} on a job worth about{" "}
                  {money.format(persona.jobValue)} — and nobody at the office picked up.
                </p>
                <p className="mt-2 text-[15px] text-night-ink-2">
                  Picture that at 9:47 on a Tuesday night, on your number. I&apos;ll set it up and you test it first.
                </p>
              </div>
              <Link href="/contact" className={cx(buttonClass("primary", "lg"), "shrink-0")}>
                Get this on my number
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-14 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2.5 font-display text-2xl text-ink">
              Leads table
              {busy && (
                <span className="flex items-center gap-1.5 rounded-full bg-good-soft px-2.5 py-1 font-sans text-xs font-medium text-good">
                  <span className="size-1.5 animate-pulse rounded-full bg-good" />
                  Updating live
                </span>
              )}
            </h2>
            <p className="mt-1 text-sm text-ink-2">
              {busy
                ? "The highlighted row is your call. Watch each column fill in as you answer."
                : "Start a call and a new row appears at the top. Click any row for the full details."}
            </p>
          </div>
          <Link href="/leads" className={buttonClass("secondary", "md")}>
            View all leads
          </Link>
        </div>
        <div className="mt-5">
          <RecentLeads limit={5} />
        </div>
      </Container>
    </section>
  );
}


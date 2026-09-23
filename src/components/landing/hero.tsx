"use client";

import { motion } from "motion/react";
import { useNiche } from "@/components/niche-context";
import { Container, Eyebrow, buttonClass } from "@/components/ui/primitives";

const copy = {
  roofing: {
    time: "9:47",
    headline: ["It's 9:47pm.", "A ceiling is leaking.", "Who picks up?"],
    caller: "(813) 555-0142",
    text: "Hi, this is Bayshore Roofing — sorry we missed you. Is water coming in right now?",
    reply: "yes, through the kitchen ceiling",
  },
  water: {
    time: "2:13",
    headline: ["It's 2:13am.", "A pipe just burst.", "Who picks up?"],
    caller: "(727) 555-0198",
    text: "Hi, this is Gulf Coast Restoration — sorry we missed you. Is the water still running?",
    reply: "yes it's all over the floor",
  },
} as const;

export function Hero() {
  const { niche, persona } = useNiche();
  const c = copy[niche];

  return (
    <section id="top" className="relative overflow-hidden border-b border-line">
      <Container className="grid gap-12 pt-14 pb-16 sm:pt-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16 lg:pb-24">
        <div>
          <Eyebrow>For roofing &amp; water damage companies</Eyebrow>
          <h1 className="mt-5 font-display text-[40px] leading-[1.02] font-medium tracking-[-0.02em] text-ink sm:text-6xl lg:text-[68px]">
            {c.headline.map((line, i) => (
              <span key={line} className={i === 2 ? "block text-accent" : "block"}>
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink-2">
            {niche === "roofing"
              ? "When your crews are on a roof or the office is closed, an assistant answers the call"
              : "When your techs are on a job or it's the middle of the night, an assistant answers the call"}{" "}
            — gets the address, the damage and the insurance details, books the {niche === "roofing" ? "inspection" : "visit"},
            and texts you the job.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#demo" className={buttonClass("primary", "lg")}>
              <PhoneGlyph />
              Call the demo
            </a>
            <a href="#math" className={buttonClass("secondary", "lg")}>
              See what you&apos;re losing
            </a>
          </div>
          <p className="mt-6 text-sm text-ink-3">Works on the number you already have. Nothing to install.</p>
        </div>

        <PhoneMock key={niche} {...c} business={persona.business} />
      </Container>
    </section>
  );
}

function PhoneMock({
  time,
  caller,
  text,
  reply,
  business,
}: {
  time: string;
  caller: string;
  text: string;
  reply: string;
  business: string;
}) {
  const pm = time === "9:47";
  return (
    <div className="mx-auto w-full max-w-[340px] lg:mx-0 lg:justify-self-end">
      <div className="rounded-[40px] bg-night p-2.5 shadow-lift">
        <div className="relative overflow-hidden rounded-[32px] bg-night-2 px-4 pt-3 pb-6 text-night-ink">
          <div className="mx-auto mb-6 h-5 w-24 rounded-full bg-night" aria-hidden />
          <div className="text-center">
            <p className="text-[13px] text-night-ink-2">{pm ? "Tuesday, September 23" : "Wednesday, September 24"}</p>
            <p className="mt-1 font-display text-[64px] leading-none font-light tabular">{time}</p>
          </div>

          <div className="mt-8 space-y-2.5">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="rounded-2xl bg-night-3/90 p-3"
            >
              <NoteHead app="Phone" when={`${time} ${pm ? "PM" : "AM"}`} />
              <p className="mt-1 text-[14px] font-medium">Missed call</p>
              <p className="text-[13px] text-night-ink-2">{caller}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.9 }}
              className="rounded-2xl bg-night-3/90 p-3"
            >
              <NoteHead app={`Messages · to ${caller}`} when="now" />
              <p className="mt-1 text-[13px] leading-snug">{text}</p>
              <p className="mt-1.5 font-mono text-[10px] tracking-wide text-night-ink-2 uppercase">Sent 6s after missed call</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.7 }}
              className="ml-8 rounded-2xl bg-accent p-3 text-white"
            >
              <p className="text-[13px] leading-snug">{reply}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 2.5 }}
              className="rounded-2xl border border-night-line bg-night p-3"
            >
              <NoteHead app={business} when="now" />
              <p className="mt-1 text-[13px] leading-snug">
                New job booked · inspection {pm ? "tomorrow 8:00 AM" : "tech on the way"}. Owner notified.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NoteHead({ app, when }: { app: string; when: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[11px] text-night-ink-2">
      <span className="truncate font-medium tracking-wide uppercase">{app}</span>
      <span className="shrink-0">{when}</span>
    </div>
  );
}

function PhoneGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

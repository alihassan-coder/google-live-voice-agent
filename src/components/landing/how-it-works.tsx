"use client";

import { useNiche } from "@/components/niche-context";
import { Container, Eyebrow } from "@/components/ui/primitives";

const steps = {
  roofing: [
    {
      title: "The call you'd miss",
      body: "Crews are up on a roof, the office closed at five, it's storm season and the phone won't stop. The call rolls over instead of going to voicemail.",
      meta: "9:47 PM · rings 4 times",
    },
    {
      title: "Answered in seconds",
      body: "By voice or by text, the homeowner gets a calm reply right away. It asks the address, how old the roof is, whether water's coming in, and if an insurance claim is involved.",
      meta: "Answered in 0.8s",
    },
    {
      title: "Booked, and you get the text",
      body: "The inspection lands in your calendar and you get one line on your phone: who, where, what's wrong, when you're going. You call back in the morning with the job already yours.",
      meta: "Inspection · tomorrow 8:00 AM",
    },
  ],
  water: [
    {
      title: "The call you'd miss",
      body: "Your techs are out on a dry-out, it's 2am, and someone's kitchen is flooding. The call rolls over instead of ringing out.",
      meta: "2:13 AM · rings 4 times",
    },
    {
      title: "Answered in seconds",
      body: "The caller gets a calm reply right away. It asks where the water's coming from, whether it's still flowing, the address, and if they're going through insurance — and tells them where the shut-off usually is.",
      meta: "Answered in 0.8s",
    },
    {
      title: "Tech dispatched, owner texted",
      body: "Real emergencies go straight to your on-call tech. Everything else is booked for the morning. You get one line with who, where and how bad.",
      meta: "Emergency · on-call tech alerted",
    },
  ],
} as const;

export function HowItWorks() {
  const { niche } = useNiche();
  return (
    <section id="how" className="border-b border-line py-20 sm:py-28">
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-4 font-display text-4xl leading-[1.05] font-medium tracking-[-0.015em] sm:text-5xl">
            Three things happen. You only see the last one.
          </h2>
        </div>

        <ol className="mt-14 grid gap-px overflow-hidden rounded-[14px] border border-line bg-line md:grid-cols-3">
          {steps[niche].map((s, i) => (
            <li key={s.title} className="flex flex-col bg-card p-6 sm:p-8">
              <span className="font-mono text-sm text-accent tabular">0{i + 1}</span>
              <h3 className="mt-5 font-display text-2xl font-medium tracking-tight">{s.title}</h3>
              <p className="mt-3 flex-1 text-[15px] leading-relaxed text-ink-2">{s.body}</p>
              <p className="mt-6 border-t border-line pt-4 font-mono text-[12px] text-ink-3">{s.meta}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

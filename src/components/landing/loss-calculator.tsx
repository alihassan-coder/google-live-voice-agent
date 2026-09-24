"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { useNiche } from "@/components/niche-context";
import { Container, Eyebrow, buttonClass } from "@/components/ui/primitives";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const whole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export function LossCalculator() {
  const { persona } = useNiche();
  // Re-mount per trade so the job value default follows the niche switch.
  return <Calculator key={persona.id} defaultJob={persona.jobValue} />;
}

function Calculator({ defaultJob }: { defaultJob: number }) {
  const [calls, setCalls] = useState(120);
  const [missed, setMissed] = useState(22);
  const [close, setClose] = useState(25);
  const [job, setJob] = useState(defaultJob);

  const missedPerMonth = (calls * missed) / 100;
  const lostJobsPerYear = missedPerMonth * (close / 100) * 12;
  const perYear = lostJobsPerYear * job;

  return (
    <section id="math" className="border-b border-line bg-paper-2/60 py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <Eyebrow>The math</Eyebrow>
          <h2 className="mt-4 font-display text-4xl leading-[1.05] font-medium tracking-[-0.015em] sm:text-5xl">
            What rings out after hours.
          </h2>
          <p className="mt-5 max-w-md text-[16px] leading-relaxed text-ink-2">
            Your numbers, not mine. A homeowner with water coming in calls two or three companies and goes with whoever
            answers first. Move the sliders to match your shop.
          </p>
        </div>

        <div className="rounded-[14px] border border-line bg-card p-5 shadow-card sm:p-8">
          <div className="grid gap-6">
            <Field label="Calls per month" value={calls} display={whole.format(calls)} min={20} max={600} step={10} onChange={setCalls} />
            <Field label="Missed or after hours" value={missed} display={`${missed}%`} min={5} max={60} step={1} onChange={setMissed} />
            <Field label="Of those, would have become a job" value={close} display={`${close}%`} min={5} max={60} step={1} onChange={setClose} />
            <Field
              label="Average job value"
              value={job}
              display={money.format(job)}
              min={1000}
              max={40000}
              step={500}
              onChange={setJob}
            />
          </div>

          <div className="mt-8 border-t border-line pt-6">
            <p className="text-sm text-ink-3">Roughly going to voicemail each year</p>
            <p className="mt-1 font-display text-5xl font-medium tracking-tight text-accent tabular sm:text-6xl" aria-live="polite">
              ≈ {money.format(Math.round(perYear / 100) * 100)}
            </p>
            <p className="mt-3 font-mono text-[12px] leading-relaxed text-ink-3 tabular">
              {whole.format(calls)} calls × {missed}% missed × {close}% close × {money.format(job)} × 12 months ={" "}
              {whole.format(lostJobsPerYear)} jobs a year
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/contact" className={buttonClass("primary", "lg")}>
                Stop missing these calls
              </Link>
              <Link href="/demo" className={buttonClass("secondary", "lg")}>
                Hear how it answers one
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Field({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const id = useId();
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-[15px] text-ink-2">
          {label}
        </label>
        <output htmlFor={id} className="font-mono text-[15px] font-medium text-ink tabular">
          {display}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 h-2 w-full cursor-pointer accent-[var(--accent)]"
      />
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { LeadsDashboard } from "@/components/leads/leads-dashboard";
import { Container, Eyebrow, buttonClass } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Leads",
  description: "Every after-hours call, answered and written down: who called, what's wrong, how urgent, and when you're booked.",
};

export default function LeadsPage() {
  return (
    <section className="py-10 sm:py-14">
      <Container>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <Eyebrow>Owner dashboard</Eyebrow>
            <h1 className="mt-3 font-display text-[34px] leading-[1.08] tracking-tight text-ink sm:text-[44px]">
              Your leads
            </h1>
            <p className="mt-3 text-[15px] text-ink-2">
              Every call the assistant answered, written down for you. Green means booked, amber means call them back, red
              means it&apos;s an emergency.
            </p>
          </div>
          <Link href="/demo" className={buttonClass("primary", "lg")}>
            Make a test call
          </Link>
        </div>
        <div className="mt-8">
          <LeadsDashboard />
        </div>

        <div className="mt-12 flex flex-col gap-5 rounded-[22px] bg-night p-6 text-night-ink shadow-lift sm:p-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <p className="font-display text-2xl leading-snug sm:text-3xl">Want this list waiting for you every morning?</p>
            <p className="mt-2 text-[15px] text-night-ink-2">
              Every missed call answered, written down and booked — on the number you already have.
            </p>
          </div>
          <Link href="/contact" className={`${buttonClass("primary", "lg")} shrink-0`}>
            Get it on my number
          </Link>
        </div>
      </Container>
    </section>
  );
}

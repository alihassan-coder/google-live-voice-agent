import { Container, buttonClass } from "@/components/ui/primitives";
import { bookingUrl, contactEmail, mailto } from "./contact";

export function ClosingCta() {
  return (
    <section className="bg-night py-20 text-night-ink sm:py-28">
      <Container className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <h2 className="font-display text-4xl leading-[1.05] font-medium tracking-[-0.015em] sm:text-6xl">
            Want it answering your phone by next week?
          </h2>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-night-ink-2">
            Reply to my email or write to me directly. I&apos;ll set it up with your business name, your hours and your
            booking rules, and you can call it yourself before it ever talks to a customer.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch">
          <a href={mailto("Set up after-hours answering")} className={buttonClass("primary", "lg")}>
            Email {contactEmail}
          </a>
          {bookingUrl ? (
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-full border border-night-line px-6 text-[15px] font-medium text-night-ink transition-colors hover:bg-night-2"
            >
              Book a 15-minute call
            </a>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

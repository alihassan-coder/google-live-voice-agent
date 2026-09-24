import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";
import { bookingUrl, contactEmail, contactPhone, gmailUrl, smsUrl, telUrl } from "@/components/landing/contact";
import { Container, Eyebrow } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Get started",
  description: "Get the after-hours assistant answering your business number. Leave your details and I'll call you back.",
};

const next = [
  { title: "I call you back", body: "A short call about your hours, service area and how you like jobs booked." },
  { title: "I set it up for you", body: "Your business name, your hours, your booking rules. It takes a few days." },
  { title: "You test it yourself", body: "Call it as many times as you like. It only goes live on your number when you're happy." },
];

export default function ContactPage() {
  return (
    <section className="py-10 sm:py-14">
      <Container className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
        <div>
          <Eyebrow>Get started</Eyebrow>
          <h1 className="mt-3 font-display text-[34px] leading-[1.08] tracking-tight text-ink sm:text-[44px]">
            Stop losing the calls that come in after 5pm.
          </h1>
          <p className="mt-4 max-w-md text-[16px] leading-relaxed text-ink-2">
            Leave your number. I&apos;ll set it up on the phone number you already have — nothing to install, nothing new for
            your customers.
          </p>

          <h2 className="mt-10 font-mono text-[11px] font-medium tracking-[0.14em] text-ink-3 uppercase">What happens next</h2>
          <ol className="mt-4 space-y-5">
            {next.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent font-display text-white">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium text-ink">{s.title}</p>
                  <p className="mt-0.5 text-[15px] leading-relaxed text-ink-2">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 rounded-2xl border border-line bg-paper-2/60 p-5">
            <p className="text-sm font-medium text-ink">Rather reach me directly?</p>
            <ul className="mt-3 space-y-2 text-[15px]">
              {contactPhone && (
                <li className="flex flex-wrap gap-x-3">
                  <a href={telUrl(contactPhone)} className="text-ink underline decoration-line-2 underline-offset-4 hover:decoration-ink">
                    Call {contactPhone}
                  </a>
                  <a href={smsUrl(contactPhone)} className="text-ink-2 underline decoration-line-2 underline-offset-4 hover:decoration-ink">
                    or text
                  </a>
                </li>
              )}
              <li>
                <a
                  href={gmailUrl("After-hours call answering")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-ink underline decoration-line-2 underline-offset-4 hover:decoration-ink"
                >
                  {contactEmail}
                </a>
              </li>
              {bookingUrl && (
                <li>
                  <a
                    href={bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink underline decoration-line-2 underline-offset-4 hover:decoration-ink"
                  >
                    Book a 15-minute call
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <ContactForm />
      </Container>
    </section>
  );
}

"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type FormEvent } from "react";
import { contactEmail, gmailUrl, mailto } from "@/components/landing/contact";
import { useNiche } from "@/components/niche-context";
import { Button, buttonClass, cx } from "@/components/ui/primitives";

const TRADES = ["Roofing", "Water damage", "Both", "Other"] as const;

type Form = { name: string; business: string; phone: string; email: string; trade: string; message: string };
type State = "idle" | "sending" | "sent" | "fallback";

const inputClass =
  "mt-1.5 h-11 w-full rounded-xl border border-line bg-card px-3.5 text-[15px] text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3 text-sm font-medium text-ink">
        {label}
        {hint && <span className="text-xs font-normal text-ink-3">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function summary(f: Form) {
  return [
    `Hi Ali, I'd like after-hours call answering for my business.`,
    ``,
    `Name: ${f.name}`,
    `Business: ${f.business || "—"}`,
    `Trade: ${f.trade}`,
    `Phone: ${f.phone}`,
    f.email ? `Email: ${f.email}` : null,
    f.message ? `\n${f.message}` : null,
  ]
    .filter((l) => l !== null)
    .join("\n");
}

export function ContactForm() {
  const { niche } = useNiche();
  const [form, setForm] = useState<Form>({
    name: "",
    business: "",
    phone: "",
    email: "",
    trade: niche === "water" ? "Water damage" : "Roofing",
    message: "",
  });
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const set = (k: keyof Form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const subject = `After-hours answering for ${form.business || form.name || "my business"}`;

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) return setError("Please add your name.");
    if (form.phone.replace(/\D/g, "").length < 7) return setError("Please add a phone number I can call you back on.");

    setState("sending");
    try {
      const website = (e.currentTarget.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, website }),
      });
      if (res.ok) return setState("sent");
      if (res.status === 400) {
        setState("idle");
        return setError("Please check your name and phone number.");
      }
      // Not configured, rate limited or the mail service is down: send it another way.
      setState("fallback");
    } catch {
      setState("fallback");
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`To: ${contactEmail}\nSubject: ${subject}\n\n${summary(form)}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-[22px] border border-line bg-card p-5 shadow-lift sm:p-8">
      <AnimatePresence mode="wait" initial={false}>
        {state === "sent" ? (
          <motion.div key="sent" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="py-8 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-good-soft text-good">
              <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden>
                <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <h2 className="mt-5 font-display text-3xl text-ink">Got it, {form.name.split(" ")[0]}.</h2>
            <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-ink-2">
              I&apos;ll call you on <span className="font-medium text-ink">{form.phone}</span> within one business day to
              set it up with your business name and hours.
            </p>
          </motion.div>
        ) : state === "fallback" ? (
          <motion.div key="fallback" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="font-display text-2xl text-ink">One more click to send it</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
              Your details are filled in below. Pick whichever you use — it goes straight to{" "}
              <span className="font-medium text-ink">{contactEmail}</span>.
            </p>
            <pre className="mt-4 max-h-48 overflow-auto rounded-xl bg-paper-2 p-4 font-sans text-sm leading-relaxed whitespace-pre-wrap text-ink-2">
              {summary(form)}
            </pre>
            <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
              <a href={gmailUrl(subject, summary(form))} target="_blank" rel="noopener noreferrer" className={buttonClass("primary", "md")}>
                Send with Gmail
              </a>
              <a href={mailto(subject, summary(form))} className={buttonClass("secondary", "md")}>
                Email app
              </a>
              <Button variant="secondary" onClick={copy}>
                {copied ? "Copied ✓" : "Copy details"}
              </Button>
            </div>
            <button type="button" onClick={() => setState("idle")} className="mt-4 text-sm text-ink-3 underline underline-offset-4 hover:text-ink">
              ← Edit my details
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={onSubmit} noValidate className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Your name">
                <input className={inputClass} value={form.name} onChange={set("name")} autoComplete="name" placeholder="Mike Johnson" required />
              </Field>
              <Field label="Business name">
                <input className={inputClass} value={form.business} onChange={set("business")} autoComplete="organization" placeholder="Bayshore Roofing" />
              </Field>
              <Field label="Phone" hint="I'll call you back">
                <input className={inputClass} value={form.phone} onChange={set("phone")} type="tel" autoComplete="tel" placeholder="(813) 555-0100" required />
              </Field>
              <Field label="Email" hint="Optional">
                <input className={inputClass} value={form.email} onChange={set("email")} type="email" autoComplete="email" placeholder="you@company.com" />
              </Field>
            </div>

            <fieldset>
              <legend className="text-sm font-medium text-ink">Your trade</legend>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {TRADES.map((t) => (
                  <label
                    key={t}
                    className={cx(
                      "cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent/30",
                      form.trade === t ? "border-accent bg-accent-soft text-accent-strong" : "border-line bg-card text-ink-2 hover:border-line-2",
                    )}
                  >
                    <input type="radio" name="trade" value={t} checked={form.trade === t} onChange={set("trade")} className="sr-only" />
                    {t}
                  </label>
                ))}
              </div>
            </fieldset>

            <Field label="Anything I should know?" hint="Optional">
              <textarea
                className={cx(inputClass, "h-24 resize-none py-2.5")}
                value={form.message}
                onChange={set("message")}
                placeholder="e.g. We miss most calls after 5pm and on Saturdays."
              />
            </Field>

            {/* Honeypot for bots. Hidden from people and screen readers. */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

            {error && (
              <p role="alert" className="rounded-xl bg-warn-soft px-3.5 py-2.5 text-sm text-warn">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" disabled={state === "sending"} className="mt-1 w-full">
              {state === "sending" ? "Sending…" : "Get it answering my phone"}
            </Button>
            <p className="text-center text-xs text-ink-3">No obligation. You test it yourself before it ever talks to a customer.</p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

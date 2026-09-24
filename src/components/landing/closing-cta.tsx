import Link from "next/link";
import { Container, buttonClass } from "@/components/ui/primitives";

export function ClosingCta() {
  return (
    <section className="bg-paper py-12 sm:py-16">
      <Container><div className="flex flex-col justify-between gap-6 rounded-2xl bg-night px-6 py-8 text-white sm:flex-row sm:items-center sm:px-10 sm:py-10"><div><h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Hear it. Then picture it on your number.</h2><p className="mt-3 text-sm text-slate-300">Your business name. Your booking rules. Set up with you.</p></div><div className="flex shrink-0 flex-col items-start gap-3 sm:items-center"><Link href="/demo" className={buttonClass("primary", "lg")}>Try a live call <span aria-hidden>↗</span></Link><Link href="/contact" className="warm-contact-button inline-flex">Let’s talk about your business <span aria-hidden>↗</span></Link></div></div></Container>
    </section>
  );
}


import { Container } from "@/components/ui/primitives";

const faqs = [
  { q: "Can I keep my phone number?", a: "Yes. We set up forwarding from your existing number for the calls your team can’t take." },
  { q: "Can I try it before setup?", a: "Yes. Open the live demo and speak as a customer. You can also watch a sample call without a microphone." },
  { q: "How does setup work?", a: "We configure your business details, service area, and booking rules together. You test it before it handles customer calls." },
];

export function Faq() {
  return <section className="bg-paper pt-10 sm:pt-12"><Container className="grid gap-5 md:grid-cols-[1fr_2fr]"><h2 className="text-xl font-semibold tracking-tight">A few quick answers.</h2><div className="divide-y divide-line">{faqs.map(f => <details key={f.q} className="group"><summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">{f.q}<span aria-hidden className="text-xl text-ink-3 group-open:rotate-45">+</span></summary><p className="max-w-xl pb-4 text-sm leading-relaxed text-ink-2">{f.a}</p></details>)}</div></Container></section>;
}


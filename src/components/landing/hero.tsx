import Link from "next/link";
import { Container, buttonClass } from "@/components/ui/primitives";

export function Hero() {
  return (
    <section className="sales-hero" id="top">
      <Container className="grid items-center gap-12 py-14 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-20">
        <div>
          <p className="mb-6 flex items-center gap-2 text-xs font-semibold tracking-[0.09em] text-ink-2 uppercase"><span className="size-2 rounded-full bg-accent" /> For roofers &amp; restoration teams</p>
          <h1 className="sales-headline">You do the job.<br />We answer<br /><span className="text-accent">the next call.</span></h1>
          <p className="mt-6 max-w-[420px] text-lg leading-relaxed text-ink-2">Your AI receptionist answers after hours, captures the details, and books the next step.</p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link href="/demo" className={buttonClass("primary", "lg")}>Try a live call <span aria-hidden>↗</span></Link>
            <a href="#how-it-works" className="text-sm font-semibold text-ink underline decoration-line-2 underline-offset-4">How it works</a>
          </div>
          <p className="mt-4 text-xs text-ink-3">No signup. Try it right in your browser.</p>
        </div>
        <div className="call-preview">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-5">
            <span className="text-[11px] font-medium tracking-widest text-slate-300 uppercase">Your business. After hours.</span>
            <span className="shrink-0 text-xs text-slate-400">9:47 PM</span>
          </div>
          <div className="flex items-center gap-4 pt-6">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-orange-300"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden><path d="M5 3h3l2 5-2.5 1.5a12 12 0 0 0 7 7L16 14l5 2v3a2 2 0 0 1-2 2A18 18 0 0 1 3 5a2 2 0 0 1 2-2Z" /></svg></span>
            <div><p className="text-lg font-semibold text-white">A customer calls.</p><p className="mt-0.5 text-sm text-slate-400">Your assistant picks up.</p></div>
          </div>
          <div className="my-6 flex h-14 items-center justify-center gap-[5px]" aria-hidden>{[12,20,14,30,42,24,38,52,30,44,20,36,50,28,40,18,30,46,24,36,14,22,12].map((height, i) => <span key={i} className="w-1.5 rounded-full bg-orange-400" style={{height, opacity: 0.45 + (i % 4) * 0.16}} />)}</div>
          <div className="space-y-3 text-sm leading-relaxed">
            <p className="mr-6 rounded-2xl rounded-bl-sm bg-white/10 px-4 py-3 text-slate-200">“My roof is leaking. Can someone come tomorrow?”</p>
            <p className="ml-6 rounded-2xl rounded-br-sm border border-orange-400/25 bg-orange-400/10 px-4 py-3 text-orange-100">“I can help. What’s the property address?”</p>
          </div>
          <div className="mt-6 rounded-xl bg-white p-4 text-ink shadow-lg">
            <div className="flex items-center gap-2 text-xs font-semibold text-good"><span className="grid size-5 place-items-center rounded-full bg-good-soft">✓</span> Inspection booked <span className="ml-auto font-normal text-ink-3">Example</span></div>
            <p className="mt-2 text-sm font-semibold">Tomorrow, 8:00 AM</p>
            <p className="mt-1 text-xs text-ink-2">Roof leak · Customer details ready for your team</p>
          </div>
          <p className="mt-4 text-center text-[11px] text-slate-400">Illustrative call · Experience it in the live demo</p>
        </div>
      </Container>
    </section>
  );
}


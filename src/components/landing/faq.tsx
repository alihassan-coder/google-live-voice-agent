import { Container, Eyebrow } from "@/components/ui/primitives";

const faqs = [
  {
    q: "Does this replace my office?",
    a: "No. It covers the calls your office can't take — after hours, weekends, lunch, and the afternoon every truck is out. During the day your people answer like they always have.",
  },
  {
    q: "Will callers know it's an assistant?",
    a: "If they ask, it says so plainly — it's your after-hours assistant. Most people just want to know someone's coming. It sounds calm, local and brief, not like a phone tree.",
  },
  {
    q: "Do I need a new phone number?",
    a: "No. It sits behind the number you already have on your trucks and your Google listing. Unanswered calls roll over to it; nothing changes for your customers.",
  },
  {
    q: "What about insurance jobs?",
    a: "It asks whether they're filing a claim and notes it for you, so you know before you call back. It never promises coverage or talks prices — that stays with you and the adjuster.",
  },
  {
    q: "What if it's a real emergency?",
    a: "You set the rules. Water still coming in, a tree through the roof, a burst pipe — it can text or call your on-call person straight away instead of waiting for morning.",
  },
  {
    q: "How long does setup take?",
    a: "A few days. I set it up with your business name, service area, hours and booking rules, you test it by calling it yourself, and it goes live when you're happy with it.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="border-b border-line py-20 sm:py-28">
      <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <Eyebrow>Questions owners ask</Eyebrow>
          <h2 className="mt-4 font-display text-4xl leading-[1.05] font-medium tracking-[-0.015em] sm:text-5xl">
            Straight answers.
          </h2>
        </div>
        <div className="divide-y divide-line border-y border-line">
          {faqs.map((f) => (
            <details key={f.q} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[17px] font-medium text-ink [&::-webkit-details-marker]:hidden">
                {f.q}
                <span
                  aria-hidden
                  className="grid size-7 shrink-0 place-items-center rounded-full border border-line text-ink-3 transition-transform group-open:rotate-45"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12">
                    <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </span>
              </summary>
              <p className="max-w-2xl pb-6 text-[15px] leading-relaxed text-ink-2">{f.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}

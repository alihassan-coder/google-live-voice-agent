import { Container } from "@/components/ui/primitives";

const steps = [
  { title: "Every call has a next step.", body: "An AI receptionist answers when your team can’t." },
  { title: "The details, already handled.", body: "Name, address, problem, and urgency. All captured." },
  { title: "Your team takes it from here.", body: "Review the lead and the appointment in one place." },
];

export function DemoTeaser() {
  return (
    <section id="how-it-works" className="scroll-mt-24 border-y border-line bg-white py-10 sm:py-12">
      <Container>
        <div className="mb-7 flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-semibold tracking-tight sm:text-2xl">One call. Less work for you.</h2><span className="text-xs text-ink-3">From first ring to next step</span></div>
        <ol className="grid gap-7 md:grid-cols-3 md:gap-8">
          {steps.map((step, index) => <li key={step.title} className="flex gap-3"><span className="pt-0.5 font-mono text-sm text-accent">0{index + 1}</span><div><h3 className="text-base font-semibold tracking-tight">{step.title}</h3><p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-2">{step.body}</p></div></li>)}
        </ol>
      </Container>
    </section>
  );
}


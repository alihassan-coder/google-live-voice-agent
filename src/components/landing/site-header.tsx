import { Container, buttonClass } from "@/components/ui/primitives";
import { mailto } from "./contact";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/90 backdrop-blur supports-[backdrop-filter]:bg-paper/75">
      <Container className="flex h-14 items-center justify-between gap-4">
        <a href="#top" className="flex items-baseline gap-2.5">
          <span className="font-display text-[19px] font-semibold tracking-tight text-ink">Ali Hassan</span>
          <span className="hidden text-[13px] text-ink-3 sm:inline">After-hours call answering</span>
        </a>
        <nav className="flex items-center gap-1 sm:gap-2">
          <a href={mailto("After-hours call answering")} className="hidden px-3 text-sm text-ink-2 hover:text-ink sm:inline">
            Contact
          </a>
          <a href="#demo" className={buttonClass("primary", "md")}>
            Try the demo
          </a>
        </nav>
      </Container>
    </header>
  );
}

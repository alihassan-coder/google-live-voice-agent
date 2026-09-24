import Link from "next/link";
import { Container } from "@/components/ui/primitives";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-paper py-6 text-ink-3">
      <Container className="flex flex-wrap items-center justify-between gap-4 text-xs">
        <p>© 2026 Ali Hassan · AI call answering</p>
        <nav aria-label="Footer" className="flex gap-5"><Link href="/leads" className="hover:text-ink">Demo leads</Link><Link href="/contact" className="hover:text-ink">Contact</Link></nav>
      </Container>
    </footer>
  );
}


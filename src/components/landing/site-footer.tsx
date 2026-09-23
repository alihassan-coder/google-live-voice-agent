import { Container } from "@/components/ui/primitives";

export function SiteFooter() {
  return (
    <footer className="border-t border-night-line bg-night py-8 text-night-ink-2">
      <Container className="flex flex-col gap-2 text-[13px] sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 Ali Hassan</p>
        <p>Demo uses a sample business. Calls in the demo aren&apos;t recorded or stored.</p>
      </Container>
    </footer>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container, buttonClass } from "@/components/ui/primitives";

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/95 backdrop-blur">
      <Container className="flex h-[76px] items-center justify-between gap-3">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Ali Hassan home">
          <span className="flex size-9 items-center justify-center gap-[3px] rounded-xl bg-night text-white" aria-hidden>{[10,18,24,14].map((h,i)=><span key={i} className="w-[3px] rounded-full bg-current" style={{height:h}} />)}</span>
          <span className="text-lg font-semibold tracking-tight">Ali Hassan<span className="hidden text-accent sm:inline">.</span></span>
        </Link>
        <nav aria-label="Main" className="flex items-center gap-5 sm:gap-7">
          <Link href={pathname === "/" ? "#how-it-works" : "/"} className="hidden text-sm text-ink-2 hover:text-ink md:block">{pathname === "/" ? "How it works" : "Home"}</Link>
          <Link href="/leads" aria-current={pathname === "/leads" ? "page" : undefined} className="hidden text-sm text-ink-2 hover:text-ink sm:block">Demo leads</Link>
          <Link href="/contact" aria-current={pathname === "/contact" ? "page" : undefined} className={`warm-contact-button ${pathname === "/demo" ? "inline-flex" : "hidden sm:inline-flex"}`}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-3 2V11.5a10 10 0 0 1 20 0Z" strokeLinejoin="round"/><path d="M7 10h8M7 14h5" strokeLinecap="round"/></svg>Let’s talk<span aria-hidden>↗</span></Link>
          <span className={pathname === "/demo" ? "hidden sm:block" : "block"}><Link href="/demo" aria-current={pathname === "/demo" ? "page" : undefined} className={buttonClass("primary", "md")}>Try a live call <span aria-hidden>↗</span></Link></span>
        </nav>
      </Container>
    </header>
  );
}


import { LiveDemo } from "@/components/demo/live-demo";
import { ClosingCta } from "@/components/landing/closing-cta";
import { Faq } from "@/components/landing/faq";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LossCalculator } from "@/components/landing/loss-calculator";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { NicheProvider } from "@/components/niche-context";

export default function Home() {
  return (
    <NicheProvider>
      <SiteHeader />
      <main>
        <Hero />
        <LiveDemo />
        <HowItWorks />
        <LossCalculator />
        <Faq />
        <ClosingCta />
      </main>
      <SiteFooter />
    </NicheProvider>
  );
}

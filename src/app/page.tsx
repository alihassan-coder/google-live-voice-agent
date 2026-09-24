import { ClosingCta } from "@/components/landing/closing-cta";
import { DemoTeaser } from "@/components/landing/demo-teaser";
import { Faq } from "@/components/landing/faq";
import { Hero } from "@/components/landing/hero";

export default function Home() {
  return (
    <>
      <Hero />
      <DemoTeaser />
      <Faq />
      <ClosingCta />
    </>
  );
}

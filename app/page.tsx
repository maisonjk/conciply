import Nav, { Footer, VisionStatement } from "@/components/Nav";
import HeroInput from "@/components/HeroInput";
import { ProofBar, HowItWorks, WhatYouGet, Testimonials, FinalCTA } from "@/components/LandingSections";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main className="shell"><HeroInput /></main>
      <ProofBar />
      <HowItWorks />
      <WhatYouGet />
      <VisionStatement />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </>
  );
}

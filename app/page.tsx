import Nav, { Footer, VisionStatement } from "@/components/Nav";
import HeroInput from "@/components/HeroInput";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main className="shell"><HeroInput /></main>
      <VisionStatement />
      <Footer />
    </>
  );
}

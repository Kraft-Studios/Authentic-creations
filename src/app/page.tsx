import Hero from "@/components/home/Hero";
import Intro from "@/components/home/Intro";
import Services from "@/components/home/Services";
import Gallery from "@/components/home/Gallery";
import BigType from "@/components/home/BigType";
import Products from "@/components/home/Products";
import StudioTeaser from "@/components/home/StudioTeaser";
import Process from "@/components/home/Process";
import Statement from "@/components/home/Statement";
import Contact from "@/components/home/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <Intro />
        <Services />
        <Gallery />
        <BigType />
        <Products />
        <StudioTeaser />
        <Process />
        <Statement />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

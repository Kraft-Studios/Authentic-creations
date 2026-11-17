"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SITE } from "@/lib/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const HeroScene = dynamic(() => import("@/three/HeroScene"), { ssr: false, loading: () => null });

export default function Hero() {
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [onScreen, setOnScreen] = useState(true);

  // Stop rendering the 3D scene once it has scrolled away, so the rest of the page stays smooth.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: section.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          progress.current = self.progress;
        },
      });

      const intro = gsap.timeline({ delay: 0.2 });
      intro
        .from(".hero-line", { yPercent: 115, stagger: 0.1, duration: 1.4, ease: "expo.out" })
        .from(".hero-fade", { opacity: 0, y: 14, stagger: 0.08, duration: 1, ease: "power3.out" }, "-=0.9")
        .from(".hero-canvas", { opacity: 0, scale: 1.04, duration: 2, ease: "power2.out" }, 0);

      const tl = gsap.timeline({ scrollTrigger: { trigger: section.current, start: "top top", end: "bottom bottom", scrub: true } });
      tl.to(".hero-copy", { opacity: 0, y: -80, ease: "none", duration: 0.32 }, 0.04)
        .to(".hero-step-1", { opacity: 0, duration: 0.08 }, 0.18)
        .fromTo(".hero-step-2", { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0.22)
        .fromTo(".hero-outro", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.25, ease: "none" }, 0.6);
    },
    { scope: section },
  );

  return (
    <section ref={section} className="relative h-[230svh]" aria-label="Introduction">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="hero-canvas absolute inset-0">
          <HeroScene progress={progress} active={onScreen} />
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-20 flex justify-between px-5 md:px-8">
          <div className="eyebrow text-dim">
            <p className="hero-step-1">( 01 ) blank</p>
            <p className="hero-step-2 -mt-[1.45em] text-fg opacity-0">( 02 ) pressed</p>
          </div>
        </div>

        <div className="hero-copy pointer-events-none absolute inset-x-0 bottom-0 px-5 pb-16 md:px-8 md:pb-12">
          <h1 className="text-[17vw] leading-[0.86] tracking-[-0.06em] dark:mix-blend-difference md:text-[10.5vw]">
            <span className="block overflow-hidden pb-[0.04em]">
              <span className="hero-line block">From blank</span>
            </span>
            <span className="block overflow-hidden pb-[0.06em]">
              <span className="hero-line block">
                to <span className="font-mono text-[0.86em] tracking-[-0.08em]">yours.</span>
              </span>
            </span>
          </h1>
          <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <p className="hero-fade max-w-md text-lg leading-snug text-fg/75 md:text-xl">
              {SITE.tagline} Design it in 3D, we press it by hand and deliver anywhere in South Africa.
            </p>
            <div className="hero-fade pointer-events-auto flex flex-wrap gap-3">
              <Link
                href="/studio"
                className="rounded-full bg-fg px-6 py-3 text-[15px] text-bg transition-transform duration-500 hover:scale-[1.04]"
              >
                Design yours in 3D
              </Link>
              <Link
                href="/products"
                className="rounded-full border border-fg/40 px-6 py-3 text-[15px] transition-colors duration-300 hover:border-fg"
              >
                See products
              </Link>
            </div>
          </div>
        </div>

        <div className="hero-outro pointer-events-none absolute inset-x-0 bottom-0 px-5 pb-16 opacity-0 md:px-8 md:pb-12">
          <p className="max-w-4xl text-[11vw] leading-[0.9] tracking-[-0.055em] md:text-[6vw]">
            Heat. Pressure.
            <br />
            <span className="text-dim">Colour that stays.</span>
          </p>
        </div>
      </div>
    </section>
  );
}

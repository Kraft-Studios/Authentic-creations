"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { PROCESS } from "@/lib/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Pinned section that scrolls sideways through the four steps (stacks on phones). */
export default function Process() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current!;
        const distance = () => el.scrollWidth - window.innerWidth;
        const tween = gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${distance()}`, pin: true, scrub: 1, invalidateOnRefresh: true },
        });
        gsap.to(".proc-bar", { scaleX: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${distance()}`, scrub: true } });
        gsap.utils.toArray<HTMLElement>(".proc-img img").forEach((img) => {
          gsap.fromTo(
            img,
            { xPercent: -8 },
            { xPercent: 8, ease: "none", scrollTrigger: { trigger: img, containerAnimation: tween, start: "left right", end: "right left", scrub: true } },
          );
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="process" className="relative overflow-hidden border-t border-line bg-bg">
      <div className="absolute inset-x-0 bottom-0 z-10 hidden h-px md:block">
        <div className="proc-bar h-full origin-left scale-x-0 bg-fg" />
      </div>
      <div ref={track} className="flex flex-col md:h-svh md:w-max md:flex-row">
        <div className="flex shrink-0 flex-col justify-between px-5 py-20 md:w-[40vw] md:px-8 md:py-24">
          <p className="eyebrow tag text-dim">how it&apos;s made</p>
          <h2 className="mt-8 text-[13vw] leading-[0.86] tracking-[-0.06em] md:text-[6.2vw]">
            Four steps,
            <br />
            from your phone
            <br />
            <span className="text-dim">to your hands.</span>
          </h2>
          <Link href="/process" className="link-line mt-8 w-fit text-lg">
            The full process →
          </Link>
        </div>

        {PROCESS.map((step) => (
          <article
            key={step.n}
            className="group grid shrink-0 grid-cols-1 gap-8 border-t border-line px-5 py-14 md:w-[62vw] md:grid-cols-[1fr_0.9fr] md:border-l md:border-t-0 md:px-8 md:py-24 lg:w-[52vw]"
          >
            <div className="flex flex-col justify-between">
              <span className="font-mono text-[28vw] leading-[0.8] text-fg/10 transition-colors duration-700 group-hover:text-fg md:text-[12vw]">{step.n}</span>
              <div>
                <h3 className="text-5xl tracking-[-0.045em] md:text-6xl">{step.title}</h3>
                <p className="mt-4 max-w-sm text-lg leading-snug text-fg/70">{step.body}</p>
              </div>
            </div>
            <div className="proc-img relative aspect-[3/4] overflow-hidden rounded-sm md:aspect-auto md:h-full">
              <Image src={step.img} alt={step.title} fill sizes="(min-width: 768px) 25vw, 100vw" className="bw scale-[1.2] object-cover" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

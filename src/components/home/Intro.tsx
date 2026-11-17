"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { PHOTOS, type Photo } from "@/lib/media";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Editorial statement with small photos set inline between the words. */
const PARTS: (string | Photo)[] = [
  "We turn",
  PHOTOS.mugHeart,
  "blank products into things people keep: mugs, tumblers, mousepads,",
  PHOTOS.keyringsClear,
  "keyholders, shirts and packaging. Designed with you,",
  PHOTOS.inkRed,
  "pressed by hand in our own workshop, and",
  PHOTOS.boxTape,
  "delivered anywhere in South Africa.",
];

export default function Intro() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        ".intro-w",
        { opacity: 0.12 },
        { opacity: 1, stagger: 0.04, ease: "none", scrollTrigger: { trigger: root.current, start: "top 75%", end: "bottom 70%", scrub: true } },
      );
      gsap.from(".intro-pill", {
        width: 0,
        duration: 1.2,
        ease: "expo.out",
        stagger: 0.1,
        scrollTrigger: { trigger: root.current, start: "top 70%" },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="about" className="relative z-10 bg-bg px-5 py-32 md:px-8 md:py-48">
      <p className="eyebrow mb-10 text-dim">( about )</p>
      <p className="max-w-[22ch] text-[clamp(2.2rem,5.2vw,5.6rem)] leading-[1.02] tracking-[-0.045em] md:max-w-[24ch]">
        {PARTS.map((part, i) =>
          typeof part === "string" ? (
            part.split(" ").map((w, j) => (
              <span key={`${i}-${j}`} className="intro-w inline">
                {w}{" "}
              </span>
            ))
          ) : (
            <span key={i} className="intro-pill relative mx-[0.12em] inline-block h-[0.78em] w-[1.7em] translate-y-[0.08em] overflow-hidden rounded-full align-baseline">
              <Image src={part.src} alt={part.alt} fill sizes="160px" className="bw object-cover" />
            </span>
          ),
        )}
      </p>
    </section>
  );
}

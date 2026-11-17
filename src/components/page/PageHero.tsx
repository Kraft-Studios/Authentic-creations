"use client";

import Image from "next/image";
import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { Photo } from "@/lib/media";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Opening of an inner page: label, huge title that rises in line by line, intro, and a wide photo that opens up on scroll. */
export default function PageHero({
  label,
  index,
  lines,
  intro,
  aside,
  photo,
}: {
  label: string;
  index?: string;
  lines: ReactNode[];
  intro?: ReactNode;
  aside?: ReactNode;
  photo?: Photo;
}) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap
        .timeline({ delay: 0.1 })
        .from(".ph-line", { yPercent: 110, stagger: 0.09, duration: 1.3, ease: "expo.out" })
        .from(".ph-fade", { opacity: 0, y: 16, stagger: 0.08, duration: 0.9, ease: "power3.out" }, "-=0.9");
      if (photo) {
        gsap.fromTo(
          ".ph-photo",
          { clipPath: "inset(8% 6% 8% 6%)" },
          { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: ".ph-photo", start: "top bottom", end: "top 25%", scrub: true } },
        );
        gsap.fromTo(
          ".ph-photo img",
          { yPercent: -8 },
          { yPercent: 8, ease: "none", scrollTrigger: { trigger: ".ph-photo", start: "top bottom", end: "bottom top", scrub: true } },
        );
      }
    },
    { scope: root },
  );

  return (
    <header ref={root} className="relative bg-bg px-5 pb-16 pt-32 md:px-8 md:pt-40">
      <div className="ph-fade flex items-baseline justify-between border-b border-line pb-4">
        <p className="eyebrow text-dim">( {label} )</p>
        {index && <p className="eyebrow text-dim">{index}</p>}
      </div>
      <h1 className="mt-10 text-[15vw] leading-[0.86] tracking-[-0.065em] md:text-[9.5vw]">
        {lines.map((line, i) => (
          <span key={i} className="block overflow-hidden pb-[0.05em]">
            <span className="ph-line block">{line}</span>
          </span>
        ))}
      </h1>
      {(intro || aside) && (
        <div className="mt-12 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          {intro && <div className="ph-fade max-w-xl text-xl leading-snug text-fg/75 md:text-2xl">{intro}</div>}
          {aside && <div className="ph-fade">{aside}</div>}
        </div>
      )}
      {photo && (
        <div className="ph-photo relative mt-16 aspect-[4/3] overflow-hidden rounded-sm md:aspect-[21/9]">
          <Image src={photo.src} alt={photo.alt} fill priority sizes="100vw" className="bw scale-[1.18] object-cover" />
        </div>
      )}
    </header>
  );
}

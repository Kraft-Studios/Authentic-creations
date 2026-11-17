"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { PHOTOS } from "@/lib/media";
import { interTight } from "@/app/fonts";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const STEPS = [
  { title: "Choose a product", body: "Mugs, tumblers, T-shirts, keyholders and more." },
  { title: "Add your design", body: "Upload photos, add names or a logo, or start from a template." },
  { title: "Check it and order", body: "Turn it around in 3D, then send it to us on WhatsApp." },
];

export default function StudioTeaser() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".st-img",
        { clipPath: "inset(12% 12% 12% 12%)" },
        { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: root.current, start: "top 85%", end: "center center", scrub: true } },
      );
      gsap.fromTo(
        ".st-img img",
        { yPercent: -4 },
        { yPercent: 4, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="studio-teaser" className={`${interTight.variable} relative bg-bg px-5 py-32 md:px-8`}>
      <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
        <div className="max-w-xl font-ui">
          <p className="mb-6 flex items-center gap-2 text-[13px] font-medium text-dim">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" aria-hidden>
              <path d="M21 8l-9-5-9 5v8l9 5 9-5V8zM3 8l9 5 9-5M12 13v8" />
            </svg>
            3D Studio
          </p>
          <h2 id="studio-teaser" className="text-balance font-sans text-[11vw] leading-[0.92] tracking-[-0.05em] md:text-[4.6vw]">
            Design anything. <span className="text-dim">See it in 3D before we print it.</span>
          </h2>
          <p className="mt-6 max-w-md text-[16px] leading-relaxed text-dim">
            Build your design on the product itself, check it from every side, and order when it looks right. We check every
            design before it&apos;s printed.
          </p>

          <ol className="mt-10 border-t border-line">
            {STEPS.map((s, i) => (
              <li key={s.title} className="grid grid-cols-[2.25rem_1fr] gap-x-3 border-b border-line py-4">
                <span className="pt-px text-[13px] font-medium tabular-nums text-dim">0{i + 1}</span>
                <div>
                  <p className="text-[15px] font-medium">{s.title}</p>
                  <p className="mt-0.5 text-[14px] leading-snug text-dim">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link
              href="/studio"
              className="group inline-flex h-11 items-center gap-2.5 rounded-lg bg-fg px-5 text-[15px] font-medium text-bg transition-opacity hover:opacity-85"
            >
              Open the 3D studio
              <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <Link href="/products" className="text-[15px] font-medium text-dim transition-colors hover:text-fg">
              See products &amp; prices
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4">
          <div className="st-img relative col-span-3 aspect-[3/4] overflow-hidden rounded-sm">
            <Image src={PHOTOS.portrait.src} alt={PHOTOS.portrait.alt} fill sizes="35vw" className="bw scale-110 object-cover" />
          </div>
          <div className="col-span-2 flex flex-col gap-4 pt-20">
            <div className="st-img relative aspect-square overflow-hidden rounded-sm">
              <Image src={PHOTOS.mugHeartHandle.src} alt={PHOTOS.mugHeartHandle.alt} fill sizes="25vw" className="bw scale-110 object-cover" />
            </div>
            <div className="st-img relative aspect-[4/5] overflow-hidden rounded-sm">
              <Image src={PHOTOS.teeReveal.src} alt={PHOTOS.teeReveal.alt} fill sizes="25vw" className="bw scale-110 object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

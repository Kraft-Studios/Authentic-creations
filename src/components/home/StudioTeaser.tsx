"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { PHOTOS } from "@/lib/media";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FEATURES = ["Upload your photos", "Names, text & stickers", "Templates & collages", "Spin it in 3D", "Order on WhatsApp"];

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
    <section ref={root} aria-labelledby="studio-teaser" className="relative bg-bg px-5 py-32 md:px-8">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <p className="eyebrow mb-6 text-dim">( 3d studio )</p>
          <h2 id="studio-teaser" className="text-[12vw] leading-[0.88] tracking-[-0.06em] md:text-[6vw]">
            Design anything.
            <br />
            <span className="text-dim">See it in 3D</span>
            <br />
            before we press it.
          </h2>
          <ul className="mt-10 flex max-w-lg flex-wrap gap-2">
            {FEATURES.map((f) => (
              <li key={f} className="rounded-full border border-line px-4 py-1.5 text-[14px] text-fg/80">
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/studio"
            className="group mt-12 inline-flex items-center gap-4 rounded-full bg-fg py-2 pl-6 pr-2 text-[15px] text-bg transition-transform duration-500 hover:scale-[1.03]"
          >
            Open the studio
            <span className="grid h-9 w-9 place-items-center rounded-full bg-bg text-fg transition-transform duration-500 group-hover:translate-x-1">→</span>
          </Link>
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

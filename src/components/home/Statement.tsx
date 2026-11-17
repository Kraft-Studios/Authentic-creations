"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { LogoBadge } from "@/components/Logo";
import { SITE } from "@/lib/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const QUOTE = `“${SITE.stats.topViews} people stopped scrolling to watch us press a mousepad.”`;

/** Big statement whose words light up as you scroll past. */
export default function Statement() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        ".st-word",
        { opacity: 0.12 },
        { opacity: 1, stagger: 0.08, ease: "none", scrollTrigger: { trigger: root.current, start: "top 75%", end: "bottom 65%", scrub: true } },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} className="border-t border-line bg-bg px-5 py-36 text-center md:px-8 md:py-48">
      <p className="mx-auto max-w-[17ch] text-[clamp(2.6rem,6.6vw,7.4rem)] leading-[0.98] tracking-[-0.055em]">
        {QUOTE.split(" ").map((w, i) => (
          <span key={i} className="st-word inline-block">
            {w}&nbsp;
          </span>
        ))}
      </p>
      <a href={SITE.tiktok} target="_blank" rel="noopener noreferrer" className="mt-14 inline-flex items-center gap-4 text-left">
        <LogoBadge className="h-14 w-14 border border-line" />
        <span>
          <span className="block text-lg">{SITE.tiktokHandle}</span>
          <span className="eyebrow block text-dim">
            {SITE.stats.followers} followers · {SITE.stats.likes} likes
          </span>
        </span>
      </a>
    </section>
  );
}

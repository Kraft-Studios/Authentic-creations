"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const ROWS = [
  { text: "Photos · Logos · Names · ", cls: "", dir: -1 },
  { text: "pressed into anything ", cls: "font-mono tracking-[-0.08em]", dir: 1 },
  { text: "Mugs · Tumblers · Mousepads · ", cls: "text-transparent [-webkit-text-stroke:1px_var(--fg)]", dir: -1 },
];

/** Giant type that slides sideways with the scroll. */
export default function BigType() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>(".bt-row").forEach((row) => {
        const dir = Number(row.dataset.dir);
        gsap.fromTo(
          row,
          { xPercent: dir < 0 ? 0 : -30 },
          { xPercent: dir < 0 ? -30 : 0, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } },
        );
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-label="What we print" className="relative overflow-hidden border-y border-line bg-bg py-[10vh]">
      {ROWS.map((r) => (
        <div key={r.text} className="whitespace-nowrap">
          <div data-dir={r.dir} className={`bt-row inline-block text-[16vw] leading-[1] tracking-[-0.06em] md:text-[11vw] ${r.cls}`}>
            {r.text.repeat(4)}
          </div>
        </div>
      ))}
    </section>
  );
}

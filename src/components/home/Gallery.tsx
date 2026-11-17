"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { PHOTOS, type Photo } from "@/lib/media";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Item = { photo: Photo; caption: string; tall?: boolean };

const COLUMNS: Item[][] = [
  [
    { photo: PHOTOS.mugHands, caption: "Printed mugs", tall: true },
    { photo: PHOTOS.stickersYellow, caption: "Colour & print" },
    { photo: PHOTOS.crewTees, caption: "Team shirts", tall: true },
  ],
  [
    { photo: PHOTOS.capPool, caption: "Caps & merch" },
    { photo: PHOTOS.deskSetup, caption: "Desk mats", tall: true },
    { photo: PHOTOS.keyringSneaker, caption: "Keyholders" },
    { photo: PHOTOS.rainbowPrint, caption: "Ink & press" },
  ],
  [
    { photo: PHOTOS.giftHandover, caption: "Gifting", tall: true },
    { photo: PHOTOS.tumblerPink, caption: "Tumblers" },
    { photo: PHOTOS.hoodieYellow, caption: "Blank to branded", tall: true },
  ],
];

/** Three columns of photography drifting at different speeds as you scroll. */
export default function Gallery() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const speeds = [-12, 10, -18];
        gsap.utils.toArray<HTMLElement>(".gal-col").forEach((col, i) => {
          gsap.fromTo(
            col,
            { yPercent: speeds[i] * -0.5 },
            { yPercent: speeds[i], ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } },
          );
        });
      });
      gsap.utils.toArray<HTMLElement>(".gal-item").forEach((el) => {
        gsap.from(el, { clipPath: "inset(18% 0 0 0)", opacity: 0, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 92%" } });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="gallery-title" className="relative overflow-hidden bg-bg px-5 py-32 md:px-8">
      <div className="mb-20 grid gap-6 md:grid-cols-2 md:items-end">
        <h2 id="gallery-title" className="text-[13vw] leading-[0.85] tracking-[-0.06em] md:text-[7.5vw]">
          Made to
          <br />
          be <span className="font-mono text-[0.86em]">kept.</span>
        </h2>
        <p className="max-w-md text-lg leading-snug text-fg/70 md:justify-self-end">
          Everyday objects, made personal. Hover a photo to see it in colour, the way every blank looks once it&apos;s been pressed.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
        {COLUMNS.map((col, ci) => (
          <div key={ci} className={`gal-col flex flex-col gap-5 md:gap-6 ${ci === 1 ? "md:pt-40" : ""}`}>
            {col.map((item) => (
              <figure key={item.photo.src} className="gal-item group">
                <div className={`relative overflow-hidden rounded-sm bg-panel ${item.tall ? "aspect-[4/5]" : "aspect-[4/3]"}`}>
                  <Image
                    src={item.photo.src}
                    alt={item.photo.alt}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="bw object-cover group-hover:scale-[1.04]"
                  />
                </div>
                <figcaption className="mt-3 flex justify-between text-[15px]">
                  <span>{item.caption}</span>
                  <span className="eyebrow text-dim">authentic</span>
                </figcaption>
              </figure>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

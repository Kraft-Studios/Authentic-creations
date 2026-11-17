"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SERVICES } from "@/lib/site";
import { PHOTOS } from "@/lib/media";

const IMAGES = [PHOTOS.swatches, PHOTOS.mugGiftbox, PHOTOS.bagsLine, PHOTOS.stickerPrinter];

/** Services as an expanding index: hover (or tap) a row to open its photo and description. */
export default function Services() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="services" className="relative bg-bg px-5 pb-32 md:px-8">
      <div className="flex items-end justify-between border-b border-line pb-4">
        <h2 className="text-[13vw] leading-[0.85] tracking-[-0.06em] md:text-[7.5vw]">Services</h2>
        <p className="eyebrow pb-2 text-dim">( 0{SERVICES.length} )</p>
      </div>

      <ul onPointerLeave={() => setOpen(null)}>
        {SERVICES.map((s, i) => {
          const isOpen = open === i;
          return (
            <li key={s.title} className="border-b border-line">
              <button
                type="button"
                onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(i)}
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                data-cursor="open"
                className="group grid w-full grid-cols-[3rem_1fr_auto] items-baseline gap-4 py-6 text-left md:grid-cols-[6rem_1fr_1fr_auto] md:py-8"
              >
                <span className="eyebrow text-dim">0{i + 1}</span>
                <span className="text-[clamp(2rem,4.4vw,4.4rem)] leading-none tracking-[-0.045em] transition-transform duration-700 ease-[cubic-bezier(0.7,0,0.2,1)] group-hover:translate-x-3">
                  {s.title}
                </span>
                <span className="hidden max-w-md text-lg leading-snug text-fg/70 md:block">{s.body}</span>
                <span
                  aria-hidden
                  className={`text-2xl transition-transform duration-500 ${isOpen ? "rotate-45" : "rotate-0"}`}
                >
                  +
                </span>
              </button>
              <div
                className={`grid transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.7,0,0.2,1)] ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="grid gap-6 pb-8 md:grid-cols-[6rem_1fr_1fr]">
                    <span />
                    <div className="relative aspect-[16/9] overflow-hidden rounded-sm">
                      <Image
                        src={IMAGES[i].src}
                        alt={IMAGES[i].alt}
                        fill
                        sizes="(min-width: 768px) 40vw, 100vw"
                        className={`bw object-cover transition-transform duration-[1.4s] ${isOpen ? "scale-100" : "scale-110"}`}
                      />
                    </div>
                    <p className="text-lg leading-snug text-fg/70 md:hidden">{s.body}</p>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <Link href="/services" className="link-line mt-10 inline-block text-lg">
        Explore our services →
      </Link>
    </section>
  );
}

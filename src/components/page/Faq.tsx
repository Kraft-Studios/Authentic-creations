"use client";

import { useState } from "react";

/** Accordion of questions; one open at a time. */
export default function Faq({ items }: { items: readonly { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <ul className="border-t border-line">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <li key={item.q} className="border-b border-line">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-baseline justify-between gap-6 py-6 text-left"
            >
              <span className="text-[clamp(1.3rem,2.2vw,1.9rem)] leading-tight tracking-[-0.03em]">{item.q}</span>
              <span aria-hidden className={`shrink-0 text-2xl transition-transform duration-500 ${isOpen ? "rotate-45" : ""}`}>
                +
              </span>
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.7,0,0.2,1)] ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="max-w-2xl pb-7 text-lg leading-snug text-fg/70">{item.a}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PRODUCTS, formatPrice, type ProductId } from "@/lib/products";
import { waLink } from "@/lib/site";

const TeaserScene = dynamic(() => import("@/three/TeaserScene"), { ssr: false });

/** Product index with prices; the hovered product turns in 3D beside the list. */
export default function Products() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState<ProductId>("mug");
  const [inView, setInView] = useState(false);
  const [seen, setSeen] = useState(false);
  const hoverTimer = useRef(0);
  const product = PRODUCTS.find((p) => p.id === active)!;

  // Build the 3D panel a little before it scrolls in, keep it once built,
  // and only render frames while the section is on screen.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting);
        if (e.isIntersecting) setSeen(true);
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(hoverTimer.current);
    };
  }, []);

  // Sweeping the mouse down the list shouldn't flip through every product.
  const pick = (id: ProductId) => {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setActive(id), 70);
  };

  return (
    <section ref={root} id="products" className="relative bg-bg px-5 py-32 md:px-8">
      <span id="prices" className="absolute -top-16" aria-hidden />
      <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow tag mb-6 text-dim">products &amp; prices</p>
          <h2 className="text-[13vw] leading-[0.85] tracking-[-0.06em] md:text-[7.5vw]">Pick a blank.</h2>
        </div>
        <p className="max-w-sm text-lg leading-snug text-fg/70">
          Every product starts white. Choose one, then make it yours in the 3D studio, or send us your idea.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <ul className="border-t border-line">
          {PRODUCTS.map((p, i) => (
            <li key={p.id} className="border-b border-line">
              <Link
                href={`/studio?product=${p.id}`}
                onPointerEnter={() => pick(p.id)}
                onFocus={() => setActive(p.id)}
                className="stripe-hover group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 py-5"
              >
                <span className="eyebrow text-dim">0{i + 1}</span>
                <span>
                  <span className="block text-[clamp(1.6rem,3vw,2.6rem)] leading-none tracking-[-0.04em] transition-transform duration-500 group-hover:translate-x-2">
                    {p.name}
                  </span>
                  <span className="mt-2 block text-sm text-dim">{p.method}</span>
                </span>
                <span className="text-[clamp(1.4rem,2.4vw,2rem)] tabular-nums tracking-[-0.03em]">
                  <span className={p.price == null ? "text-dim" : ""}>{formatPrice(p.price)}</span>
                </span>
              </Link>
            </li>
          ))}
          <li className="border-b border-line">
            <a
              href={waLink("Hi Authentic Creations! I'd like a quote for a bulk / corporate order.")}
              target="_blank"
              rel="noopener noreferrer"
              className="stripe-hover group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 py-5"
            >
              <span className="eyebrow text-dim">+</span>
              <span className="text-[clamp(1.6rem,3vw,2.6rem)] leading-none tracking-[-0.04em] transition-transform duration-500 group-hover:translate-x-2">
                Bulk &amp; corporate
              </span>
              <span className="text-[clamp(1.4rem,2.4vw,2rem)] tracking-[-0.03em] text-dim">Quote</span>
            </a>
          </li>
        </ul>

        <div className="relative h-[60svh] lg:sticky lg:top-24 lg:h-[calc(100svh-8rem)]">
          <div className="absolute inset-0 overflow-hidden rounded-sm border border-line bg-panel">
            {seen && <TeaserScene kind={active} running={inView} />}
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between p-5">
            <span className="eyebrow">{product.name}</span>
            <span className="eyebrow">{formatPrice(product.price)}</span>
          </div>
          <p className="pointer-events-none absolute inset-x-0 bottom-0 max-w-sm p-5 text-[15px] leading-snug text-fg/70">{product.blurb}</p>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap items-baseline justify-between gap-4">
        <p className="max-w-xl text-sm text-dim">
          Prices as posted by Authentic Creations. Your final price is confirmed on WhatsApp before anything is printed.
        </p>
        <Link href="/products" className="link-line text-lg">
          All products &amp; details →
        </Link>
      </div>
    </section>
  );
}

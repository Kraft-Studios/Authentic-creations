import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHero from "@/components/page/PageHero";
import Reveal from "@/components/page/Reveal";
import CtaBand from "@/components/page/CtaBand";
import Footer from "@/components/Footer";
import { PRODUCTS, formatPrice } from "@/lib/products";
import { PRODUCT_DETAILS } from "@/lib/content";
import { PHOTOS } from "@/lib/media";
import { waLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Products & prices",
  description:
    "Photo mugs, skinny tumblers, mousepads, keyholders, water bottles, T-shirts and branded boxes, printed by Authentic Creations. See prices, then design yours in 3D.",
};

const priced = PRODUCTS.filter((p) => p.price != null).map((p) => p.price!);

export default function ProductsPage() {
  return (
    <>
      <main>
        <PageHero
          label="products & prices"
          index={`0${PRODUCTS.length} products`}
          lines={["Everything", <span key="2">we <span className="font-mono text-[0.86em] tracking-[-0.08em]">print.</span></span>]}
          intro="Every product starts as a blank. Pick one, design it in 3D or send us your idea, and we'll press it by hand."
          aside={
            <ul className="flex flex-wrap gap-2 md:max-w-md md:justify-end">
              {PRODUCTS.map((p) => (
                <li key={p.id}>
                  <a href={`#${p.id}`} className="block rounded-full border border-line px-4 py-1.5 text-[14px] transition-colors hover:border-fg">
                    {p.name}
                  </a>
                </li>
              ))}
            </ul>
          }
        />

        <Reveal className="px-5 md:px-8">
          <div data-reveal className="grid grid-cols-3 border-y border-line py-6 text-center">
            <div>
              <p className="text-[clamp(1.8rem,4vw,3.4rem)] tracking-[-0.04em]">R{Math.min(...priced)}</p>
              <p className="eyebrow mt-1 text-dim">from</p>
            </div>
            <div className="border-x border-line">
              <p className="text-[clamp(1.8rem,4vw,3.4rem)] tracking-[-0.04em]">1+</p>
              <p className="eyebrow mt-1 text-dim">no minimum</p>
            </div>
            <div>
              <p className="text-[clamp(1.8rem,4vw,3.4rem)] tracking-[-0.04em]">ZA</p>
              <p className="eyebrow mt-1 text-dim">nationwide delivery</p>
            </div>
          </div>

          {PRODUCTS.map((p, i) => {
            const d = PRODUCT_DETAILS[p.id];
            const flip = i % 2 === 1;
            return (
              <article id={p.id} key={p.id} className="scroll-mt-20 border-b border-line py-16 md:py-24">
                <div className="grid gap-10 md:grid-cols-12 md:gap-12">
                  <div data-reveal className={`group md:col-span-7 ${flip ? "md:order-2" : ""}`}>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-panel">
                      <Image
                        src={p.image}
                        alt={`${p.name}: lifestyle photo`}
                        fill
                        sizes="(min-width: 768px) 58vw, 100vw"
                        className="bw object-cover group-hover:scale-[1.03]"
                      />
                    </div>
                  </div>

                  <div className={`flex flex-col md:col-span-5 ${flip ? "md:order-1" : ""}`}>
                    <div data-reveal className="flex items-baseline justify-between">
                      <span className="eyebrow text-dim">
                        0{i + 1} / 0{PRODUCTS.length}
                      </span>
                      <span className="eyebrow text-dim">{p.method}</span>
                    </div>
                    <h2 data-reveal className="mt-6 text-[clamp(2.6rem,5vw,4.6rem)] leading-[0.92] tracking-[-0.05em]">
                      {p.name}
                    </h2>
                    <p data-reveal className={`mt-3 text-[clamp(1.8rem,3vw,2.6rem)] tabular-nums tracking-[-0.03em] ${p.price == null ? "text-dim" : ""}`}>
                      {formatPrice(p.price)}
                      {p.price != null && <span className="ml-2 text-base text-dim">each</span>}
                    </p>
                    <p data-reveal className="mt-6 max-w-md text-lg leading-snug text-fg/75">
                      {p.blurb}
                    </p>

                    <ul data-reveal className="mt-6 flex flex-wrap gap-2">
                      {d.goodFor.map((g) => (
                        <li key={g} className="rounded-full border border-line px-3 py-1 text-[13px] text-fg/80">
                          {g}
                        </li>
                      ))}
                    </ul>

                    <dl data-reveal className="mt-8 grid grid-cols-[7.5rem_1fr] gap-x-4 gap-y-4 border-t border-line pt-6 text-[15px] leading-snug">
                      {p.colors && (
                        <>
                          <dt className="eyebrow pt-1 text-dim">{p.colorLabel}</dt>
                          <dd className="flex flex-wrap gap-1.5">
                            {p.colors.map((c) => (
                              <span
                                key={c.value}
                                title={c.name}
                                className="h-5 w-5 rounded-full border border-line"
                                style={{ background: c.value }}
                              />
                            ))}
                          </dd>
                        </>
                      )}
                      <dt className="eyebrow pt-1 text-dim">send us</dt>
                      <dd className="text-fg/80">{d.send}</dd>
                      <dt className="eyebrow pt-1 text-dim">care</dt>
                      <dd className="text-fg/80">{d.care}</dd>
                    </dl>

                    <div data-reveal className="mt-8 flex flex-wrap gap-3">
                      <Link
                        href={`/studio?product=${p.id}`}
                        className="rounded-full bg-fg px-5 py-2.5 text-[15px] text-bg transition-transform duration-500 hover:scale-[1.04]"
                      >
                        Design in 3D
                      </Link>
                      <a
                        href={waLink(`Hi Authentic Creations! I'm interested in the ${p.name}.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-fg/40 px-5 py-2.5 text-[15px] transition-colors hover:border-fg"
                      >
                        {p.price == null ? "Get a quote" : "Ask on WhatsApp"}
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </Reveal>

        <section className="relative overflow-hidden bg-fg px-5 py-24 text-bg md:px-8 md:py-32">
          <div className="grid gap-12 md:grid-cols-[1.2fr_1fr] md:items-end">
            <div>
              <p className="eyebrow tag opacity-60">bulk &amp; corporate</p>
              <h2 className="mt-8 text-[12vw] leading-[0.88] tracking-[-0.06em] md:text-[6vw]">
                Ordering for
                <br />a whole team?
              </h2>
            </div>
            <div>
              <p className="max-w-md text-xl leading-snug opacity-80">
                Staff uniforms, client gifts, event merch or branded packaging. Tell us what you need and how many, and we&apos;ll send a
                quote with a mock-up.
              </p>
              <a
                href={waLink("Hi Authentic Creations! I'd like a quote for a bulk / corporate order.")}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex rounded-full bg-bg px-6 py-3 text-[15px] text-fg transition-transform duration-500 hover:scale-[1.04]"
              >
                Request a bulk quote
              </a>
            </div>
          </div>
          <div className="relative mt-16 grid grid-cols-3 gap-3 md:gap-4">
            {[PHOTOS.crewTees, PHOTOS.teeRack, PHOTOS.hoodieAmanzi].map((ph) => (
              <div key={ph.src} className="group relative aspect-[3/4] overflow-hidden rounded-sm">
                <Image src={ph.src} alt={ph.alt} fill sizes="33vw" className="bw object-cover group-hover:scale-[1.03]" />
              </div>
            ))}
          </div>
        </section>

        <p className="px-5 pt-10 text-sm text-dim md:px-8">
          Prices as posted by Authentic Creations. Your final price, including delivery, is confirmed on WhatsApp before anything is printed.
        </p>

        <CtaBand />
      </main>
      <Footer />
    </>
  );
}

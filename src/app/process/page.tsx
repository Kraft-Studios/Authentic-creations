import type { Metadata } from "next";
import Image from "next/image";
import PageHero from "@/components/page/PageHero";
import Reveal from "@/components/page/Reveal";
import CtaBand from "@/components/page/CtaBand";
import Footer from "@/components/Footer";
import { ARTWORK_TIPS, CARE, METHODS, STEP_DETAILS } from "@/lib/content";
import { PHOTOS } from "@/lib/media";
import { PROCESS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Process",
  description:
    "How Authentic Creations makes your order: design, print, press and deliver. Plus how sublimation works, how to prepare your photos, and how to care for your print.",
};

export default function ProcessPage() {
  return (
    <>
      <main>
        <PageHero
          label="process"
          index="04 steps"
          lines={["From your phone", <span key="2" className="text-dim">to your hands.</span>]}
          intro="What happens between “I want one” and the knock on your door, and how to get the best print out of your photos."
          photo={PHOTOS.inkRed}
        />

        {/* The four steps */}
        <Reveal className="px-5 md:px-8">
          {PROCESS.map((step, i) => {
            const d = STEP_DETAILS[i];
            return (
              <section key={step.n} className="grid gap-10 border-t border-line py-20 md:grid-cols-12 md:gap-12 md:py-28">
                <div className="md:col-span-2">
                  <p data-reveal className="font-mono text-[26vw] leading-[0.8] md:sticky md:top-24 md:text-[7vw]">
                    {step.n}
                  </p>
                </div>
                <div className="md:col-span-5">
                  <h2 data-reveal className="text-[clamp(3rem,6vw,6rem)] leading-[0.9] tracking-[-0.055em]">
                    {step.title}
                  </h2>
                  <p data-reveal className="mt-6 max-w-md text-xl leading-snug text-fg/80">
                    {step.body}
                  </p>
                  <dl className="mt-10 grid gap-6 border-t border-line pt-6 sm:grid-cols-2">
                    <div data-reveal>
                      <dt className="eyebrow text-dim">you</dt>
                      <dd className="mt-2 text-[15px] leading-snug">{d.you}</dd>
                    </div>
                    <div data-reveal>
                      <dt className="eyebrow text-dim">us</dt>
                      <dd className="mt-2 text-[15px] leading-snug">{d.us}</dd>
                    </div>
                  </dl>
                </div>
                <div data-reveal className="group relative aspect-[4/5] overflow-hidden rounded-sm md:col-span-5">
                  <Image src={d.photo.src} alt={d.photo.alt} fill sizes="(min-width: 768px) 40vw, 100vw" className="bw object-cover group-hover:scale-[1.03]" />
                </div>
              </section>
            );
          })}
        </Reveal>

        {/* Print methods */}
        <section className="border-t border-line bg-fg px-5 py-24 text-bg md:px-8 md:py-32">
          <Reveal>
            <p data-reveal className="eyebrow opacity-60">( how we print )</p>
            <h2 data-reveal className="mt-8 max-w-4xl text-[12vw] leading-[0.88] tracking-[-0.06em] md:text-[5.6vw]">
              Three methods, one rule: it has to last.
            </h2>
            <div className="mt-16 grid gap-px overflow-hidden rounded-sm bg-bg/15 md:grid-cols-3">
              {METHODS.map((m, i) => (
                <article data-reveal key={m.name} className="flex flex-col bg-fg p-6 md:p-8">
                  <span className="eyebrow opacity-50">0{i + 1}</span>
                  <h3 className="mt-10 text-4xl tracking-[-0.045em]">{m.name}</h3>
                  <p className="mt-4 flex-1 text-[15px] leading-snug opacity-75">{m.body}</p>
                  <ul className="mt-8 flex flex-wrap gap-2">
                    {m.products.map((p) => (
                      <li key={p} className="rounded-full border border-bg/25 px-3 py-1 text-[13px]">
                        {p}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </Reveal>
        </section>

        {/* Artwork guide */}
        <section className="border-t border-line bg-bg px-5 py-24 md:px-8 md:py-32">
          <Reveal>
            <div className="grid gap-10 md:grid-cols-[1fr_1fr] md:items-end">
              <div>
                <p data-reveal className="eyebrow text-dim">( artwork guide )</p>
                <h2 data-reveal className="mt-8 text-[12vw] leading-[0.88] tracking-[-0.06em] md:text-[5.6vw]">
                  Getting the
                  <br />
                  sharpest print.
                </h2>
              </div>
              <div data-reveal className="group relative aspect-[16/10] overflow-hidden rounded-sm">
                <Image src={PHOTOS.polaroidWall.src} alt={PHOTOS.polaroidWall.alt} fill sizes="(min-width: 768px) 45vw, 100vw" className="bw object-cover group-hover:scale-[1.03]" />
              </div>
            </div>
            <ol className="mt-16 grid gap-x-10 border-t border-line md:grid-cols-2 lg:grid-cols-3">
              {ARTWORK_TIPS.map((t, i) => (
                <li data-reveal key={t.title} className="border-b border-line py-8">
                  <span className="eyebrow text-dim">tip 0{i + 1}</span>
                  <h3 className="mt-4 text-2xl tracking-[-0.035em]">{t.title}</h3>
                  <p className="mt-2 text-[15px] leading-snug text-fg/70">{t.body}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </section>

        {/* Care */}
        <section className="border-t border-line bg-bg px-5 py-24 md:px-8 md:py-32">
          <Reveal className="grid gap-12 md:grid-cols-[1fr_1.5fr]">
            <div>
              <p data-reveal className="eyebrow text-dim">( care )</p>
              <h2 data-reveal className="mt-8 text-[12vw] leading-[0.88] tracking-[-0.06em] md:text-[5vw]">
                Keep it
                <br />
                looking new.
              </h2>
            </div>
            <ul className="border-t border-line">
              {CARE.map((c) => (
                <li data-reveal key={c.item} className="grid gap-2 border-b border-line py-6 sm:grid-cols-[12rem_1fr] sm:gap-6">
                  <span className="text-2xl tracking-[-0.035em]">{c.item}</span>
                  <span className="text-lg leading-snug text-fg/70">{c.body}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </section>

        <CtaBand />
      </main>
      <Footer />
    </>
  );
}

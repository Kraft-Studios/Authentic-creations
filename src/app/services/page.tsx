import type { Metadata } from "next";
import Image from "next/image";
import PageHero from "@/components/page/PageHero";
import Reveal from "@/components/page/Reveal";
import CtaBand from "@/components/page/CtaBand";
import Footer from "@/components/Footer";
import { BUSINESS_STEPS, SERVICE_DETAILS } from "@/lib/content";
import { PHOTOS } from "@/lib/media";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Branding, personalised gifts, packaging and digital printing by Authentic Creations. Your logo, photos and names on the things people use every day.",
};

export default function ServicesPage() {
  return (
    <>
      <main>
        <PageHero
          label="services"
          index={`0${SERVICE_DETAILS.length} services`}
          lines={["Four ways", <span key="2">to make it <span className="font-mono text-[0.86em] tracking-[-0.08em]">yours.</span></span>]}
          intro="Whether it's one mug for your mom or a hundred shirts for your staff, it's the same care: your design, checked by hand, pressed to last."
          photo={PHOTOS.studioCrew}
        />

        <Reveal className="px-5 md:px-8">
          {SERVICE_DETAILS.map((s, i) => (
            <section key={s.title} className="grid gap-10 border-t border-line py-20 md:grid-cols-[1fr_1.35fr] md:gap-16 md:py-28">
              <div className="md:sticky md:top-24 md:self-start">
                <p data-reveal className="font-mono text-[22vw] leading-[0.8] text-fg/10 md:text-[9vw]">
                  0{i + 1}
                </p>
                <h2 data-reveal className="mt-6 text-[clamp(2.6rem,5.4vw,5.2rem)] leading-[0.9] tracking-[-0.055em]">
                  {s.title}
                </h2>
                <p data-reveal className="mt-4 max-w-sm text-xl leading-snug text-dim">
                  {s.lead}
                </p>
              </div>

              <div>
                <div className="grid grid-cols-5 gap-3 md:gap-4">
                  <div data-reveal className="group relative col-span-3 aspect-[3/4] overflow-hidden rounded-sm">
                    <Image src={s.photos[0].src} alt={s.photos[0].alt} fill sizes="(min-width: 768px) 32vw, 60vw" className="bw object-cover group-hover:scale-[1.03]" />
                  </div>
                  <div data-reveal className="group relative col-span-2 mt-16 aspect-[3/4] overflow-hidden rounded-sm">
                    <Image src={s.photos[1].src} alt={s.photos[1].alt} fill sizes="(min-width: 768px) 22vw, 40vw" className="bw object-cover group-hover:scale-[1.03]" />
                  </div>
                </div>

                <div className="mt-12 max-w-2xl space-y-5">
                  {s.body.map((para) => (
                    <p data-reveal key={para} className="text-xl leading-snug text-fg/80 md:text-2xl">
                      {para}
                    </p>
                  ))}
                </div>

                <div className="mt-12 grid gap-10 border-t border-line pt-8 sm:grid-cols-2">
                  <div data-reveal>
                    <p className="eyebrow text-dim">what we make</p>
                    <ul className="mt-4 space-y-2 text-lg">
                      {s.make.map((m) => (
                        <li key={m} className="flex gap-3">
                          <span aria-hidden className="text-dim">→</span>
                          {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div data-reveal>
                    <p className="eyebrow text-dim">ideal for</p>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {s.for.map((f) => (
                        <li key={f} className="rounded-full border border-line px-3.5 py-1.5 text-[14px] text-fg/80">
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          ))}
        </Reveal>

        <section className="border-t border-line bg-bg px-5 py-24 md:px-8 md:py-32">
          <Reveal>
            <div className="grid gap-8 md:grid-cols-[1fr_1.4fr] md:items-end">
              <div>
                <p data-reveal className="eyebrow tag text-dim">for businesses</p>
                <h2 data-reveal className="mt-8 text-[12vw] leading-[0.88] tracking-[-0.06em] md:text-[5.6vw]">
                  How a branded
                  <br />
                  order works.
                </h2>
              </div>
              <p data-reveal className="max-w-lg text-xl leading-snug text-fg/70">
                Five steps from your logo to a box of finished products. You see and approve everything before it&apos;s printed.
              </p>
            </div>
            <ol className="mt-16 grid border-t border-line sm:grid-cols-2 lg:grid-cols-5">
              {BUSINESS_STEPS.map((step, i) => (
                <li
                  data-reveal
                  key={step.title}
                  className="border-b border-line py-8 sm:pr-6 lg:border-b-0 lg:border-r lg:px-6 lg:first:pl-0 lg:last:border-r-0"
                >
                  <span className="font-mono text-4xl text-fg/25">0{i + 1}</span>
                  <h3 className="mt-6 text-3xl tracking-[-0.04em]">{step.title}</h3>
                  <p className="mt-3 text-[15px] leading-snug text-fg/70">{step.body}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </section>

        <section className="border-t border-line bg-bg px-5 py-20 md:px-8">
          <Reveal>
            <div className="grid gap-10 md:grid-cols-[1fr_2fr] md:items-center">
              <p data-reveal className="eyebrow tag text-dim">seen on tiktok</p>
              <div data-reveal className="grid grid-cols-3 gap-4">
                {[
                  { n: SITE.stats.topViews, l: "views on one press" },
                  { n: SITE.stats.likes, l: "likes" },
                  { n: SITE.stats.followers, l: "followers" },
                ].map((s) => (
                  <div key={s.l}>
                    <p className="text-[clamp(2.2rem,5.4vw,5rem)] leading-none tracking-[-0.05em]">{s.n}</p>
                    <p className="eyebrow mt-3 text-dim">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
            <a
              data-reveal
              href={SITE.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="link-line mt-10 inline-block text-lg"
            >
              Watch us press on TikTok {SITE.tiktokHandle} →
            </a>
          </Reveal>
        </section>

        <CtaBand message="Hi Authentic Creations! I'd like to talk about a branding / printing order." />
      </main>
      <Footer />
    </>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Contact from "@/components/home/Contact";
import Reveal from "@/components/page/Reveal";
import Faq from "@/components/page/Faq";
import Footer from "@/components/Footer";
import { FAQ, MESSAGE_CHECKLIST } from "@/lib/content";
import { PHOTOS } from "@/lib/media";
import { SITE, waLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Order or ask for a quote from ${SITE.name} on WhatsApp (${SITE.whatsappDisplay}) or by email. Delivery anywhere in South Africa.`,
};

const CHANNELS = [
  { label: "whatsapp", value: SITE.whatsappDisplay, note: "Fastest. Orders, quotes and questions.", href: waLink(`Hi ${SITE.name}!`), external: true },
  { label: "email", value: SITE.email, note: "For larger briefs and business orders.", href: `mailto:${SITE.email}`, external: false },
  { label: "tiktok", value: SITE.tiktokHandle, note: "See new work as it comes off the press.", href: SITE.tiktok, external: true },
];

export default function ContactPage() {
  return (
    <>
      <main>
        <Contact page />

        <section className="border-t border-line bg-bg px-5 md:px-8">
          <Reveal className="grid md:grid-cols-3">
            {CHANNELS.map((c) => (
              <a
                data-reveal
                key={c.label}
                href={c.href}
                {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group flex flex-col justify-between gap-10 border-b border-line py-10 md:border-b-0 md:border-r md:px-8 md:py-14 md:first:pl-0 md:last:border-r-0"
              >
                <span className="eyebrow text-dim">{c.label}</span>
                <span>
                  <span className="block break-all text-[clamp(1.6rem,2.6vw,2.4rem)] leading-tight tracking-[-0.035em] transition-transform duration-500 group-hover:translate-x-2">
                    {c.value}
                  </span>
                  <span className="mt-2 block text-[15px] text-dim">{c.note}</span>
                </span>
              </a>
            ))}
          </Reveal>
        </section>

        <section className="border-t border-line bg-bg px-5 py-24 md:px-8 md:py-32">
          <Reveal className="grid gap-14 md:grid-cols-[1fr_1.3fr]">
            <div>
              <p data-reveal className="eyebrow text-dim">( before you message )</p>
              <h2 data-reveal className="mt-8 text-[12vw] leading-[0.88] tracking-[-0.06em] md:text-[5vw]">
                What to
                <br />
                send us.
              </h2>
              <div data-reveal className="group relative mt-12 aspect-[4/3] overflow-hidden rounded-sm">
                <Image src={PHOTOS.giftHandover.src} alt={PHOTOS.giftHandover.alt} fill sizes="(min-width: 768px) 40vw, 100vw" className="bw object-cover group-hover:scale-[1.03]" />
              </div>
            </div>
            <div>
              <ol className="border-t border-line">
                {MESSAGE_CHECKLIST.map((item, i) => (
                  <li data-reveal key={item} className="flex items-baseline gap-6 border-b border-line py-5">
                    <span className="eyebrow w-8 shrink-0 text-dim">0{i + 1}</span>
                    <span className="text-[clamp(1.3rem,2.2vw,1.9rem)] leading-tight tracking-[-0.03em]">{item}</span>
                  </li>
                ))}
              </ol>
              <p data-reveal className="mt-8 max-w-lg text-lg leading-snug text-fg/70">
                Not sure yet? Just say hi. Or try your idea in the{" "}
                <Link href="/studio" className="link-line text-fg">
                  3D studio
                </Link>{" "}
                first and send us the file.
              </p>
            </div>
          </Reveal>
        </section>

        <section className="border-t border-line bg-bg px-5 py-24 md:px-8 md:py-32">
          <Reveal className="grid gap-12 md:grid-cols-[1fr_1.6fr]">
            <div>
              <p data-reveal className="eyebrow text-dim">( questions )</p>
              <h2 data-reveal className="mt-8 text-[12vw] leading-[0.88] tracking-[-0.06em] md:text-[5vw]">
                Good to
                <br />
                know.
              </h2>
            </div>
            <div data-reveal>
              <Faq items={FAQ} />
            </div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}

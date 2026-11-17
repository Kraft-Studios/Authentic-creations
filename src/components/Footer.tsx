import Link from "next/link";
import { LogoMark } from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { SITE, waLink } from "@/lib/site";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/studio", label: "3D Studio" },
  { href: "/products", label: "Products" },
  { href: "/process", label: "Process" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-bg px-5 pt-8 md:px-8">
      <div className="grid gap-14 pb-20 pt-10 md:grid-cols-[1fr_1fr_auto]">
        <div className="max-w-sm">
          <p className="text-2xl leading-tight tracking-[-0.03em]">Got something in mind? Tell us and we&apos;ll reply on WhatsApp, usually with a mock-up.</p>
          <a
            href={waLink("Hi Authentic Creations! I'd like a quote.")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 flex items-center justify-between border-b border-fg/30 pb-2 text-[15px] transition-colors hover:border-fg"
          >
            <span>WhatsApp {SITE.whatsappDisplay}</span>
            <span aria-hidden>→</span>
          </a>
          <a href={`mailto:${SITE.email}`} className="link-line mt-3 inline-block text-[15px] text-dim">
            {SITE.email}
          </a>
        </div>
        <ul className="space-y-1">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="link-line text-[clamp(1.8rem,3.2vw,2.8rem)] leading-[1.1] tracking-[-0.04em]">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex flex-col justify-between gap-8 text-[15px] md:items-end">
          <a href={SITE.tiktok} target="_blank" rel="noopener noreferrer" className="link-line w-fit">
            TikTok {SITE.tiktokHandle}
          </a>
          <p className="eyebrow text-dim md:text-right">
            {SITE.delivery.toLowerCase()} · south africa
            <br />© {new Date().getFullYear()} {SITE.name.toLowerCase()}
          </p>
        </div>
      </div>

      <div className="flex justify-center border-t border-line py-[30px]">
        <ThemeToggle />
      </div>

      <div className="flex items-end justify-between gap-[2vw] border-t border-line pb-4 pt-6">
        <span className="text-[18.5vw] leading-[0.74] tracking-[-0.075em]">authentic</span>
        <LogoMark className="mb-[0.6vw] h-[10vw] w-auto shrink-0" />
      </div>
    </footer>
  );
}

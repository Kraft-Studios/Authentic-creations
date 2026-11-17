"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoMark } from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { SITE } from "@/lib/site";
import { MENU_PHOTOS } from "@/lib/media";

const LINKS = [
  { href: "/studio", label: "3D Studio", img: MENU_PHOTOS.studio },
  { href: "/products", label: "Products", img: MENU_PHOTOS.products },
  { href: "/process", label: "Process", img: MENU_PHOTOS.process },
  { href: "/services", label: "Services", img: MENU_PHOTOS.services },
  { href: "/contact", label: "Contact", img: MENU_PHOTOS.contact },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [preview, setPreview] = useState(0);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Hide while scrolling down, reveal on the way back up.
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > lastY && y > 240);
      lastY = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const studio = pathname?.startsWith("/studio");

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color] duration-500 ease-[cubic-bezier(0.7,0,0.2,1)] ${
          hidden && !open && !studio ? "-translate-y-full" : "translate-y-0"
        } ${scrolled || studio || open ? "border-b border-line bg-bg/80 backdrop-blur-xl" : "border-b border-transparent"}`}
      >
        <nav className="flex h-16 items-center justify-between gap-6 px-5 md:px-8" aria-label="Main">
          <Link href="/" className="group flex items-center gap-3" aria-label={`${SITE.name} home`}>
            <LogoMark className="h-[18px] w-auto text-fg transition-transform duration-500 group-hover:-rotate-6" />
            <span className="hidden text-[15px] tracking-[-0.01em] sm:inline">{SITE.name}</span>
          </Link>

          <ul className="hidden items-center gap-9 text-[15px] lg:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={`link-line pb-0.5 ${pathname?.startsWith(l.href) ? "bg-[length:100%_1px]" : ""}`}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            {!studio && (
              <Link
                href="/studio"
                className="hidden rounded-full border border-fg px-4 py-1.5 text-[14px] transition-colors duration-300 hover:bg-fg hover:text-bg md:inline-block"
              >
                Design in 3D
              </Link>
            )}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="site-menu"
              className="group flex items-center gap-3 rounded-full py-1.5 pl-3 text-[15px]"
            >
              <span className="hidden sm:inline">{open ? "Close" : "Menu"}</span>
              <span className="relative block h-3 w-6" aria-hidden>
                <span
                  className={`absolute left-0 h-px w-6 bg-fg transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.2,1)] ${
                    open ? "top-1.5 rotate-45" : "top-0.5"
                  }`}
                />
                <span
                  className={`absolute left-0 h-px bg-fg transition-all duration-500 ease-[cubic-bezier(0.7,0,0.2,1)] ${
                    open ? "top-1.5 w-6 -rotate-45" : "top-2.5 w-4 group-hover:w-6"
                  }`}
                />
              </span>
              <span className="sr-only sm:hidden">{open ? "Close menu" : "Open menu"}</span>
            </button>
          </div>
        </nav>
      </header>

      {/* Full-screen menu */}
      <div
        id="site-menu"
        aria-hidden={!open}
        className={`fixed inset-0 z-40 bg-bg transition-[clip-path] duration-700 ease-[cubic-bezier(0.7,0,0.2,1)] ${
          open ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]"
        }`}
      >
        <div className="grid h-full grid-cols-1 gap-8 px-5 pb-8 pt-24 md:grid-cols-[1.3fr_1fr] md:px-8">
          <div className="flex flex-col justify-between">
            <ul className="space-y-1">
              {LINKS.map((l, i) => (
                <li key={l.href} className="overflow-hidden">
                  <Link
                    href={l.href}
                    tabIndex={open ? 0 : -1}
                    onClick={() => setOpen(false)}
                    onPointerEnter={() => setPreview(i)}
                    onFocus={() => setPreview(i)}
                    className={`group flex items-baseline gap-4 transition-transform duration-700 ease-[cubic-bezier(0.7,0,0.2,1)] ${
                      open ? "translate-y-0" : "translate-y-full"
                    }`}
                    style={{ transitionDelay: open ? `${120 + i * 60}ms` : "0ms" }}
                  >
                    <span className="eyebrow w-8 text-dim">0{i + 1}</span>
                    <span className="text-[13vw] leading-[0.95] tracking-[-0.045em] transition-[letter-spacing,opacity] duration-500 group-hover:tracking-[-0.02em] md:text-[6.4vw]">
                      {l.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <ThemeToggle />
              <div className="space-y-1 text-[15px]">
                <a href={`mailto:${SITE.email}`} tabIndex={open ? 0 : -1} className="link-line block w-fit">
                  {SITE.email}
                </a>
                <a href={SITE.tiktok} target="_blank" rel="noopener noreferrer" tabIndex={open ? 0 : -1} className="link-line block w-fit text-dim">
                  TikTok {SITE.tiktokHandle}
                </a>
              </div>
            </div>
          </div>

          <div className="relative hidden overflow-hidden rounded-sm md:block">
            {LINKS.map((l, i) => (
              <Image
                key={l.href}
                src={l.img.src}
                alt=""
                fill
                sizes="40vw"
                className={`bw object-cover transition-[opacity,transform] duration-700 ${preview === i ? "scale-100 opacity-100" : "scale-105 opacity-0"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

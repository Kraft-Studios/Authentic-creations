"use client";

import { useEffect, useRef, useState } from "react";
import { LogoBadge } from "@/components/Logo";
import { PRODUCTS } from "@/lib/products";
import { SITE, waLink } from "@/lib/site";

/** Contact: a phone that tilts toward the cursor, with an order form on its screen. */
export default function Contact({ page = false }: { page?: boolean }) {
  const Heading = page ? "h1" : "h2";
  const stage = useRef<HTMLDivElement>(null);
  const phone = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const [item, setItem] = useState(PRODUCTS[0].name);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const el = stage.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const target = { rx: 6, ry: -12 };
    const cur = { rx: 6, ry: -12 };
    let raf = 0;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target.ry = ((e.clientX - r.left) / r.width - 0.5) * 26;
      target.rx = -((e.clientY - r.top) / r.height - 0.5) * 18;
    };
    const leave = () => {
      target.rx = 6;
      target.ry = -12;
    };
    const loop = () => {
      cur.rx += (target.rx - cur.rx) * 0.08;
      cur.ry += (target.ry - cur.ry) * 0.08;
      if (phone.current) phone.current.style.transform = `rotateX(${cur.rx}deg) rotateY(${cur.ry}deg)`;
      raf = requestAnimationFrame(loop);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(loop);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
    };
  }, []);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = [`Hi ${SITE.name}!${name ? ` I'm ${name}.` : ""}`, `I'd like: ${qty} × ${item}`, msg && `Details: ${msg}`].filter(Boolean);
    window.open(waLink(lines.join("\n")), "_blank", "noopener,noreferrer");
  };

  const field = "mt-1 w-full rounded-md border border-black/15 bg-black/[0.04] px-2.5 py-2 text-[13px] text-black outline-none placeholder:text-black/35 focus:border-black/60";

  return (
    <section id="contact" className={`relative grid min-h-svh items-center gap-14 overflow-hidden bg-bg px-5 py-28 md:grid-cols-2 md:px-8 ${page ? "pt-32" : "border-t border-line"}`}>
      <div className="min-w-0">
        <p className="eyebrow tag text-dim">contact</p>
        <Heading className="mt-8 text-[13vw] leading-[0.86] tracking-[-0.06em] md:text-[6.6vw]">
          Let&apos;s make
          <br />
          something <span className="font-mono text-[0.86em]">yours.</span>
        </Heading>
        <p className="mt-8 max-w-md text-lg leading-snug text-fg/70">
          Fill in the phone and we&apos;ll pick it up on WhatsApp. Send your photos or logo in the chat and we check every file before
          anything is printed.
        </p>
        <dl className="mt-12 grid max-w-md grid-cols-[6rem_1fr] gap-y-3 border-t border-line pt-6 text-[15px]">
          <dt className="eyebrow pt-1 text-dim">whatsapp</dt>
          <dd>
            <a className="link-line" href={waLink(`Hi ${SITE.name}!`)} target="_blank" rel="noopener noreferrer">
              {SITE.whatsappDisplay}
            </a>
          </dd>
          <dt className="eyebrow pt-1 text-dim">email</dt>
          <dd>
            <a className="link-line" href={`mailto:${SITE.email}`}>
              {SITE.email}
            </a>
          </dd>
          <dt className="eyebrow pt-1 text-dim">tiktok</dt>
          <dd>
            <a className="link-line" href={SITE.tiktok} target="_blank" rel="noopener noreferrer">
              {SITE.tiktokHandle}
            </a>
          </dd>
          <dt className="eyebrow pt-1 text-dim">delivery</dt>
          <dd>Anywhere in South Africa</dd>
        </dl>
      </div>

      <div ref={stage} className="relative flex min-w-0 justify-center py-6 [perspective:1400px]">
        <div ref={phone} className="relative w-[min(300px,100%)] [transform-style:preserve-3d] sm:w-[min(330px,100%)]">
          <div className="relative rounded-[48px] border-[10px] border-[#0c0c0c] bg-[#0c0c0c] shadow-[0_50px_120px_-30px_rgba(0,0,0,0.6),inset_0_0_0_1px_#2a2a2a] outline outline-1 outline-[#3a3a3a]">
            <div className="absolute left-1/2 top-2.5 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
            <div className="flex h-[600px] flex-col overflow-hidden rounded-[38px] bg-[#111] text-white">
              <div className="flex items-center gap-3 border-b border-white/10 px-4 pb-3 pt-11">
                <LogoBadge className="h-9 w-9" />
                <div className="leading-tight">
                  <p className="text-sm">{SITE.name}</p>
                  <p className="text-[11px] text-white/45">usually replies on WhatsApp</p>
                </div>
              </div>
              <div className="flex-1 space-y-3 overflow-hidden p-3">
                <p className="max-w-[80%] rounded-2xl rounded-tl-sm bg-white/10 px-3.5 py-2.5 text-[13px] leading-snug">
                  Hi! What can we make for you today?
                </p>
                <form onSubmit={send} className="ml-auto max-w-[94%] space-y-2.5 rounded-2xl rounded-tr-sm bg-white px-3.5 py-3 text-[13px] text-black">
                  <label className="block">
                    <span className="text-[11px] text-black/55">Your name</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={field}
                      placeholder="e.g. Thandi"
                      autoComplete="given-name"
                    />
                  </label>
                  <div className="grid grid-cols-[1fr_64px] gap-2">
                    <label className="block">
                      <span className="text-[11px] text-black/55">Product</span>
                      <select value={item} onChange={(e) => setItem(e.target.value)} className={field}>
                        {PRODUCTS.map((p) => (
                          <option key={p.id}>{p.name}</option>
                        ))}
                        <option>Something else</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-[11px] text-black/55">Qty</span>
                      <input
                        type="number"
                        min={1}
                        value={qty}
                        onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                        className={field}
                      />
                    </label>
                  </div>
                  <label className="block">
                    <span className="text-[11px] text-black/55">Details</span>
                    <textarea
                      value={msg}
                      onChange={(e) => setMsg(e.target.value)}
                      rows={3}
                      className={`${field} resize-none`}
                      placeholder="Names, colours, when you need it…"
                    />
                  </label>
                  <button type="submit" className="w-full rounded-full bg-black py-2.5 text-[13px] text-white transition-transform hover:scale-[1.02]">
                    Send on WhatsApp →
                  </button>
                </form>
              </div>
            </div>
          </div>
          <span className="absolute -left-[13px] top-28 h-10 w-[3px] rounded-l bg-[#2a2a2a]" />
          <span className="absolute -left-[13px] top-44 h-16 w-[3px] rounded-l bg-[#2a2a2a]" />
          <span className="absolute -right-[13px] top-36 h-20 w-[3px] rounded-r bg-[#2a2a2a]" />
          <div className="pointer-events-none absolute inset-0 rounded-[48px] bg-[linear-gradient(115deg,rgba(255,255,255,0.1),transparent_35%)]" />
        </div>
      </div>
    </section>
  );
}

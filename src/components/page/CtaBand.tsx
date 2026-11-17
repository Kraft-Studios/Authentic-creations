import Link from "next/link";
import { waLink } from "@/lib/site";

/** Closing call to action used at the bottom of the inner pages. */
export default function CtaBand({ message = "Hi Authentic Creations! I'd like a quote." }: { message?: string }) {
  return (
    <section className="border-t border-line bg-bg px-5 py-28 md:px-8 md:py-40">
      <p className="eyebrow text-center text-dim">( ready when you are )</p>
      <h2 className="mt-8 text-center text-[14vw] leading-[0.86] tracking-[-0.065em] md:text-[8vw]">
        Make it <span className="font-mono text-[0.86em] tracking-[-0.08em]">yours.</span>
      </h2>
      <div className="mt-12 flex flex-wrap justify-center gap-3">
        <Link
          href="/studio"
          className="group inline-flex items-center gap-4 rounded-full bg-fg py-2 pl-6 pr-2 text-[15px] text-bg transition-transform duration-500 hover:scale-[1.03]"
        >
          Design yours in 3D
          <span className="grid h-9 w-9 place-items-center rounded-full bg-bg text-fg transition-transform duration-500 group-hover:translate-x-1">→</span>
        </Link>
        <a
          href={waLink(message)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-full border border-fg/40 px-6 py-3 text-[15px] transition-colors duration-300 hover:border-fg"
        >
          Message us on WhatsApp
        </a>
      </div>
    </section>
  );
}

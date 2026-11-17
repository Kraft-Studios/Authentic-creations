"use client";

import { setTheme, useTheme } from "@/lib/theme";

/** "Light mode ( ◯ ) Dark mode" switch, matching freefaces.gallery's toggle. */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useTheme();
  const dark = theme === "dark";

  return (
    <div className={`flex items-center gap-5 ${className}`}>
      <span className={`whitespace-nowrap text-base transition-colors duration-300 ${dark ? "text-dim" : "text-fg"}`}>Light mode</span>
      <button
        type="button"
        role="switch"
        aria-checked={dark}
        aria-label="Toggle dark mode"
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setTheme(dark ? "light" : "dark", { x: r.left + r.width / 2, y: r.top + r.height / 2 });
        }}
        className="relative h-[34px] w-[74px] shrink-0 appearance-none rounded-[17px] border border-fg bg-bg p-0 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4774fd]"
      >
        <span
          aria-hidden
          className={`pointer-events-none absolute left-px top-px h-[30px] w-[30px] rounded-full border border-fg bg-bg transition-transform duration-300 ${
            dark ? "translate-x-[40px]" : "translate-x-0"
          }`}
        />
      </button>
      <span className={`whitespace-nowrap text-base transition-colors duration-300 ${dark ? "text-fg" : "text-dim"}`}>Dark mode</span>
    </div>
  );
}

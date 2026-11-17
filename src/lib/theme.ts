"use client";

import { useSyncExternalStore } from "react";

export type Theme = "dark" | "light";

const KEY = "ac-theme";
const listeners = new Set<() => void>();

/** Runs before first paint (inlined in <head>) so there's no flash of the wrong theme. Dark is the default. */
export const THEME_BOOT = `(function(){var t;try{t=localStorage.getItem('${KEY}')}catch(e){}document.documentElement.setAttribute('data-theme',t==='light'?'light':'dark')})()`;

export function getTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function apply(next: Theme) {
  document.documentElement.setAttribute("data-theme", next);
  try {
    localStorage.setItem(KEY, next);
  } catch {
    /* storage unavailable */
  }
  listeners.forEach((l) => l());
}

/** Switch theme with a circular wipe from the toggle (View Transitions), falling back to an instant swap. */
export function setTheme(next: Theme, origin?: { x: number; y: number }) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!doc.startViewTransition || reduced) return apply(next);
  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? window.innerHeight / 2;
  const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const t = doc.startViewTransition(() => apply(next));
  t.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 650, easing: "cubic-bezier(0.7, 0, 0.2, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    })
    .catch(() => {});
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getTheme, () => "dark");
}

/** Colours the 3D scenes need to match the page. */
export const THEME_COLORS: Record<Theme, { bg: string; fg: string }> = {
  dark: { bg: "#161616", fg: "#fcfcfc" },
  light: { bg: "#fcfcfc", fg: "#161616" },
};

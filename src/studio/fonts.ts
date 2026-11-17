import { Bebas_Neue, Pacifico, Permanent_Marker, Playfair_Display } from "next/font/google";
import { anton, interTight } from "@/app/fonts";

const pacifico = Pacifico({ subsets: ["latin"], weight: "400", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700", "900"], display: "swap" });
const marker = Permanent_Marker({ subsets: ["latin"], weight: "400", display: "swap" });
const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", display: "swap" });

/** Fonts customers can use on their designs. `family` is the real CSS font-family. */
export const FONTS = [
  { id: "display", label: "Anton", family: anton.style.fontFamily },
  { id: "body", label: "Inter Tight", family: interTight.style.fontFamily },
  { id: "script", label: "Pacifico", family: pacifico.style.fontFamily },
  { id: "serif", label: "Playfair", family: playfair.style.fontFamily },
  { id: "marker", label: "Marker", family: marker.style.fontFamily },
  { id: "bebas", label: "Bebas Neue", family: bebas.style.fontFamily },
] as const;

export type FontSet = { display: string; body: string; script: string; serif: string };

export const FONT_SET: FontSet = {
  display: FONTS[0].family,
  body: FONTS[1].family,
  script: FONTS[2].family,
  serif: FONTS[3].family,
};

let allFonts: Promise<void> = Promise.resolve();
/** Resolves when every design font has finished downloading (however long that takes). */
export const studioFontsLoaded = () => allFonts;

/**
 * Download the design fonts before the editor draws text with them, but never keep the
 * customer waiting more than `maxWaitMs`: on a slow phone connection the studio opens
 * anyway, and the text is re-measured once the fonts arrive (see `studioFontsLoaded`).
 */
export async function loadStudioFonts(maxWaitMs = 4000) {
  if (typeof document === "undefined" || !document.fonts) return;
  allFonts = Promise.all(
    FONTS.flatMap((f) => [document.fonts.load(`400 64px ${f.family}`), document.fonts.load(`700 64px ${f.family}`)]),
  )
    .then(() => undefined)
    .catch(() => undefined); // fall back to whatever is available
  await Promise.race([allFonts, new Promise<void>((resolve) => setTimeout(resolve, maxWaitMs))]);
}

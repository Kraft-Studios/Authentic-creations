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

/**
 * Download the design fonts. The studio doesn't wait for this to open; it re-measures
 * its text when this resolves (however long the download takes).
 */
export async function loadStudioFonts() {
  if (typeof document === "undefined" || !document.fonts) return;
  try {
    await Promise.all(
      FONTS.flatMap((f) => [document.fonts.load(`400 64px ${f.family}`), document.fonts.load(`700 64px ${f.family}`)]),
    );
  } catch {
    /* fall back to whatever is available */
  }
}

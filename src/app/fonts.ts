import localFont from "next/font/local";
import { Anton, Inter_Tight, Major_Mono_Display } from "next/font/google";

/** Site typeface: Archiv Grotesk (free font listed on freefaces.gallery). */
export const archiv = localFont({
  src: "../fonts/ArchivGrotesk-Regular.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-archiv",
  display: "swap",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

/** Accent typeface: Major Mono Display (Open Font License). */
export const majorMono = Major_Mono_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-major",
  display: "swap",
});

/* Product-artwork fonts (used inside 3D prints and the studio, not the site UI). */
export const anton = Anton({ subsets: ["latin"], weight: "400", display: "swap", preload: false });
export const interTight = Inter_Tight({ subsets: ["latin"], weight: ["400", "700"], display: "swap", preload: false });

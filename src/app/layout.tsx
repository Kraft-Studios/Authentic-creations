import type { Metadata, Viewport } from "next";
import "lenis/dist/lenis.css";
import "./globals.css";
import { archiv, majorMono } from "./fonts";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollProgress from "@/components/ScrollProgress";
import InkCursor from "@/components/InkCursor";
import Nav from "@/components/Nav";
import { SITE } from "@/lib/site";
import { THEME_BOOT } from "@/lib/theme";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} · Branding, personalised gifts & printing`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: `${SITE.name} · From blank to yours`,
    description: SITE.description,
    images: ["/media/photos/rainbow-print.jpg"],
    locale: "en_ZA",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#161616" },
    { media: "(prefers-color-scheme: light)", color: "#fcfcfc" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-ZA" data-theme="dark" suppressHydrationWarning className={`${archiv.variable} ${majorMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body>
        <SmoothScroll />
        <ScrollProgress />
        <InkCursor />
        <Nav />
        {children}
      </body>
    </html>
  );
}

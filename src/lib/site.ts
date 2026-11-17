/**
 * Business details for Authentic Creations.
 * Source: the client's TikTok profile (@authentic_creations25), checked 16 Nov 2026.
 *
 * TODO(client): confirm before launch
 *  - WhatsApp: the bio says 071 903 2441, some video captions say 066 500 3006.
 *  - Location / collection address (not public yet).
 *  - Turnaround times and delivery fees.
 */
export const SITE = {
  name: "Authentic Creations",
  url: "https://authenticcreations.co.za",
  tagline: "Branding, personalised gifts, packaging & digital printing.",
  description:
    "Authentic Creations designs and prints personalised gifts, branding and packaging in South Africa: mousepads, mugs, tumblers, keyholders and more, with nationwide delivery. Design yours in 3D.",
  whatsapp: "27719032441",
  whatsappDisplay: "071 903 2441",
  email: "info@authenticcreations.co.za",
  tiktok: "https://www.tiktok.com/@authentic_creations25",
  tiktokHandle: "@authentic_creations25",
  delivery: "Nationwide delivery",
  /** TikTok numbers as of 16 Nov 2026 — update from the profile when needed. */
  stats: { followers: "1,140", likes: "4,313", topViews: "75.1K" },
} as const;

export function waLink(text: string) {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
}

export const tiktokVideo = (id: string) => `${SITE.tiktok}/video/${id}`;

export const SERVICES = [
  {
    title: "Branding",
    body: "From a single logo tumbler to a full team kit, we put your brand on the things people use every day, so they see it every day.",
  },
  {
    title: "Personalised gifts",
    body: "Photos, names, inside jokes and album covers, pressed into mugs, mousepads, tumblers and keyholders that don't peel or fade.",
  },
  {
    title: "Packaging",
    body: "Boxes and labels that carry your name, so the unboxing feels as considered as what's inside. Built for small businesses.",
  },
  {
    title: "Digital printing",
    body: "Sharp, full-colour digital prints for products, events and promotions, printed in our own workshop and checked by hand.",
  },
] as const;

export const PROCESS = [
  {
    n: "01",
    title: "Design",
    body: "Build your design in our 3D studio, or just send your photos and logo on WhatsApp. We check every file before it's printed.",
    img: "/media/photos/polaroids.jpg",
  },
  {
    n: "02",
    title: "Print",
    body: "Your artwork is printed in full colour onto transfer paper, at the size and position you chose.",
    img: "/media/photos/sticker-printer.jpg",
  },
  {
    n: "03",
    title: "Press",
    body: "Heat and pressure fuse the ink into the product itself, so the print becomes part of it. It won't peel off or fade.",
    img: "/media/photos/heat-press.jpg",
  },
  {
    n: "04",
    title: "Deliver",
    body: "We pack every order by hand and send it anywhere in South Africa.",
    img: "/media/photos/gift-ribbon.jpg",
  },
] as const;

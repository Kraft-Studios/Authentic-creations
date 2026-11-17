/**
 * Longer copy for the Products, Services, Process and Contact pages.
 *
 * Only facts from the client's own posts are stated as facts (products, the
 * posted prices, WhatsApp ordering, nationwide delivery). Everything else is
 * general guidance, and anything not yet confirmed (turnaround, delivery fees,
 * payment) is answered with "we confirm it on WhatsApp". See README checklist.
 */
import type { ProductId } from "./products";
import { PHOTOS } from "./media";

/* ------------------------------- Products ------------------------------- */

export const PRODUCT_DETAILS: Record<ProductId, { goodFor: string[]; send: string; care: string }> = {
  mousepad: {
    goodFor: ["Album covers", "Photo collages", "Desk branding", "Gamers"],
    send: "A landscape photo or design. Edge-to-edge prints look best, so keep faces away from the corners.",
    care: "Wipe clean with a damp cloth. Don't machine-wash.",
  },
  mug: {
    goodFor: ["Birthdays", "Couples", "Office mugs", "Inside jokes"],
    send: "One photo for the front, or two to three for a wrap-around collage. Names and dates are added for you.",
    care: "Hand-wash to keep the colours bright for longer.",
  },
  tumbler: {
    goodFor: ["Names", "Gym & school", "Team gifts", "Logos"],
    send: "A name, a pattern or a photo. Tall designs wrap all the way around.",
    care: "Hand-wash only. Don't soak or put it in the dishwasher.",
  },
  bottle: {
    goodFor: ["Sports teams", "Staff gifts", "School", "Events"],
    send: "Your logo, a name or a full-wrap design.",
    care: "Hand-wash only.",
  },
  keyholder: {
    goodFor: ["Memorials", "Couples", "New homes", "Small gifts"],
    send: "Two photos, one for each side. Square crops work best.",
    care: "Wipe clean. Both sides are sealed into the surface, so they won't rub off.",
  },
  tshirt: {
    goodFor: ["Uniforms", "Events", "Teams", "Merch drops"],
    send: "Your logo as a PNG with a transparent background, and the sizes you need.",
    care: "Wash inside out in cold water. Don't iron over the print.",
  },
  box: {
    goodFor: ["Online stores", "Gift sets", "Corporate hampers", "Launches"],
    send: "Your logo and the box size you need. We'll confirm the options with you.",
    care: "Store flat and dry until you use it.",
  },
};

/* ------------------------------- Services ------------------------------- */

export const SERVICE_DETAILS = [
  {
    title: "Branding",
    lead: "Your logo on the things people actually use.",
    body: [
      "A mug on a client's desk or a tumbler at the gym gets seen every day. We put your logo, colours and message onto everyday products, from a single sample to a full staff order.",
      "Send us your logo and we'll show you how it sits on each product before anything is printed.",
    ],
    make: ["Logo tumblers & bottles", "Staff T-shirts & uniforms", "Branded mugs", "Desk mats", "Branded boxes"],
    for: ["Small businesses", "Staff uniforms", "Events & launches", "Client gifts"],
    photos: [PHOTOS.teeLogo, PHOTOS.swatches],
  },
  {
    title: "Personalised gifts",
    lead: "Photos, names and inside jokes, made to keep.",
    body: [
      "Our best-known work. Your photos, album covers, names and messages pressed into mugs, mousepads, tumblers and double-sided keyholders.",
      "The print becomes part of the product, so it won't peel or fade. Design it yourself in the 3D studio, or send us the photos and we'll lay it out.",
    ],
    make: ["Photo mugs", "Album-cover mousepads", "Double-sided keyholders", "Name tumblers", "Photo collages"],
    for: ["Birthdays", "Anniversaries", "Graduations", "Thank-yous"],
    photos: [PHOTOS.mugGiftbox, PHOTOS.polaroidWall],
  },
  {
    title: "Packaging",
    lead: "An unboxing that feels as good as what's inside.",
    body: [
      "Boxes and labels that carry your name, so a delivery looks like it came from a brand. Made for small businesses, gift sets and orders that need to arrive looking considered.",
    ],
    make: ["Branded mailer boxes", "Gift-set boxes", "Product labels"],
    for: ["Online stores", "Gift sets", "Corporate hampers", "Product launches"],
    photos: [PHOTOS.bagsLine, PHOTOS.boxRug],
  },
  {
    title: "Digital printing",
    lead: "Full colour, sharp, and checked by hand.",
    body: [
      "Full-colour digital prints for products, events and promotions, printed in our own workshop. Every print is checked before it's pressed or packed.",
    ],
    make: ["Full-colour transfers", "Event prints", "Promotional prints", "Small runs & one-offs"],
    for: ["Events", "Promotions", "Small runs", "One-offs"],
    photos: [PHOTOS.stickerPrinter, PHOTOS.paperCutter],
  },
] as const;

export const BUSINESS_STEPS = [
  { title: "Brief", body: "Tell us what you need, how many, and by when." },
  { title: "Mock-up", body: "We show you your logo on the product before anything is printed." },
  { title: "Approve", body: "You sign off the design and the final quote." },
  { title: "Print", body: "We print, press and check every piece in our workshop." },
  { title: "Deliver", body: "Packed by hand and sent anywhere in South Africa." },
];

/* -------------------------------- Process -------------------------------- */

export const STEP_DETAILS = [
  {
    you: "Pick a product and add your photos, names or logo.",
    us: "We check every file for size and sharpness, and fix the layout if it needs it.",
    photo: PHOTOS.polaroids,
  },
  {
    you: "Approve the final design and quote.",
    us: "Your artwork is printed in full colour onto transfer paper, at the size and position you chose.",
    photo: PHOTOS.stickerPrinter,
  },
  {
    you: "Nothing. This part is ours.",
    us: "Heat and pressure fuse the ink into the product's coating, so the print becomes part of it.",
    photo: PHOTOS.heatPress,
  },
  {
    you: "Tell us where it's going.",
    us: "We pack every order by hand and send it anywhere in South Africa.",
    photo: PHOTOS.giftRibbon,
  },
];

export const METHODS = [
  {
    name: "Sublimation",
    body: "Heat turns the ink into a gas that bonds with the product's special coating. The print is inside the surface, not on top, so it can't peel or crack.",
    products: ["Mugs", "Tumblers", "Bottles", "Mousepads", "Keyholders"],
  },
  {
    name: "Heat transfer",
    body: "Your design is printed onto a transfer and pressed onto the fabric. Made for cotton and cotton-blend shirts, in any colour.",
    products: ["T-shirts", "Uniforms"],
  },
  {
    name: "Digital print",
    body: "Full-colour printing straight onto paper and board, for packaging, labels and promotional prints.",
    products: ["Branded boxes", "Labels", "Prints"],
  },
];

export const ARTWORK_TIPS = [
  { title: "Send the original", body: "Use the photo straight from your camera or gallery, not a screenshot or a WhatsApp-forwarded copy. Those lose detail." },
  { title: "Bigger is better", body: "The more pixels, the sharper the print. If it looks blurry zoomed in on your phone, it'll look blurry on a mug." },
  { title: "Logos as PNG", body: "A PNG with a transparent background, or a PDF/SVG, prints cleanest. No logo file? Send what you have and we'll advise." },
  { title: "Mind the edges", body: "Keep names, faces and text inside the dashed line in the studio. Edges can wrap, trim or sit near the handle." },
  { title: "Colours shift a little", body: "Screens glow and print doesn't, so bright neon colours print slightly softer than they look on your phone." },
  { title: "Check the spelling", body: "We print exactly what's approved, so double-check names and dates before you sign off." },
];

export const CARE = [
  { item: "Mugs", body: "Hand-wash to keep the colours bright for longer." },
  { item: "Tumblers & bottles", body: "Hand-wash only. Don't soak or put them in the dishwasher." },
  { item: "Mousepads", body: "Wipe with a damp cloth. Don't machine-wash." },
  { item: "T-shirts", body: "Wash inside out in cold water. Don't iron over the print or tumble-dry hot." },
  { item: "Keyholders", body: "Wipe clean. The print is sealed in, so it won't rub off." },
];

/* -------------------------------- Contact -------------------------------- */

export const MESSAGE_CHECKLIST = [
  "Which product, and how many",
  "Your photos, logo or idea",
  "Any names, dates or text to add",
  "Colours you'd like (mug inside, lid, shirt)",
  "When you need it, and where it's going",
];

export const FAQ = [
  {
    q: "How do I order?",
    a: "Design your product in the 3D studio and tap “Order on WhatsApp”, or send us your photos and idea on WhatsApp. We'll confirm the design and the price before anything is printed.",
  },
  {
    q: "Can I order just one?",
    a: "Yes. Most of our work is one-off gifts. We also do bulk and corporate orders. Ask for a quote on WhatsApp.",
  },
  {
    q: "Will I see my design before it's printed?",
    a: "Yes. We check every file and confirm the design with you first. Nothing is printed until you've approved it.",
  },
  {
    q: "Do you deliver?",
    a: "Yes, anywhere in South Africa. Delivery costs depend on where it's going, so we include them in your quote.",
  },
  {
    q: "How long does it take?",
    a: "It depends on the product and how many you need. We'll give you a timeline with your quote, so tell us if you have a date in mind.",
  },
  {
    q: "Why do some products say “Quote”?",
    a: "Water bottles, T-shirts and branded boxes depend on size, colour and quantity, so we price them for your order.",
  },
  {
    q: "My photo is old or low quality. Can you still use it?",
    a: "Send it anyway. We'll tell you honestly how it will print, and suggest a size or layout that works.",
  },
];

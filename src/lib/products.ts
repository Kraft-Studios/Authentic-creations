export type ProductId =
  | "mousepad"
  | "mug"
  | "tumbler"
  | "bottle"
  | "keyholder"
  | "tshirt"
  | "box";

export type Category = "drinkware" | "office" | "keepsakes" | "business";

export interface ColorOption {
  name: string;
  value: string;
}

export interface Product {
  id: ProductId;
  name: string;
  blurb: string;
  /** Price in ZAR from the client's TikTok posts. null = priced on request. */
  price: number | null;
  method: string;
  category: Category;
  /** Print-area size in pixels; also the texture size used in 3D. */
  canvas: { w: number; h: number; transparent?: boolean };
  /** Lifestyle photo for the product page. */
  image: string;
  colorLabel?: string;
  colors?: ColorOption[];
  /** Areas that won't print (shown as a guide in the editor), in 0–1 units. */
  hole?: { x: number; y: number; r: number };
}

export const PRODUCTS: Product[] = [
  {
    id: "mousepad",
    name: "Mousepad",
    blurb: "Edge-to-edge photos, album covers or your logo. Our most-watched print on TikTok.",
    price: 120,
    method: "Sublimation",
    category: "office",
    canvas: { w: 1600, h: 1310 },
    image: "/media/photos/desk-setup.jpg",
  },
  {
    id: "mug",
    name: "Photo mug",
    blurb: "A wrap-around print on a glossy ceramic mug. Collages, names and messages welcome.",
    price: 150,
    method: "Sublimation",
    category: "drinkware",
    canvas: { w: 2000, h: 800 },
    image: "/media/photos/mug-heart.jpg",
    colorLabel: "Inside & handle",
    colors: [
      { name: "White", value: "#f4f4f1" },
      { name: "Black", value: "#161616" },
      { name: "Red", value: "#d7263d" },
      { name: "Pink", value: "#ff8fbf" },
      { name: "Blue", value: "#2f6fde" },
    ],
  },
  {
    id: "tumbler",
    name: "Skinny tumbler",
    blurb: "Stainless steel with a lid and straw, for cold and warm drinks. Printed all the way round.",
    price: 270,
    method: "Sublimation",
    category: "drinkware",
    canvas: { w: 1600, h: 1240 },
    image: "/media/photos/tumbler-pink.jpg",
    colorLabel: "Lid",
    colors: [
      { name: "Clear", value: "#dfe7ee" },
      { name: "White", value: "#f4f4f1" },
      { name: "Black", value: "#161616" },
    ],
  },
  {
    id: "bottle",
    name: "Water bottle",
    blurb: "A flask that keeps drinks cold or warm, wrapped in your photos, name or logo.",
    price: null,
    method: "Sublimation",
    category: "drinkware",
    canvas: { w: 1800, h: 790 },
    image: "/media/photos/bottles-pool.jpg",
    colorLabel: "Cap",
    colors: [
      { name: "Silver", value: "#c9ccd1" },
      { name: "Black", value: "#161616" },
      { name: "White", value: "#f4f4f1" },
    ],
  },
  {
    id: "keyholder",
    name: "Keyholder",
    blurb: "A double-sided photo keyholder made to last. It won't break or fade over time.",
    price: 90,
    method: "Sublimation",
    category: "keepsakes",
    canvas: { w: 1000, h: 1000 },
    image: "/media/photos/keyrings-clear.jpg",
    hole: { x: 0.5, y: 0.14, r: 0.05 },
  },
  {
    id: "tshirt",
    name: "T-shirt & uniforms",
    blurb: "Your logo or design on the chest, for teams, staff uniforms and events.",
    price: null,
    method: "Heat transfer",
    category: "business",
    canvas: { w: 1200, h: 1600, transparent: true },
    image: "/media/photos/tee-reveal.jpg",
    colorLabel: "Shirt",
    colors: [
      { name: "White", value: "#f2f2ef" },
      { name: "Black", value: "#18181a" },
      { name: "Grey", value: "#8d9096" },
      { name: "Navy", value: "#1d2a4d" },
      { name: "Red", value: "#b3202e" },
      { name: "Green", value: "#1f5d3f" },
    ],
  },
  {
    id: "box",
    name: "Branded box",
    blurb: "Mailer boxes with your logo on the lid, for products, gift sets and orders.",
    price: null,
    method: "Digital print",
    category: "business",
    canvas: { w: 1600, h: 1120 },
    image: "/media/photos/box-tape.jpg",
    colorLabel: "Box",
    colors: [
      { name: "Kraft", value: "#c49a6c" },
      { name: "White", value: "#efefec" },
      { name: "Black", value: "#18181a" },
    ],
  },
];

export const getProduct = (id: string | null | undefined) =>
  PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0];

export const formatPrice = (p: number | null) => (p == null ? "Quote" : `R${p}`);

export const CATEGORY_LABEL: Record<Category, string> = {
  drinkware: "Drinkware",
  office: "Office",
  keepsakes: "Keepsakes",
  business: "Business",
};

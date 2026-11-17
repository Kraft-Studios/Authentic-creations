import type { Metadata } from "next";
import StudioLoader from "@/studio/StudioLoader";

export const metadata: Metadata = {
  title: "3D Studio · Design your own",
  description:
    "Design your own mug, tumbler, mousepad, keyholder, T-shirt or branded box and see it in 3D, then order on WhatsApp from Authentic Creations.",
};

export default async function StudioPage({ searchParams }: { searchParams: Promise<{ product?: string }> }) {
  const { product } = await searchParams;
  return <StudioLoader initialProduct={product} />;
}

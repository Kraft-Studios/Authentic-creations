"use client";

import dynamic from "next/dynamic";

const Studio = dynamic(() => import("./Studio"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[100dvh] place-items-center pt-16 text-[13px] text-dim">Loading studio…</div>
  ),
});

export default function StudioLoader({ initialProduct }: { initialProduct?: string }) {
  return <Studio initialProduct={initialProduct} />;
}

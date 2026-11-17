/** Thin line icons for the studio (24 × 24, stroke = currentColor). */
const PATHS = {
  product: "M21 8l-9-5-9 5v8l9 5 9-5V8zM3 8l9 5 9-5M12 13v8",
  add: "M12 5v14M5 12h14",
  template: "M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z",
  edit: "M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4",
  photo: "M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15 9.5a1 1 0 1 0 0-.01",
  text: "M5 6V4h14v2M12 4v16M9 20h6",
  sticker: "M12 3a9 9 0 1 0 9 9M12 3a9 9 0 0 1 9 9M12 3v4a5 5 0 0 0 5 5h4M8.5 14.5s1.2 1.5 3.5 1.5",
  collage: "M4 4h16v16H4zM12 4v16M4 12h8",
  undo: "M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3",
  redo: "M15 14l5-5-5-5M20 9H10a6 6 0 0 0 0 12h3",
  rotate: "M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5",
  reset: "M12 3v3M12 18v3M3 12h3M18 12h3M12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6",
  camera: "M4 8h3l2-3h6l2 3h3v11H4zM12 10.5a3 3 0 1 0 0 6a3 3 0 1 0 0-6",
  download: "M12 4v11M7 10l5 5 5-5M5 20h14",
  center: "M12 3v18M7 8h10v8H7z",
  flip: "M12 3v18M8 7L3 12l5 5V7zM16 7l5 5-5 5V7z",
  forward: "M8 8h12v12H8zM4 16V4h12",
  backward: "M4 4h12v12H4zM8 20h12V8",
  copy: "M8 8h12v12H8zM16 8V4H4v12h4",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  alignLeft: "M4 6h16M4 10h10M4 14h16M4 18h10",
  alignCenter: "M4 6h16M7 10h10M4 14h16M7 18h10",
  alignRight: "M4 6h16M10 10h10M4 14h16M10 18h10",
  fill: "M3 3h18v18H3zM3 3l18 18M21 3L3 21",
  fit: "M4 4h16v16H4zM8 8h8v8H8z",
  minus: "M5 12h14",
  send: "M4 12l16-8-6 16-2-6-8-2zM12 14l8-10",
  upload: "M12 16V4M7 9l5-5 5 5M5 20h14",
  close: "M6 6l12 12M18 6L6 18",
  cube: "M21 8l-9-5-9 5v8l9 5 9-5V8zM3 8l9 5 9-5M12 13v8",
  frame: "M4 4h16v16H4zM4 4l16 16",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = "h-[18px] w-[18px]" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={PATHS[name]} />
    </svg>
  );
}

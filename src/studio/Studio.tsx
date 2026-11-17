"use client";

import * as THREE from "three";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { PRODUCTS, formatPrice, getProduct, type Product } from "@/lib/products";
import { SITE, waLink } from "@/lib/site";
import { DesignEditor, STICKERS, type Selection, type StickerKind, type TemplateId } from "./editor";
import Viewer, { type ViewerHandle } from "./Viewer";
import { FONTS, FONT_SET, loadStudioFonts } from "./fonts";
import { Icon, type IconName } from "./icons";

const SWATCHES = ["#111111", "#ffffff", "#ff3d8b", "#1fc8ff", "#ffd60a", "#ff5a1f", "#22c55e", "#7c3aed", "#1e3a8a", "#f5e6d3"];
const TEMPLATES: { id: TemplateId; label: string; hint: string }[] = [
  { id: "mom", label: "Best Mom", hint: "Hearts and a message" },
  { id: "name", label: "Name", hint: "One big name" },
  { id: "company", label: "Company", hint: "Logo-style text" },
  { id: "birthday", label: "Birthday", hint: "Stars and a date" },
];

type Tab = "product" | "add" | "templates" | "edit";
const TABS: { id: Tab; label: string; icon: IconName; mobileOnly?: boolean }[] = [
  { id: "product", label: "Product", icon: "product" },
  { id: "add", label: "Add", icon: "add" },
  { id: "templates", label: "Templates", icon: "template" },
  { id: "edit", label: "Edit", icon: "edit", mobileOnly: true },
];

/* ----------------------------- small UI bits ----------------------------- */
const DESKTOP = "(min-width: 1024px)";
function useDesktop() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(DESKTOP);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(DESKTOP).matches,
    () => true,
  );
}

function Label({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <p className="eyebrow text-dim">{children}</p>
      {right}
    </div>
  );
}

function IconBtn({
  icon,
  label,
  onClick,
  active,
  disabled,
  danger,
}: {
  icon: IconName;
  label: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
        active ? "border-fg bg-fg text-bg" : danger ? "border-line hover:border-red-500 hover:text-red-500" : "border-line hover:border-fg/60"
      }`}
    >
      <Icon name={icon} />
    </button>
  );
}

function Swatches({ value, onPick, allowNone }: { value?: string; onPick: (c: string) => void; allowNone?: boolean }) {
  const ring = (on: boolean) => (on ? "ring-2 ring-fg ring-offset-2 ring-offset-bg" : "");
  return (
    <div className="flex flex-wrap items-center gap-2">
      {allowNone && (
        <button
          type="button"
          title="No background"
          aria-label="No background"
          onClick={() => onPick("")}
          className={`checker h-7 w-7 rounded-full border border-line ${ring(value === "")}`}
        />
      )}
      {SWATCHES.map((c) => (
        <button
          key={c}
          type="button"
          title={c}
          aria-label={`Colour ${c}`}
          onClick={() => onPick(c)}
          style={{ background: c }}
          className={`h-7 w-7 rounded-full border border-line ${ring(value?.toLowerCase() === c)}`}
        />
      ))}
      <label
        className="relative h-7 w-7 cursor-pointer overflow-hidden rounded-full border border-line bg-[conic-gradient(red,yellow,lime,cyan,blue,magenta,red)]"
        title="Pick any colour"
      >
        <span className="sr-only">Pick any colour</span>
        <input
          type="color"
          value={value && value.startsWith("#") && value.length === 7 ? value : "#ff3d8b"}
          onChange={(e) => onPick(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>
    </div>
  );
}

function Slider({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="eyebrow text-dim">{label}</span>
      <input type="range" {...props} className="mt-2 w-full" />
    </label>
  );
}

function download(url: string, name: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/* --------------------------------- Studio -------------------------------- */
export default function Studio({ initialProduct }: { initialProduct?: string }) {
  const desktop = useDesktop();
  const desktopRef = useRef(desktop);
  desktopRef.current = desktop;

  const [product, setProduct] = useState<Product>(() => getProduct(initialProduct));
  const [colors, setColors] = useState<Record<string, string>>(() =>
    Object.fromEntries(PRODUCTS.map((p) => [p.id, p.colors?.[0]?.value ?? ""])),
  );
  const [qty, setQty] = useState(1);
  const [selection, setSelection] = useState<Selection>(null);
  const [hist, setHist] = useState({ undo: false, redo: false });
  const [cssSize, setCssSize] = useState({ w: 0, h: 0 });
  const [texVersion, setTexVersion] = useState(0);
  const [ready, setReady] = useState(false);
  const [counts, setCounts] = useState({ objects: 0, images: 0 });
  const [autoRotate, setAutoRotate] = useState(true);
  const [printed, setPrinted] = useState(true);
  const [bg, setBg] = useState(product.canvas.transparent ? "" : "#ffffff");
  const [dropping, setDropping] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Tab>("add");
  const [view, setView] = useState<"3d" | "print">("3d");

  const editorRef = useRef<DesignEditor | null>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<ViewerHandle>(null);
  const texRef = useRef<THREE.CanvasTexture | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef(0);

  const flash = (msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  };

  /* Create the 2D editor once. */
  useEffect(() => {
    let cancelled = false;
    let ed: DesignEditor | null = null;
    (async () => {
      await loadStudioFonts();
      if (cancelled || !hostRef.current || !frameRef.current) return;
      ed = new DesignEditor(
        hostRef.current,
        frameRef.current,
        product,
        {
          onRender: () => {
            if (texRef.current) texRef.current.needsUpdate = true;
          },
          onSelection: (s, byUser) => {
            setSelection(s);
            // On phones, tapping something on the print area opens its settings.
            if (s && byUser && !desktopRef.current) setTab("edit");
          },
          onHistory: (undo, redo) => setHist({ undo, redo }),
          onFit: (w, h) => setCssSize({ w, h }),
          onResize: () => setTexVersion((v) => v + 1),
          onObjects: (objects, images) => setCounts({ objects, images }),
        },
        FONT_SET,
      );
      editorRef.current = ed;
      ed.starter();
      setReady(true);
    })();
    return () => {
      cancelled = true;
      ed?.dispose();
      editorRef.current = null;
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* The editor's canvas is the 3D texture. Rebuilt when the print-area size changes. */
  const texture = useMemo(() => {
    const ed = editorRef.current;
    if (!ready || !ed) return null;
    const t = new THREE.CanvasTexture(ed.canvas.getElement());
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [ready, texVersion]);
  useEffect(() => {
    texRef.current = texture;
    return () => texture?.dispose();
  }, [texture]);

  /* The Edit tab only exists on phones. */
  useEffect(() => {
    if (desktop && tab === "edit") setTab("add");
  }, [desktop, tab]);

  /* Keyboard shortcuts + paste images. */
  useEffect(() => {
    const typing = (t: EventTarget | null) => {
      const el = t as HTMLElement | null;
      return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
    };
    const onKey = (e: KeyboardEvent) => {
      const ed = editorRef.current;
      if (!ed || typing(e.target) || ed.isEditingText()) return;
      const mod = e.ctrlKey || e.metaKey;
      if ((e.key === "Delete" || e.key === "Backspace") && ed.hasSelection()) {
        e.preventDefault();
        ed.remove();
      } else if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        void (e.shiftKey ? ed.redo() : ed.undo());
      } else if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        void ed.redo();
      } else if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        void ed.duplicate();
      }
    };
    const onPaste = (e: ClipboardEvent) => {
      if (typing(e.target)) return;
      const files = Array.from(e.clipboardData?.files ?? []).filter((f) => f.type.startsWith("image/"));
      if (files.length) void addFiles(files);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("paste", onPaste);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("paste", onPaste);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ed = () => editorRef.current;
  /** On phones, show the print area so the new design can be seen. */
  const showPrint = () => {
    if (!desktopRef.current) setView("print");
  };
  /** On phones, show a newly added item on the print area with its settings open. */
  const afterAdd = () => {
    if (desktopRef.current) return;
    setView("print");
    setTab("edit");
  };

  async function addFiles(files: File[]) {
    const e = ed();
    if (!e) return;
    setBusy(true);
    try {
      for (const f of files) await e.addImageFile(f);
      afterAdd();
      if (files.length > 1) flash(`${files.length} photos added. Try “Make a collage”.`);
    } catch {
      flash("That file couldn't be opened. Try a JPG or PNG.");
    } finally {
      setBusy(false);
    }
  }

  async function chooseProduct(p: Product) {
    if (p.id === product.id || !ed()) return;
    setProduct(p);
    await ed()!.switchProduct(p);
    setBg(ed()!.background);
    window.history.replaceState(null, "", `/studio?product=${p.id}`);
  }

  const color = colors[product.id];
  const optionName = product.colors?.find((c) => c.value === color)?.name;
  const total = product.price != null ? product.price * qty : null;
  const transparent = !!product.canvas.transparent;
  const frameBg = transparent ? color || "#f2f2ef" : undefined;

  function orderOnWhatsApp() {
    const e = ed();
    if (!e) return;
    const file = `authentic-${product.id}-design.png`;
    download(e.exportPNG(), file);
    const lines = [
      `Hi ${SITE.name}! I designed a ${product.name} in your 3D studio.`,
      optionName && product.colorLabel ? `${product.colorLabel}: ${optionName}` : null,
      `Quantity: ${qty}`,
      total != null ? `Estimate: R${total} (R${product.price} each)` : "Please send me a quote.",
      `I'm attaching my design file (${file}).`,
    ].filter(Boolean);
    window.open(waLink(lines.join("\n")), "_blank", "noopener,noreferrer");
    flash("Design file saved. Attach it in the WhatsApp chat.");
  }

  function save3D() {
    const url = viewerRef.current?.capture();
    if (url) download(url, `authentic-${product.id}-3d.png`);
  }

  const sel = selection;

  /* ------------------------------ panels ------------------------------ */
  const productPanel = (
    <div className="space-y-7">
      <div>
        <Label>choose a product</Label>
        <div className="grid grid-cols-2 gap-2">
          {PRODUCTS.map((p) => {
            const on = p.id === product.id;
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={on}
                onClick={() => void chooseProduct(p)}
                className={`group overflow-hidden rounded-lg border text-left transition-colors ${on ? "border-fg" : "border-line hover:border-fg/40"}`}
              >
                <span className="relative block aspect-[4/3] bg-panel">
                  <Image src={p.image} alt="" fill sizes="140px" className={`object-cover ${on ? "" : "bw"}`} />
                </span>
                <span className="flex items-baseline justify-between gap-2 px-2.5 py-2">
                  <span className="truncate text-[13px] leading-tight">{p.name}</span>
                  <span className={`shrink-0 text-[12px] tabular-nums ${p.price != null ? "" : "text-dim"}`}>{formatPrice(p.price)}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {product.colors && (
        <div>
          <Label>
            {product.colorLabel}: <span className="text-fg">{optionName}</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <button
                key={c.value}
                type="button"
                title={c.name}
                aria-label={c.name}
                onClick={() => setColors((s) => ({ ...s, [product.id]: c.value }))}
                style={{ background: c.value }}
                className={`h-8 w-8 rounded-full border border-line ${color === c.value ? "ring-2 ring-fg ring-offset-2 ring-offset-bg" : ""}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const addPanel = (
    <div className="space-y-7">
      <div>
        <Label>photos</Label>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={!ready || busy}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-fg/30 px-4 py-6 text-center transition-colors hover:border-fg disabled:opacity-50"
        >
          <Icon name="upload" className="h-6 w-6" />
          <span className="text-[15px]">{busy ? "Adding…" : "Upload photos"}</span>
          <span className="text-[12px] text-dim">JPG or PNG. You can also paste or drop them on the print area.</span>
        </button>
        <button
          type="button"
          disabled={!ready || counts.images < 2}
          onClick={() => {
            if (ed()?.collage()) {
              flash("Photos arranged into a collage");
              showPrint();
            }
          }}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-line px-4 py-2.5 text-[14px] transition-colors hover:border-fg/60 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon name="collage" />
          Make a collage
          {counts.images > 0 && <span className="text-dim">({counts.images})</span>}
        </button>
      </div>

      <div>
        <Label>text</Label>
        <button
          type="button"
          onClick={() => {
            ed()?.addText("Your text");
            afterAdd();
          }}
          disabled={!ready}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-fg px-4 py-3 text-[15px] text-bg transition-transform hover:scale-[1.01] disabled:opacity-50"
        >
          <Icon name="text" />
          Add text
        </button>
      </div>

      <div>
        <Label>shapes</Label>
        <div className="grid grid-cols-6 gap-2">
          {(Object.keys(STICKERS) as StickerKind[]).map((k) => (
            <button
              key={k}
              type="button"
              title={`Add ${k}`}
              aria-label={`Add ${k}`}
              disabled={!ready}
              onClick={() => {
                ed()?.addSticker(k);
                afterAdd();
              }}
              className="grid aspect-square place-items-center rounded-lg border border-line transition-colors hover:border-fg/60"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                <path d={STICKERS[k]} />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>background</Label>
        <Swatches
          value={bg}
          allowNone={transparent}
          onPick={(c) => {
            setBg(c);
            ed()?.setBackground(c);
          }}
        />
      </div>
    </div>
  );

  const templatesPanel = (
    <div>
      <Label>start from a template</Label>
      <div className="grid grid-cols-2 gap-2">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            disabled={!ready}
            onClick={() => {
              ed()?.applyTemplate(t.id);
              showPrint();
            }}
            className="rounded-lg border border-line px-3 py-4 text-left transition-colors hover:border-fg/60"
          >
            <span className="block text-[15px]">{t.label}</span>
            <span className="mt-1 block text-[12px] text-dim">{t.hint}</span>
          </button>
        ))}
      </div>
      <p className="mt-4 text-[12px] leading-snug text-dim">Templates replace your text and shapes. Your photos stay.</p>
    </div>
  );

  const inspector = (
    <div>
      {!sel ? (
        <div className="rounded-lg border border-dashed border-line px-4 py-6 text-center">
          <p className="text-[14px]">Nothing selected</p>
          <p className="mt-1 text-[12px] leading-snug text-dim">
            Tap a photo, text or shape on the print area to edit it. Move it with your finger or mouse, and use the corners to resize.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <Label
            right={
              <div className="flex gap-1.5">
                <IconBtn icon="copy" label="Duplicate (Ctrl+D)" onClick={() => void ed()?.duplicate()} />
                <IconBtn icon="trash" label="Delete" danger onClick={() => ed()?.remove()} />
              </div>
            }
          >
            {sel.kind === "multi" ? `${sel.count} items` : sel.kind === "image" ? "photo" : sel.kind}
          </Label>

          {sel.kind === "text" && (
            <>
              <textarea
                value={sel.text}
                onChange={(e) => ed()?.updateActive({ text: e.target.value })}
                rows={2}
                aria-label="Text"
                className="w-full resize-none rounded-lg border border-line bg-panel px-3 py-2 text-[15px] outline-none focus:border-fg"
              />
              <div className="flex gap-2">
                <select
                  value={FONTS.find((f) => f.family === sel.fontFamily)?.family ?? sel.fontFamily}
                  onChange={(e) => ed()?.updateActive({ fontFamily: e.target.value })}
                  aria-label="Font"
                  className="min-w-0 flex-1 rounded-lg border border-line bg-panel px-2.5 py-2 text-[14px] outline-none focus:border-fg"
                >
                  {FONTS.map((f) => (
                    <option key={f.id} value={f.family} style={{ fontFamily: f.family }}>
                      {f.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  aria-pressed={sel.bold}
                  title="Bold"
                  onClick={() => ed()?.updateActive({ fontWeight: sel.bold ? "normal" : "bold" })}
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border text-[15px] font-bold ${
                    sel.bold ? "border-fg bg-fg text-bg" : "border-line"
                  }`}
                >
                  B
                </button>
              </div>
              <div className="flex gap-1.5">
                {(["left", "center", "right"] as const).map((a) => (
                  <IconBtn
                    key={a}
                    icon={a === "left" ? "alignLeft" : a === "center" ? "alignCenter" : "alignRight"}
                    label={`Align ${a}`}
                    active={sel.textAlign === a}
                    onClick={() => ed()?.updateActive({ textAlign: a })}
                  />
                ))}
              </div>
              <Slider
                label="size"
                min={16}
                max={Math.round(Math.min(product.canvas.w, product.canvas.h) * 0.6)}
                value={sel.fontSize}
                onChange={(e) => ed()?.updateActive({ fontSize: Number(e.target.value), scaleX: 1, scaleY: 1 })}
              />
              <div>
                <p className="eyebrow mb-2 text-dim">colour</p>
                <Swatches value={sel.fill} onPick={(c) => ed()?.updateActive({ fill: c })} />
              </div>
            </>
          )}

          {sel.kind === "shape" && (
            <div>
              <p className="eyebrow mb-2 text-dim">colour</p>
              <Swatches value={sel.fill} onPick={(c) => ed()?.updateActive({ fill: c })} />
            </div>
          )}

          {sel.kind === "image" && (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => ed()?.fillArea("cover")}
                className="flex items-center justify-center gap-2 rounded-lg border border-line py-2.5 text-[14px] hover:border-fg/60"
              >
                <Icon name="fill" /> Fill area
              </button>
              <button
                type="button"
                onClick={() => ed()?.fillArea("contain")}
                className="flex items-center justify-center gap-2 rounded-lg border border-line py-2.5 text-[14px] hover:border-fg/60"
              >
                <Icon name="fit" /> Fit inside
              </button>
            </div>
          )}

          {sel.kind !== "multi" && (
            <Slider
              label="opacity"
              min={0.1}
              max={1}
              step={0.05}
              value={sel.opacity}
              onChange={(e) => ed()?.updateActive({ opacity: Number(e.target.value) })}
            />
          )}

          <div>
            <p className="eyebrow mb-2 text-dim">arrange</p>
            <div className="flex flex-wrap gap-1.5">
              <IconBtn icon="center" label="Centre" onClick={() => ed()?.center()} />
              <IconBtn icon="flip" label="Mirror" onClick={() => ed()?.flip()} />
              <IconBtn icon="forward" label="Bring forward" onClick={() => ed()?.forward()} />
              <IconBtn icon="backward" label="Send backward" onClick={() => ed()?.backward()} />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const tabs = TABS.filter((t) => !t.mobileOnly || !desktop);

  /* ------------------------------- layout ------------------------------- */
  return (
    <div className="studio-grid h-[100dvh] overflow-hidden bg-bg pt-16">
      <h1 className="sr-only">{SITE.name} 3D design studio</h1>

      {/* 3D preview */}
      <section className="sa-stage relative min-h-0 min-w-0 overflow-hidden border-b border-line bg-panel lg:border-b-0">
        <Viewer
          ref={viewerRef}
          product={product}
          texture={texture}
          color={color}
          autoRotate={autoRotate}
          printed={printed}
          active={desktop || view === "3d"}
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 lg:p-5">
          <div>
            <p className="text-[clamp(1.1rem,2vw,1.6rem)] leading-tight tracking-[-0.03em]">{product.name}</p>
            <p className="text-[14px] tabular-nums text-dim">{formatPrice(product.price)}</p>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex justify-center p-3 lg:p-5">
          <div className="flex items-center gap-1 rounded-full border border-line bg-bg/85 p-1 backdrop-blur">
            {[
              { v: false, l: "Blank" },
              { v: true, l: "Printed" },
            ].map((o) => (
              <button
                key={o.l}
                type="button"
                aria-pressed={printed === o.v}
                onClick={() => (o.v && printed ? viewerRef.current?.press() : setPrinted(o.v))}
                className={`rounded-full px-3.5 py-1.5 text-[13px] transition-colors ${printed === o.v ? "bg-fg text-bg" : "text-fg/70 hover:text-fg"}`}
              >
                {o.l}
              </button>
            ))}
            <span className="mx-1 h-5 w-px bg-line" aria-hidden />
            <button
              type="button"
              title="Auto-rotate"
              aria-label="Auto-rotate"
              aria-pressed={autoRotate}
              onClick={() => setAutoRotate((v) => !v)}
              className={`grid h-8 w-8 place-items-center rounded-full transition-colors ${autoRotate ? "bg-fg text-bg" : "hover:bg-fg/10"}`}
            >
              <Icon name="rotate" className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Reset view"
              aria-label="Reset view"
              onClick={() => viewerRef.current?.resetView()}
              className="grid h-8 w-8 place-items-center rounded-full hover:bg-fg/10"
            >
              <Icon name="reset" className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Save 3D image"
              aria-label="Save 3D image"
              onClick={save3D}
              className="grid h-8 w-8 place-items-center rounded-full hover:bg-fg/10"
            >
              <Icon name="camera" className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Phones: switch the preview between 3D and the print area */}
        <div className="absolute right-3 top-3 z-30 flex rounded-full border border-line bg-bg/85 p-1 backdrop-blur lg:hidden">
          {(
            [
              { v: "3d", l: "3D", icon: "cube" },
              { v: "print", l: "Print area", icon: "frame" },
            ] as const
          ).map((o) => (
            <button
              key={o.v}
              type="button"
              aria-pressed={view === o.v}
              onClick={() => setView(o.v)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] ${view === o.v ? "bg-fg text-bg" : "text-fg/70"}`}
            >
              <Icon name={o.icon} className="h-4 w-4" />
              {o.l}
            </button>
          ))}
        </div>

        {!ready && <div className="absolute inset-0 grid place-items-center eyebrow text-dim">loading studio…</div>}
      </section>

      {/* Left column: tools */}
      <div className="sa-left lg:border-r lg:border-line">
        <nav className="sa-tabs flex border-b border-line bg-bg" aria-label="Studio tools">
          {tabs.map((t) => {
            const on = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={on}
                onClick={() => setTab(t.id)}
                className={`relative flex flex-1 items-center justify-center gap-1.5 py-3 text-[13px] transition-colors ${on ? "text-fg" : "text-dim hover:text-fg"}`}
              >
                <Icon name={t.icon} className="h-4 w-4" />
                {t.label}
                {t.id === "edit" && sel && <span className="absolute right-3 top-2.5 h-1.5 w-1.5 rounded-full bg-fg" aria-hidden />}
                <span className={`absolute inset-x-3 -bottom-px h-px ${on ? "bg-fg" : "bg-transparent"}`} aria-hidden />
              </button>
            );
          })}
        </nav>
        <div className={`sa-panel thin-scroll min-h-0 overflow-y-auto p-4 lg:flex-1 lg:p-5 ${tab === "edit" ? "hidden" : ""}`}>
          {tab === "product" ? productPanel : tab === "templates" ? templatesPanel : addPanel}
        </div>
      </div>

      {/* Right column: print area, selection, order */}
      <div className="sa-right lg:border-l lg:border-line">
        <section
          className={`sa-print relative z-20 flex min-h-0 flex-col bg-panel p-3 lg:z-auto lg:border-b lg:border-line lg:bg-bg lg:p-5 ${
            !desktop && view !== "print" ? "invisible" : ""
          }`}
          aria-label="Print area"
        >
          <div className="mb-2 flex items-center justify-between gap-2 pr-[14.5rem] lg:mb-3 lg:pr-0">
            <p className="eyebrow hidden text-dim lg:block">print area</p>
            <div className="flex gap-1.5">
              <IconBtn icon="undo" label="Undo (Ctrl+Z)" disabled={!hist.undo} onClick={() => void ed()?.undo()} />
              <IconBtn icon="redo" label="Redo (Ctrl+Shift+Z)" disabled={!hist.redo} onClick={() => void ed()?.redo()} />
            </div>
          </div>
          <div
            ref={frameRef}
            className="relative flex min-h-0 flex-1 items-center justify-center lg:h-[30vh] lg:flex-none"
            onDragOver={(e) => {
              e.preventDefault();
              setDropping(true);
            }}
            onDragLeave={() => setDropping(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDropping(false);
              const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
              if (files.length) void addFiles(files);
            }}
          >
            <div
              className={`relative shadow-[0_0_0_1px_var(--line),0_12px_40px_-18px_rgba(0,0,0,0.35)] ${transparent ? "" : "checker"}`}
              style={{ width: cssSize.w || undefined, height: cssSize.h || undefined, background: frameBg }}
            >
              <div ref={hostRef} className="absolute inset-0" />
              {product.hole && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute rounded-full border border-dashed border-black/60 bg-black/10"
                  style={{
                    left: `${(product.hole.x - product.hole.r) * 100}%`,
                    top: `${(product.hole.y - product.hole.r) * 100}%`,
                    width: `${product.hole.r * 200}%`,
                    height: `${product.hole.r * 200}%`,
                  }}
                />
              )}
              <span aria-hidden className="pointer-events-none absolute inset-[3%] border border-dashed border-white/70 mix-blend-difference" />
            </div>
            {dropping && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-lg border-2 border-dashed border-fg bg-bg/80 text-[14px]">
                Drop photos to add them
              </div>
            )}
          </div>
          <p className="mt-2 hidden text-[12px] leading-snug text-dim lg:block">Keep names and faces inside the dashed line.</p>
        </section>

        <div className={`sa-panel thin-scroll min-h-0 overflow-y-auto p-4 lg:flex-1 lg:p-5 ${!desktop && tab !== "edit" ? "hidden" : ""}`}>
          {inspector}
        </div>

        <section className="sa-order border-t border-line bg-bg px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:p-5" aria-label="Order">
          <div className="flex items-center gap-3">
            <div className="flex shrink-0 items-center rounded-full border border-line">
              <button type="button" aria-label="Fewer" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-9 w-9 place-items-center">
                <Icon name="minus" className="h-4 w-4" />
              </button>
              <input
                aria-label="Quantity"
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                className="w-9 bg-transparent text-center text-[15px] tabular-nums outline-none"
              />
              <button type="button" aria-label="More" onClick={() => setQty((q) => q + 1)} className="grid h-9 w-9 place-items-center">
                <Icon name="add" className="h-4 w-4" />
              </button>
            </div>
            <div className="min-w-0 flex-1 text-right lg:text-right">
              <p className="text-[clamp(1.2rem,2vw,1.6rem)] leading-none tabular-nums tracking-[-0.03em]">{total != null ? `R${total}` : "Quote"}</p>
              <p className="mt-1 truncate text-[11px] text-dim">{product.price != null ? `R${product.price} each, estimate` : "priced on WhatsApp"}</p>
            </div>
            <button
              type="button"
              onClick={orderOnWhatsApp}
              disabled={!ready}
              className="flex shrink-0 items-center gap-2 rounded-full bg-fg px-4 py-2.5 text-[14px] text-bg transition-transform hover:scale-[1.03] disabled:opacity-50 lg:hidden"
            >
              Order
              <Icon name="send" className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={orderOnWhatsApp}
            disabled={!ready}
            className="mt-4 hidden w-full items-center justify-center gap-2 rounded-full bg-fg py-3 text-[15px] text-bg transition-transform hover:scale-[1.02] disabled:opacity-50 lg:flex"
          >
            Order on WhatsApp
            <Icon name="send" className="h-4 w-4" />
          </button>
          <div className="mt-3 hidden items-center justify-between gap-3 lg:flex">
            <p className="text-[11px] leading-snug text-dim">We confirm the price and check your design before printing.</p>
            <button
              type="button"
              onClick={() => ed() && download(ed()!.exportPNG(), `authentic-${product.id}-design.png`)}
              disabled={!ready}
              className="flex shrink-0 items-center gap-1.5 text-[12px] text-dim hover:text-fg"
            >
              <Icon name="download" className="h-3.5 w-3.5" />
              Print file
            </button>
          </div>
        </section>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (files.length) void addFiles(files);
        }}
      />

      {toast && (
        <div role="status" className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-fg px-4 py-2 text-[14px] text-bg shadow-xl lg:bottom-6">
          {toast}
        </div>
      )}
    </div>
  );
}

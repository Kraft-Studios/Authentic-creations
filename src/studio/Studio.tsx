"use client";

import * as THREE from "three";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { PRODUCTS, formatPrice, getProduct, type Product } from "@/lib/products";
import { SITE, waLink } from "@/lib/site";
import { interTight } from "@/app/fonts";
import { DesignEditor, STICKERS, type Selection, type StickerKind, type TemplateId } from "./editor";
import Viewer, { type ViewerHandle } from "./Viewer";
import { FONTS, FONT_SET, loadStudioFonts } from "./fonts";
import { Icon, type IconName } from "./icons";

const SWATCHES = ["#111111", "#ffffff", "#ff3d8b", "#1fc8ff", "#ffd60a", "#ff5a1f", "#22c55e", "#7c3aed", "#1e3a8a", "#f5e6d3"];
const TEMPLATES: { id: TemplateId; label: string; hint: string }[] = [
  { id: "mom", label: "Best Mom", hint: "Hearts and a short message" },
  { id: "name", label: "Name", hint: "One name, set large" },
  { id: "company", label: "Company", hint: "Your business name, logo style" },
  { id: "birthday", label: "Birthday", hint: "Stars and a date" },
];
const SHAPE_NAMES: Record<StickerKind, string> = {
  heart: "Heart",
  star: "Star",
  sparkle: "Sparkle",
  crown: "Crown",
  bolt: "Lightning bolt",
  circle: "Circle",
};

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

const BTN_PRIMARY =
  "flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-fg px-4 text-[14px] font-medium text-bg transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40";
const BTN_SECONDARY =
  "flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-line bg-raise px-4 text-[14px] font-medium transition-colors hover:border-fg/30 disabled:cursor-not-allowed disabled:opacity-40";

/** A titled block in a tool panel. Blocks after the first get a hairline above them. */
function Section({ title, aside, hint, children }: { title: string; aside?: ReactNode; hint?: ReactNode; children: ReactNode }) {
  return (
    <section className="border-t border-line pt-5 first:border-t-0 first:pt-0">
      <div className="mb-3 flex min-h-6 items-center justify-between gap-3">
        <h3 className="text-[13px] font-medium">{title}</h3>
        {aside}
      </div>
      {children}
      {hint && <p className="mt-2.5 text-[12px] leading-snug text-dim">{hint}</p>}
    </section>
  );
}

/** A labelled control with an optional value read-out on the right. */
function Field({ label, value, children }: { label: string; value?: ReactNode; children: ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[12px] text-dim">
        <span>{label}</span>
        {value != null && <span className="tabular-nums text-fg/70">{value}</span>}
      </div>
      {children}
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
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
        active ? "bg-fg text-bg" : danger ? "text-fg/70 hover:bg-red-500/10 hover:text-red-500" : "text-fg/70 hover:bg-panel hover:text-fg"
      }`}
    >
      <Icon name={icon} className="h-[17px] w-[17px]" />
    </button>
  );
}

/** Segmented control (tabs, view switches). */
function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  small,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: IconName; dot?: boolean }[];
  label: string;
  small?: boolean;
}) {
  return (
    <div role="tablist" aria-label={label} className="flex rounded-lg bg-panel p-[3px]">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(o.value)}
            className={`relative flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium transition-colors ${
              small ? "px-2.5 py-1 text-[12px]" : "px-2 py-1.5 text-[13px]"
            } ${on ? "bg-raise text-fg shadow-[0_1px_2px_rgba(0,0,0,0.12)]" : "text-dim hover:text-fg"}`}
          >
            {o.icon && <Icon name={o.icon} className="h-[15px] w-[15px]" />}
            {o.label}
            {o.dot && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-fg" aria-hidden />}
          </button>
        );
      })}
    </div>
  );
}

function Swatches({ value, onPick, allowNone }: { value?: string; onPick: (c: string) => void; allowNone?: boolean }) {
  const ring = (on: boolean) => (on ? "ring-2 ring-fg ring-offset-2 ring-offset-bg" : "hover:scale-110");
  const custom = !!value && value.length === 7 && !SWATCHES.includes(value.toLowerCase());
  return (
    <div className="flex flex-wrap items-center gap-2">
      {allowNone && (
        <button
          type="button"
          title="No background"
          aria-label="No background"
          onClick={() => onPick("")}
          className={`checker h-6 w-6 rounded-full border border-line transition-transform ${ring(value === "")}`}
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
          className={`h-6 w-6 rounded-full border border-line transition-transform ${ring(value?.toLowerCase() === c)}`}
        />
      ))}
      <label
        className={`relative grid h-6 w-6 cursor-pointer place-items-center overflow-hidden rounded-full border border-line bg-raise text-fg/70 transition-transform ${ring(custom)}`}
        style={custom ? { background: value } : undefined}
        title="Any colour"
      >
        <span className="sr-only">Pick any colour</span>
        {!custom && <Icon name="add" className="h-3.5 w-3.5" />}
        <input
          type="color"
          value={value && value.startsWith("#") && value.length === 7 ? value : "#111111"}
          onChange={(e) => onPick(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>
    </div>
  );
}

function Slider({ min, max, value, ...props }: { min: number; max: number; value: number } & React.InputHTMLAttributes<HTMLInputElement>) {
  const p = ((value - min) / (max - min || 1)) * 100;
  return (
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      {...props}
      className="studio-range"
      style={{ "--p": `${Math.min(100, Math.max(0, p))}%` } as React.CSSProperties}
    />
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
    <div className="space-y-5">
      <Section title="Product">
        <div className="grid grid-cols-2 gap-2">
          {PRODUCTS.map((p) => {
            const on = p.id === product.id;
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={on}
                onClick={() => void chooseProduct(p)}
                className={`group overflow-hidden rounded-lg border bg-raise text-left transition-colors ${
                  on ? "border-fg" : "border-line hover:border-fg/30"
                }`}
              >
                <span className="relative block aspect-[4/3] bg-panel">
                  <Image src={p.image} alt="" fill sizes="140px" className={`object-cover ${on ? "" : "bw"}`} />
                </span>
                <span className="block px-2.5 pb-2.5 pt-2">
                  <span className="block truncate text-[13px] font-medium leading-tight">{p.name}</span>
                  <span className="mt-0.5 block text-[12px] tabular-nums text-dim">{formatPrice(p.price)}</span>
                </span>
              </button>
            );
          })}
        </div>
      </Section>
      {product.colors && (
        <Section title={product.colorLabel ?? "Colour"} aside={<span className="text-[12px] text-dim">{optionName}</span>}>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <button
                key={c.value}
                type="button"
                title={c.name}
                aria-label={c.name}
                onClick={() => setColors((s) => ({ ...s, [product.id]: c.value }))}
                style={{ background: c.value }}
                className={`h-7 w-7 rounded-full border border-line transition-transform ${
                  color === c.value ? "ring-2 ring-fg ring-offset-2 ring-offset-bg" : "hover:scale-110"
                }`}
              />
            ))}
          </div>
        </Section>
      )}
    </div>
  );

  const addPanel = (
    <div className="space-y-5">
      <Section title="Photos" hint="JPG or PNG. You can also drag photos onto the print area, or paste them.">
        <div className="space-y-2">
          <button type="button" onClick={() => fileRef.current?.click()} disabled={!ready || busy} className={BTN_PRIMARY}>
            <Icon name="upload" className="h-4 w-4" />
            {busy ? "Adding…" : "Upload photos"}
          </button>
          <button
            type="button"
            disabled={!ready || counts.images < 2}
            title={counts.images < 2 ? "Add two or more photos first" : undefined}
            onClick={() => {
              if (ed()?.collage()) {
                flash("Photos arranged into a collage");
                showPrint();
              }
            }}
            className={BTN_SECONDARY}
          >
            <Icon name="collage" className="h-4 w-4" />
            Make a collage
            {counts.images > 1 && <span className="font-normal text-dim">{counts.images} photos</span>}
          </button>
        </div>
      </Section>

      <Section title="Text">
        <button
          type="button"
          onClick={() => {
            ed()?.addText("Your text");
            afterAdd();
          }}
          disabled={!ready}
          className={BTN_SECONDARY}
        >
          <Icon name="text" className="h-4 w-4" />
          Add a text box
        </button>
      </Section>

      <Section title="Shapes">
        <div className="grid grid-cols-6 gap-1.5">
          {(Object.keys(STICKERS) as StickerKind[]).map((k) => (
            <button
              key={k}
              type="button"
              title={SHAPE_NAMES[k]}
              aria-label={`Add ${SHAPE_NAMES[k].toLowerCase()}`}
              disabled={!ready}
              onClick={() => {
                ed()?.addSticker(k);
                afterAdd();
              }}
              className="grid aspect-square place-items-center rounded-lg bg-panel text-fg/75 transition-colors hover:bg-fg hover:text-bg"
            >
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden>
                <path d={STICKERS[k]} />
              </svg>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Background">
        <Swatches
          value={bg}
          allowNone={transparent}
          onPick={(c) => {
            setBg(c);
            ed()?.setBackground(c);
          }}
        />
      </Section>
    </div>
  );

  const templatesPanel = (
    <Section title="Templates" hint="A template replaces your text and shapes. Your photos stay.">
      <div className="space-y-2">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            disabled={!ready}
            onClick={() => {
              ed()?.applyTemplate(t.id);
              showPrint();
            }}
            className="group flex w-full items-center justify-between gap-3 rounded-lg border border-line bg-raise px-3.5 py-3 text-left transition-colors hover:border-fg/30"
          >
            <span>
              <span className="block text-[14px] font-medium">{t.label}</span>
              <span className="mt-0.5 block text-[12px] text-dim">{t.hint}</span>
            </span>
            <Icon name="chevron" className="h-4 w-4 text-dim transition-transform group-hover:translate-x-0.5" />
          </button>
        ))}
      </div>
    </Section>
  );

  const selTitle = !sel ? "" : sel.kind === "multi" ? `${sel.count} items` : sel.kind === "image" ? "Photo" : sel.kind === "text" ? "Text" : "Shape";
  const fontMax = Math.round(Math.min(product.canvas.w, product.canvas.h) * 0.6);

  const inspector = !sel ? (
    <div className="flex h-full min-h-40 flex-col items-center justify-center px-6 py-8 text-center">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-panel text-dim">
        <Icon name="cursor" className="h-[18px] w-[18px]" />
      </span>
      <p className="mt-3 text-[13px] font-medium">Nothing selected</p>
      <p className="mt-1 max-w-[17rem] text-[12px] leading-snug text-dim">
        Click a photo, text or shape on the print area to edit it. Drag to move it and use the corners to resize.
      </p>
    </div>
  ) : (
    <div className="space-y-5">
      <Section
        title={selTitle}
        aside={
          <div className="-mr-1.5 flex">
            <IconBtn icon="copy" label="Duplicate (Ctrl+D)" onClick={() => void ed()?.duplicate()} />
            <IconBtn icon="trash" label="Delete" danger onClick={() => ed()?.remove()} />
          </div>
        }
      >
        <div className="space-y-4">
          {sel.kind === "text" && (
            <>
              <textarea
                value={sel.text}
                onChange={(e) => ed()?.updateActive({ text: e.target.value })}
                rows={2}
                aria-label="Text"
                className="w-full resize-none rounded-lg border border-line bg-raise px-3 py-2 text-[14px] outline-none transition-colors focus:border-fg/40"
              />
              <div className="flex gap-2">
                <select
                  value={FONTS.find((f) => f.family === sel.fontFamily)?.family ?? sel.fontFamily}
                  onChange={(e) => ed()?.updateActive({ fontFamily: e.target.value })}
                  aria-label="Font"
                  className="h-9 min-w-0 flex-1 rounded-lg border border-line bg-raise px-2.5 text-[13px] outline-none transition-colors focus:border-fg/40"
                >
                  {FONTS.map((f) => (
                    <option key={f.id} value={f.family}>
                      {f.label}
                    </option>
                  ))}
                </select>
                <div className="flex rounded-lg bg-panel p-[3px]">
                  {(["left", "center", "right"] as const).map((a) => (
                    <button
                      key={a}
                      type="button"
                      title={`Align ${a}`}
                      aria-label={`Align ${a}`}
                      aria-pressed={sel.textAlign === a}
                      onClick={() => ed()?.updateActive({ textAlign: a })}
                      className={`grid h-[30px] w-[30px] place-items-center rounded-md transition-colors ${
                        sel.textAlign === a ? "bg-raise text-fg shadow-[0_1px_2px_rgba(0,0,0,0.12)]" : "text-dim hover:text-fg"
                      }`}
                    >
                      <Icon name={a === "left" ? "alignLeft" : a === "center" ? "alignCenter" : "alignRight"} className="h-4 w-4" />
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  aria-pressed={sel.bold}
                  title="Bold"
                  aria-label="Bold"
                  onClick={() => ed()?.updateActive({ fontWeight: sel.bold ? "normal" : "bold" })}
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[14px] font-bold transition-colors ${
                    sel.bold ? "bg-fg text-bg" : "border border-line bg-raise hover:border-fg/30"
                  }`}
                >
                  B
                </button>
              </div>
              <Field label="Size" value={Math.round(sel.fontSize)}>
                <Slider
                  aria-label="Text size"
                  min={16}
                  max={fontMax}
                  value={Math.min(sel.fontSize, fontMax)}
                  onChange={(e) => ed()?.updateActive({ fontSize: Number(e.target.value), scaleX: 1, scaleY: 1 })}
                />
              </Field>
              <Field label="Colour">
                <Swatches value={sel.fill} onPick={(c) => ed()?.updateActive({ fill: c })} />
              </Field>
            </>
          )}

          {sel.kind === "shape" && (
            <Field label="Colour">
              <Swatches value={sel.fill} onPick={(c) => ed()?.updateActive({ fill: c })} />
            </Field>
          )}

          {sel.kind === "image" && (
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => ed()?.fillArea("cover")} className={`${BTN_SECONDARY} h-9 text-[13px]`}>
                <Icon name="fill" className="h-4 w-4" /> Fill area
              </button>
              <button type="button" onClick={() => ed()?.fillArea("contain")} className={`${BTN_SECONDARY} h-9 text-[13px]`}>
                <Icon name="fit" className="h-4 w-4" /> Fit inside
              </button>
            </div>
          )}

          {sel.kind !== "multi" && (
            <Field label="Opacity" value={`${Math.round(sel.opacity * 100)}%`}>
              <Slider
                aria-label="Opacity"
                min={0.1}
                max={1}
                step={0.05}
                value={sel.opacity}
                onChange={(e) => ed()?.updateActive({ opacity: Number(e.target.value) })}
              />
            </Field>
          )}
        </div>
      </Section>

      <Section title="Arrange">
        <div className="flex gap-1 rounded-lg bg-panel p-[3px]">
          {(
            [
              ["center", "Centre", () => ed()?.center()],
              ["flip", "Mirror", () => ed()?.flip()],
              ["forward", "Bring forward", () => ed()?.forward()],
              ["backward", "Send backward", () => ed()?.backward()],
            ] as const
          ).map(([icon, label, run]) => (
            <button
              key={icon}
              type="button"
              title={label}
              aria-label={label}
              onClick={run}
              className="grid h-8 flex-1 place-items-center rounded-md text-fg/70 transition-colors hover:bg-raise hover:text-fg"
            >
              <Icon name={icon} className="h-[17px] w-[17px]" />
            </button>
          ))}
        </div>
      </Section>
    </div>
  );

  const tabs = TABS.filter((t) => !t.mobileOnly || !desktop).map((t) => ({
    value: t.id,
    label: t.label,
    icon: t.icon,
    dot: t.id === "edit" && !!sel && tab !== "edit",
  }));

  /* ------------------------------- layout ------------------------------- */
  return (
    <div className={`${interTight.variable} studio-grid h-[100dvh] overflow-hidden bg-bg pt-16 font-ui`}>
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

        <div className="pointer-events-none absolute left-0 top-0 p-4 lg:p-6">
          <p className="font-sans text-[clamp(1.15rem,1.8vw,1.6rem)] leading-tight tracking-[-0.02em]">{product.name}</p>
          <p className="mt-0.5 text-[13px] tabular-nums text-dim">
            {product.price != null ? `${formatPrice(product.price)} each` : "Priced on request"}
          </p>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex justify-center p-3 lg:p-6">
          <div className="flex items-center gap-1 rounded-xl border border-line bg-bg/90 p-1 shadow-[0_6px_24px_-12px_rgba(0,0,0,0.35)] backdrop-blur">
            <div className="w-[9.5rem]">
              <Segmented
                small
                label="Preview"
                value={printed ? "printed" : "blank"}
                onChange={(v) => (v === "printed" && printed ? viewerRef.current?.press() : setPrinted(v === "printed"))}
                options={[
                  { value: "blank", label: "Blank" },
                  { value: "printed", label: "Printed" },
                ]}
              />
            </div>
            <span className="mx-0.5 h-5 w-px bg-line" aria-hidden />
            <IconBtn icon="rotate" label="Auto-rotate" active={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
            <IconBtn icon="reset" label="Reset view" onClick={() => viewerRef.current?.resetView()} />
            <IconBtn icon="camera" label="Save a 3D image" onClick={save3D} />
          </div>
        </div>

        {/* Phones: switch the preview between 3D and the print area */}
        <div className="absolute right-3 top-3 z-30 rounded-xl border border-line bg-bg/90 p-1 backdrop-blur lg:hidden">
          <Segmented
            small
            label="View"
            value={view}
            onChange={setView}
            options={[
              { value: "3d", label: "3D", icon: "cube" },
              { value: "print", label: "Print area", icon: "frame" },
            ]}
          />
        </div>

        {!ready && <div className="absolute inset-0 grid place-items-center text-[13px] text-dim">Loading studio…</div>}
      </section>

      {/* Left column: tools */}
      <div className="sa-left lg:border-r lg:border-line">
        <div className="sa-tabs border-b border-line bg-bg p-3 lg:px-5 lg:pb-4 lg:pt-5">
          <Segmented label="Studio tools" value={tab} onChange={setTab} options={tabs} />
        </div>
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
          <div className="mb-2 flex min-h-8 items-center justify-between gap-2 pr-[12.5rem] lg:mb-3 lg:pr-0">
            <h3 className="hidden text-[13px] font-medium lg:block">Print area</h3>
            <div className="-mr-1.5 flex">
              <IconBtn icon="undo" label="Undo (Ctrl+Z)" disabled={!hist.undo} onClick={() => void ed()?.undo()} />
              <IconBtn icon="redo" label="Redo (Ctrl+Shift+Z)" disabled={!hist.redo} onClick={() => void ed()?.redo()} />
            </div>
          </div>
          {/* The padding lives on this wrapper: the editor fits the canvas to the inner frame. */}
          <div className="relative flex min-h-0 flex-1 lg:h-[30vh] lg:flex-none lg:rounded-lg lg:bg-panel lg:p-4">
          <div
            ref={frameRef}
            className="relative flex min-h-0 flex-1 items-center justify-center"
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
              className={`relative shadow-[0_0_0_1px_var(--line),0_10px_30px_-16px_rgba(0,0,0,0.4)] ${transparent ? "" : "checker"}`}
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
              <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-lg border-2 border-dashed border-fg bg-bg/85 text-[13px] font-medium">
                Drop photos to add them
              </div>
            )}
          </div>
          </div>
          <p className="mt-2.5 hidden text-[12px] leading-snug text-dim lg:block">Keep names and faces inside the dashed line.</p>
        </section>

        <div className={`sa-panel thin-scroll min-h-0 overflow-y-auto p-4 lg:flex-1 lg:p-5 ${!desktop && tab !== "edit" ? "hidden" : ""}`}>
          {inspector}
        </div>

        <section className="sa-order border-t border-line bg-bg px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:p-5" aria-label="Order">
          <div className="flex items-center gap-3 lg:justify-between">
            <span className="hidden text-[13px] font-medium lg:block">Quantity</span>
            <div className="flex h-9 shrink-0 items-center rounded-lg border border-line bg-raise">
              <button
                type="button"
                aria-label="Fewer"
                disabled={qty <= 1}
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-full w-9 place-items-center text-fg/70 hover:text-fg disabled:opacity-30"
              >
                <Icon name="minus" className="h-4 w-4" />
              </button>
              <input
                aria-label="Quantity"
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                className="h-full w-10 border-x border-line bg-transparent text-center text-[14px] font-medium tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                aria-label="More"
                onClick={() => setQty((q) => q + 1)}
                className="grid h-full w-9 place-items-center text-fg/70 hover:text-fg"
              >
                <Icon name="add" className="h-4 w-4" />
              </button>
            </div>
            <div className="min-w-0 flex-1 text-right lg:hidden">
              <p className="font-sans text-[20px] leading-none tracking-[-0.02em] tabular-nums">{total != null ? `R${total}` : "Quote"}</p>
              <p className="mt-1 truncate text-[11px] text-dim">{product.price != null ? "Estimate" : "Priced on WhatsApp"}</p>
            </div>
            <button
              type="button"
              onClick={orderOnWhatsApp}
              disabled={!ready}
              className="flex h-10 shrink-0 items-center gap-2 rounded-lg bg-fg px-4 text-[14px] font-medium text-bg transition-opacity hover:opacity-85 disabled:opacity-40 lg:hidden"
            >
              Order
              <Icon name="send" className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 hidden items-end justify-between gap-3 border-t border-line pt-4 lg:flex">
            <div>
              <p className="text-[12px] text-dim">{product.price != null ? "Estimated total" : "Price"}</p>
              <p className="mt-0.5 font-sans text-[28px] leading-none tracking-[-0.03em] tabular-nums">{total != null ? `R${total}` : "On request"}</p>
            </div>
            <p className="pb-0.5 text-[12px] text-dim">{product.price != null ? `${formatPrice(product.price)} each` : "Quoted on WhatsApp"}</p>
          </div>
          <button type="button" onClick={orderOnWhatsApp} disabled={!ready} className={`${BTN_PRIMARY} mt-4 hidden h-11 lg:flex`}>
            Order on WhatsApp
            <Icon name="send" className="h-4 w-4" />
          </button>
          <div className="mt-3 hidden items-start justify-between gap-4 lg:flex">
            <p className="text-[12px] leading-snug text-dim">We confirm the price and check your design before printing.</p>
            <button
              type="button"
              onClick={() => ed() && download(ed()!.exportPNG(), `authentic-${product.id}-design.png`)}
              disabled={!ready}
              className="flex shrink-0 items-center gap-1.5 text-[12px] font-medium text-dim transition-colors hover:text-fg"
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
        <div
          role="status"
          className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-fg px-4 py-2.5 text-[13px] font-medium text-bg shadow-lg lg:bottom-6"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

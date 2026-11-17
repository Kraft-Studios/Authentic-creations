import { ActiveSelection, Canvas, Circle, FabricImage, FabricObject, Path, Point, Textbox } from "fabric";
import type { Product } from "@/lib/products";
import type { FontSet } from "./fonts";

/* Sticker artwork (24 × 24 viewBox paths). */
export const STICKERS = {
  heart:
    "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  sparkle: "M12 0C13 7 17 11 24 12C17 13 13 17 12 24C11 17 7 13 0 12C7 11 11 7 12 0Z",
  crown: "M2 19h20v3H2zM2 6l5 5 5-8 5 8 5-5-2 11H4z",
  bolt: "M13 2L3 14h7l-1 8 10-12h-7l1-8z",
  circle: "M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20z",
} as const;
export type StickerKind = keyof typeof STICKERS;

export type TemplateId = "mom" | "name" | "company" | "birthday";

export type Selection =
  | null
  | { kind: "text"; text: string; fontFamily: string; fill: string; fontSize: number; opacity: number; textAlign: string; bold: boolean }
  | { kind: "image"; opacity: number }
  | { kind: "shape"; fill: string; opacity: number }
  | { kind: "multi"; count: number };

export interface EditorEvents {
  onRender: () => void;
  /** `byUser` is true when the customer tapped or clicked to select. */
  onSelection: (s: Selection, byUser: boolean) => void;
  onHistory: (canUndo: boolean, canRedo: boolean) => void;
  onFit: (cssW: number, cssH: number) => void;
  /** The print-area pixel size changed (new product) — rebuild the 3D texture. */
  onResize: () => void;
  onObjects: (objects: number, images: number) => void;
}

const ACCENT = "#ff3d8b";
/** Selection handles: black & white, like the site. */
const UI = "#111111";

/**
 * The 2D print-area editor (Fabric.js). Its canvas element doubles as the
 * texture on the 3D product, so every change shows up in 3D straight away.
 */
export class DesignEditor {
  readonly canvas: Canvas;
  private host: HTMLElement;
  private frame: HTMLElement;
  private product: Product;
  private ev: EditorEvents;
  private fonts: FontSet;
  private ratio = 1;
  private history: string[] = [];
  private index = -1;
  private restoring = false;
  private histTimer = 0;
  /** Designs the customer actually edited, per product, with the size they were made at. */
  private designs = new Map<string, { json: Record<string, unknown>; w: number; h: number }>();
  private edited = new Set<string>();
  private lastEdited: string | null = null;
  private ro: ResizeObserver;
  private blobUrls: string[] = [];
  /** The "YOUR DESIGN" starter text; it goes away when the customer adds something. */
  private placeholder: FabricObject | null = null;
  private disposed = false;

  constructor(host: HTMLElement, frame: HTMLElement, product: Product, ev: EditorEvents, fonts: FontSet) {
    this.host = host;
    this.frame = frame;
    this.product = product;
    this.ev = ev;
    this.fonts = fonts;

    const el = document.createElement("canvas");
    host.appendChild(el);
    this.canvas = new Canvas(el, {
      width: product.canvas.w,
      height: product.canvas.h,
      backgroundColor: product.canvas.transparent ? "" : "#ffffff",
      preserveObjectStacking: true,
      enableRetinaScaling: false,
      selectionColor: "rgba(17,17,17,0.06)",
      selectionBorderColor: UI,
      selectionLineWidth: 2,
      controlsAboveOverlay: true,
      stopContextMenu: true,
    });

    const c = this.canvas;
    c.on("after:render", () => this.ev.onRender());
    const sel = (opt: { e?: Event }) => this.emitSelection(!!opt?.e);
    c.on("selection:created", sel);
    c.on("selection:updated", sel);
    c.on("selection:cleared", sel);
    c.on("object:added", (e) => {
      this.styleObject(e.target);
      this.changed();
    });
    c.on("object:removed", () => this.changed());
    c.on("object:modified", () => {
      this.changed();
      this.emitSelection();
    });
    c.on("text:changed", () => {
      this.changed();
      this.emitSelection();
    });

    this.ro = new ResizeObserver(() => this.fit());
    this.ro.observe(frame);
    this.fit();
  }

  /* ---------------------------- sizing ---------------------------- */
  get size() {
    return { w: this.canvas.width, h: this.canvas.height };
  }

  get background() {
    return typeof this.canvas.backgroundColor === "string" ? this.canvas.backgroundColor : "";
  }

  fit() {
    if (this.disposed) return;
    const r = this.frame.getBoundingClientRect();
    const { w, h } = this.size;
    const s = Math.min(Math.max(r.width, 40) / w, Math.max(r.height, 40) / h);
    const cssW = Math.max(1, Math.floor(w * s));
    const cssH = Math.max(1, Math.floor(h * s));
    this.canvas.setDimensions({ width: `${cssW}px`, height: `${cssH}px` }, { cssOnly: true });
    this.ratio = w / cssW;
    this.canvas.getObjects().forEach((o) => this.styleObject(o));
    this.canvas.calcOffset();
    this.canvas.requestRenderAll();
    this.ev.onFit(cssW, cssH);
  }

  /** Handles stay a comfortable size on screen even though the canvas is high-res. */
  private styleObject(o: FabricObject) {
    const r = this.ratio;
    o.set({
      cornerStyle: "circle",
      cornerColor: "#ffffff",
      cornerStrokeColor: UI,
      borderColor: UI,
      transparentCorners: false,
      cornerSize: 13 * r,
      touchCornerSize: 30 * r,
      borderScaleFactor: 1.5 * r,
      padding: 4 * r,
    });
    const mtr = o.controls?.mtr;
    if (mtr) mtr.offsetY = -32 * r;
  }

  /* --------------------------- events ----------------------------- */
  private emitSelection(byUser = false) {
    const o = this.canvas.getActiveObject();
    if (!o) return this.ev.onSelection(null, byUser);
    if (o instanceof ActiveSelection) return this.ev.onSelection({ kind: "multi", count: o.size() }, byUser);
    if (o instanceof Textbox) {
      return this.ev.onSelection({
        kind: "text",
        text: o.text ?? "",
        fontFamily: o.fontFamily ?? "",
        fill: typeof o.fill === "string" ? o.fill : "#111111",
        fontSize: o.fontSize ?? 60,
        opacity: o.opacity ?? 1,
        textAlign: o.textAlign ?? "center",
        bold: o.fontWeight === "bold" || Number(o.fontWeight) >= 600,
      }, byUser);
    }
    if (o instanceof FabricImage) return this.ev.onSelection({ kind: "image", opacity: o.opacity ?? 1 }, byUser);
    return this.ev.onSelection({ kind: "shape", fill: typeof o.fill === "string" ? o.fill : "#111111", opacity: o.opacity ?? 1 }, byUser);
  }

  private emitObjects() {
    const objs = this.canvas.getObjects();
    this.ev.onObjects(objs.length, objs.filter((o) => o instanceof FabricImage).length);
  }

  private emitHistory() {
    this.ev.onHistory(this.index > 0, this.index < this.history.length - 1);
  }

  private changed() {
    if (this.restoring) return;
    this.edited.add(this.product.id);
    this.lastEdited = this.product.id;
    this.emitObjects();
    window.clearTimeout(this.histTimer);
    this.histTimer = window.setTimeout(() => this.pushHistory(), 250);
  }

  /* --------------------------- history ---------------------------- */
  private pushHistory() {
    if (this.disposed) return;
    const snap = JSON.stringify(this.canvas.toObject());
    if (this.history[this.index] === snap) return;
    this.history = this.history.slice(0, this.index + 1);
    this.history.push(snap);
    if (this.history.length > 40) this.history.shift();
    this.index = this.history.length - 1;
    this.emitHistory();
  }

  private async restore(json: string | Record<string, unknown>) {
    window.clearTimeout(this.histTimer);
    this.restoring = true;
    await this.canvas.loadFromJSON(json);
    this.canvas.getObjects().forEach((o) => this.styleObject(o));
    this.canvas.requestRenderAll();
    this.restoring = false;
    this.emitHistory();
    this.emitSelection();
    this.emitObjects();
  }

  async undo() {
    if (this.index <= 0) return;
    this.index--;
    await this.restore(this.history[this.index]);
  }

  async redo() {
    if (this.index >= this.history.length - 1) return;
    this.index++;
    await this.restore(this.history[this.index]);
  }

  /* -------------------------- adding things ------------------------ */
  private place(o: FabricObject, at?: { x: number; y: number }) {
    if (this.placeholder && this.canvas.getObjects().includes(this.placeholder)) this.canvas.remove(this.placeholder);
    this.placeholder = null;
    const { w, h } = this.size;
    o.set({ originX: "center", originY: "center", left: at?.x ?? w / 2, top: at?.y ?? h / 2 });
    this.canvas.add(o);
    this.canvas.setActiveObject(o);
    this.canvas.requestRenderAll();
    return o;
  }

  private async prepareImage(file: File): Promise<string> {
    const MAX = 2400;
    const keep = (blob: Blob) => {
      const u = URL.createObjectURL(blob);
      this.blobUrls.push(u);
      return u;
    };
    try {
      const bmp = await createImageBitmap(file);
      const k = Math.min(1, MAX / Math.max(bmp.width, bmp.height));
      if (k === 1 && file.size < 5_000_000) {
        bmp.close();
        return keep(file);
      }
      const cv = document.createElement("canvas");
      cv.width = Math.round(bmp.width * k);
      cv.height = Math.round(bmp.height * k);
      cv.getContext("2d")!.drawImage(bmp, 0, 0, cv.width, cv.height);
      bmp.close();
      const type = file.type === "image/png" || file.type === "image/webp" ? "image/png" : "image/jpeg";
      const blob = await new Promise<Blob>((res, rej) => cv.toBlob((b) => (b ? res(b) : rej(new Error("toBlob"))), type, 0.92));
      return keep(blob);
    } catch {
      return keep(file);
    }
  }

  async addImageFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const url = await this.prepareImage(file);
    const img = await FabricImage.fromURL(url);
    const { w, h } = this.size;
    img.scale(Math.min((w * 0.8) / img.width, (h * 0.8) / img.height));
    this.place(img);
  }

  addText(text = "Your text", opts: { fontFamily?: string; fill?: string; size?: number; x?: number; y?: number; bold?: boolean } = {}) {
    const { w, h } = this.size;
    const t = new Textbox(text, {
      fontFamily: opts.fontFamily ?? this.fonts.display,
      fill: opts.fill ?? "#111111",
      fontSize: opts.size ?? Math.round(Math.min(h * 0.2, w * 0.14)),
      fontWeight: opts.bold ? "bold" : "normal",
      textAlign: "center",
      width: w * 0.8,
      lineHeight: 0.95,
    });
    return this.place(t, opts.x != null && opts.y != null ? { x: opts.x, y: opts.y } : undefined);
  }

  addSticker(kind: StickerKind, fill = ACCENT, opts: { size?: number; x?: number; y?: number; angle?: number } = {}) {
    const { w, h } = this.size;
    const size = opts.size ?? Math.min(w, h) * 0.3;
    const o: FabricObject =
      kind === "circle" ? new Circle({ radius: size / 2, fill }) : new Path(STICKERS[kind], { fill });
    if (kind !== "circle") o.scale(size / Math.max(o.width, o.height));
    if (opts.angle) o.set({ angle: opts.angle });
    return this.place(o, opts.x != null && opts.y != null ? { x: opts.x, y: opts.y } : undefined);
  }

  setBackground(color: string) {
    this.canvas.backgroundColor = color;
    this.canvas.requestRenderAll();
    this.changed();
  }

  /* --------------------------- editing ----------------------------- */
  hasSelection() {
    return !!this.canvas.getActiveObject();
  }

  isEditingText() {
    const o = this.canvas.getActiveObject();
    return o instanceof Textbox && o.isEditing;
  }

  updateActive(props: Record<string, unknown>) {
    const o = this.canvas.getActiveObject();
    if (!o) return;
    const targets = o instanceof ActiveSelection ? o.getObjects() : [o];
    targets.forEach((t) => {
      t.set(props);
      if (t instanceof Textbox) t.initDimensions();
      t.setCoords();
    });
    o.setCoords();
    this.canvas.requestRenderAll();
    this.changed();
    this.emitSelection();
  }

  remove() {
    const objs = this.canvas.getActiveObjects();
    if (!objs.length) return;
    this.canvas.discardActiveObject();
    this.canvas.remove(...objs);
    this.canvas.requestRenderAll();
  }

  async duplicate() {
    const objs = this.canvas.getActiveObjects();
    if (!objs.length) return;
    this.canvas.discardActiveObject();
    const clones = await Promise.all(objs.map((o) => o.clone()));
    const dx = this.size.w * 0.03;
    const dy = this.size.h * 0.04;
    clones.forEach((c) => {
      c.set({ left: (c.left ?? 0) + dx, top: (c.top ?? 0) + dy });
      this.canvas.add(c);
    });
    this.canvas.setActiveObject(clones.length === 1 ? clones[0] : new ActiveSelection(clones, { canvas: this.canvas }));
    this.canvas.requestRenderAll();
  }

  private withActive(fn: (o: FabricObject) => void) {
    const o = this.canvas.getActiveObject();
    if (!o) return;
    fn(o);
    o.setCoords();
    this.canvas.requestRenderAll();
    this.changed();
  }

  forward() {
    this.withActive((o) => this.canvas.bringObjectForward(o));
  }
  backward() {
    this.withActive((o) => this.canvas.sendObjectBackwards(o));
  }
  center() {
    this.withActive((o) => this.canvas.centerObject(o));
  }
  flip() {
    this.withActive((o) => o.set("flipX", !o.flipX));
  }

  /** Scale the selected item to cover (or fit inside) the whole print area. */
  fillArea(mode: "cover" | "contain") {
    this.withActive((o) => {
      if (o instanceof ActiveSelection) return;
      const { w, h } = this.size;
      const s = mode === "cover" ? Math.max(w / o.width, h / o.height) : Math.min(w / o.width, h / o.height);
      o.set({ scaleX: s, scaleY: s, angle: 0 });
      o.setPositionByOrigin(new Point(w / 2, h / 2), "center", "center");
    });
  }

  /** Arrange every photo into a tight grid that fills the print area. */
  collage() {
    const imgs = this.canvas.getObjects().filter((o): o is FabricImage => o instanceof FabricImage);
    if (!imgs.length) return false;
    const { w, h } = this.size;
    const n = imgs.length;
    let best = { cols: 1, rows: n, score: Infinity };
    for (let cols = 1; cols <= n; cols++) {
      const rows = Math.ceil(n / cols);
      const score = Math.abs(Math.log(w / cols / (h / rows))) + (cols * rows - n) * 0.4;
      if (score < best.score) best = { cols, rows, score };
    }
    const { cols, rows } = best;
    const ch = h / rows;
    this.canvas.discardActiveObject();
    imgs.forEach((img, i) => {
      const r = Math.floor(i / cols);
      const inRow = r === rows - 1 ? n - cols * (rows - 1) : cols;
      const cw = w / inRow;
      const c = i - r * cols;
      const { width: iw, height: ih } = img.getOriginalSize();
      const s = Math.max(cw / iw, ch / ih);
      const cropW = cw / s;
      const cropH = ch / s;
      img.set({
        cropX: (iw - cropW) / 2,
        cropY: (ih - cropH) / 2,
        width: cropW,
        height: cropH,
        scaleX: s,
        scaleY: s,
        angle: 0,
        flipX: false,
      });
      img.setPositionByOrigin(new Point(c * cw + cw / 2, r * ch + ch / 2), "center", "center");
      img.setCoords();
    });
    [...imgs].reverse().forEach((img) => this.canvas.sendObjectToBack(img));
    this.canvas.requestRenderAll();
    this.changed();
    return true;
  }

  /** Replace text and stickers with a ready-made layout; photos are kept. */
  applyTemplate(id: TemplateId) {
    const { w, h } = this.size;
    const m = Math.min(w, h);
    const keepTransparent = !!this.product.canvas.transparent;
    this.canvas.discardActiveObject();
    this.canvas
      .getObjects()
      .filter((o) => !(o instanceof FabricImage))
      .forEach((o) => this.canvas.remove(o));

    const bg = (c: string) => {
      if (!keepTransparent) this.canvas.backgroundColor = c;
    };
    const F = this.fonts;
    switch (id) {
      case "mom":
        bg("#ffe3ee");
        this.addSticker("heart", ACCENT, { size: m * 0.2, x: w * 0.14, y: h * 0.2, angle: -14 });
        this.addSticker("heart", "#ff8fbf", { size: m * 0.14, x: w * 0.86, y: h * 0.78, angle: 12 });
        this.addText("BEST MOM\nEVER", { fontFamily: F.display, fill: "#111111", size: m * 0.26, x: w / 2, y: h * 0.44 });
        this.addText("love, the kids", { fontFamily: F.script, fill: ACCENT, size: m * 0.1, x: w / 2, y: h * 0.8 });
        break;
      case "name":
        bg("#ffffff");
        this.addText("Your Name", { fontFamily: F.script, fill: "#111111", size: m * 0.3, x: w / 2, y: h * 0.45 });
        this.addText("E S T .  2 0 2 6", { fontFamily: F.body, fill: "#666666", size: m * 0.06, x: w / 2, y: h * 0.75, bold: true });
        break;
      case "company":
        bg("#0b0b0b");
        this.addSticker("circle", "#ff3d8b", { size: m * 0.32, x: w / 2, y: h * 0.3 });
        this.addText("LOGO", { fontFamily: F.display, fill: "#0b0b0b", size: m * 0.09, x: w / 2, y: h * 0.3 });
        this.addText("COMPANY NAME", { fontFamily: F.display, fill: "#ffffff", size: m * 0.14, x: w / 2, y: h * 0.62 });
        this.addText("yourbusiness.co.za", { fontFamily: F.body, fill: "#9a9a9a", size: m * 0.055, x: w / 2, y: h * 0.8 });
        break;
      case "birthday":
        bg("#ffd60a");
        this.addSticker("sparkle", "#111111", { size: m * 0.16, x: w * 0.15, y: h * 0.22 });
        this.addSticker("sparkle", ACCENT, { size: m * 0.11, x: w * 0.85, y: h * 0.75 });
        this.addSticker("star", "#1fc8ff", { size: m * 0.1, x: w * 0.82, y: h * 0.2, angle: 18 });
        this.addText("HAPPY\nBIRTHDAY", { fontFamily: F.display, fill: "#111111", size: m * 0.25, x: w / 2, y: h * 0.45 });
        this.addText("Thandi", { fontFamily: F.script, fill: ACCENT, size: m * 0.11, x: w / 2, y: h * 0.82 });
        break;
    }
    this.canvas.discardActiveObject();
    this.canvas.requestRenderAll();
    this.changed();
  }

  /** First-load design so the 3D preview isn't blank. */
  starter() {
    const { w, h } = this.size;
    const m = Math.min(w, h);
    this.restoring = true;
    // A quiet placeholder: the customer's own photos and text replace it.
    this.placeholder = this.addText("YOUR\nDESIGN", { fontFamily: this.fonts.display, fill: "#111111", size: m * 0.27, x: w / 2, y: h * 0.5 });
    this.canvas.discardActiveObject();
    this.restoring = false;
    this.history = [];
    this.index = -1;
    this.pushHistory();
    this.emitObjects();
    this.canvas.requestRenderAll();
  }

  /* ------------------------ product switching ---------------------- */
  async switchProduct(next: Product) {
    if (next.id === this.product.id) return;
    window.clearTimeout(this.histTimer);
    this.canvas.discardActiveObject();
    const current = { json: this.canvas.toObject(), ...this.size };
    if (this.edited.has(this.product.id)) this.designs.set(this.product.id, current);

    // Products the customer already edited keep their own design. Anything else
    // gets a copy of the most recently edited design (never a copy of a copy, so
    // nothing shrinks as you click through products).
    const own = this.edited.has(next.id) ? this.designs.get(next.id) : undefined;
    const source = own ?? (this.lastEdited ? this.designs.get(this.lastEdited) : undefined) ?? current;

    this.product = next;
    this.restoring = true;
    this.canvas.setDimensions({ width: next.canvas.w, height: next.canvas.h }, { backstoreOnly: true });
    await this.canvas.loadFromJSON(source.json);
    // Loading makes new objects: find the starter text again if it's still untouched.
    if (this.placeholder) {
      this.placeholder = this.canvas.getObjects().find((o) => o instanceof Textbox && o.text === "YOUR\nDESIGN") ?? null;
    }

    if (!own) {
      // Scale the copied design to the new print area.
      const s = Math.min(next.canvas.w / source.w, next.canvas.h / source.h);
      this.canvas.getObjects().forEach((o) => {
        const c = o.getCenterPoint();
        o.set({ scaleX: (o.scaleX ?? 1) * s, scaleY: (o.scaleY ?? 1) * s });
        o.setPositionByOrigin(new Point((c.x / source.w) * next.canvas.w, (c.y / source.h) * next.canvas.h), "center", "center");
        o.setCoords();
      });
      if (next.canvas.transparent) this.canvas.backgroundColor = "";
      else if (!this.background) this.canvas.backgroundColor = "#ffffff";
    }
    this.restoring = false;
    this.history = [];
    this.index = -1;
    this.pushHistory();
    this.ev.onResize();
    this.fit();
    this.emitSelection();
    this.emitObjects();
  }

  /* ---------------------------- export ----------------------------- */
  exportPNG() {
    const active = this.canvas.getActiveObject();
    this.canvas.discardActiveObject();
    this.canvas.renderAll();
    const url = this.canvas.toDataURL({ format: "png", multiplier: 1, quality: 1 });
    if (active) this.canvas.setActiveObject(active);
    this.canvas.requestRenderAll();
    return url;
  }

  dispose() {
    this.disposed = true;
    window.clearTimeout(this.histTimer);
    this.ro.disconnect();
    // Remove only this editor's own elements: a new editor may already be
    // living in the same host by the time the async dispose finishes.
    const el = this.canvas.getElement();
    const container = el.parentElement !== this.host ? el.parentElement : null;
    void this.canvas.dispose().finally(() => {
      container?.remove();
      el.remove();
    });
    this.blobUrls.forEach((u) => URL.revokeObjectURL(u));
  }
}

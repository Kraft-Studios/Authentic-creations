import * as THREE from "three";
import type { ProductId } from "@/lib/products";
import { getProduct } from "@/lib/products";

/** Sample artwork used to show the products "printed" on the home page. */
interface Spec {
  bg?: [string, string];
  words: string[];
  ink: string;
  mark?: boolean;
}

const SPECS: Record<ProductId, Spec> = {
  mug: { bg: ["#ff3d8b", "#ffd60a"], words: ["MOM'S", "COFFEE"], ink: "#0a0a0a" },
  tumbler: { bg: ["#1fc8ff", "#ff3d8b"], words: ["STAY", "COOL"], ink: "#ffffff" },
  bottle: { bg: ["#ffd60a", "#1fc8ff"], words: ["DRINK", "UP"], ink: "#0a0a0a" },
  mousepad: { bg: ["#ff5a1f", "#ff3d8b"], words: ["WORK", "MODE"], ink: "#0a0a0a" },
  keyholder: { bg: ["#ffffff", "#ffd60a"], words: [], ink: "#0a0a0a", mark: true },
  tshirt: { words: ["TEAM", "25"], ink: "#ff3d8b" },
  box: { bg: ["#0a0a0a", "#1f3a8a"], words: ["THANK", "YOU"], ink: "#ffffff" },
};

function drawMark(ctx: CanvasRenderingContext2D, cx: number, cy: number, h: number, color: string) {
  // Same proportions as <LogoMark/> (viewBox 322 x 150)
  const s = h / 150;
  const x0 = cx - (322 * s) / 2;
  const y0 = cy - h / 2;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x0 + 75 * s, y0 + 75 * s, 73 * s, 0, Math.PI * 2);
  ctx.arc(x0 + 78 * s, y0 + 77 * s, 36 * s, 0, Math.PI * 2, true);
  ctx.fill("evenodd");
  ctx.fillRect(x0 + 121 * s, y0, 37 * s, 150 * s);
  ctx.fillRect(x0 + 184 * s, y0 + s, 138 * s, 148 * s);
}

export function drawPoster(ctx: CanvasRenderingContext2D, kind: ProductId, w: number, h: number, display: string, body: string) {
  const spec = SPECS[kind];
  ctx.clearRect(0, 0, w, h);

  if (spec.bg) {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, spec.bg[0]);
    g.addColorStop(1, spec.bg[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // halftone dots
    const step = Math.max(14, Math.round(Math.min(w, h) / 26));
    for (let y = step / 2; y < h; y += step) {
      for (let x = step / 2; x < w; x += step) {
        const t = (x / w) * 0.7 + (y / h) * 0.3;
        const r = step * 0.42 * Math.max(0, 1 - t * 1.1);
        if (r < 0.6) continue;
        ctx.fillStyle = "rgba(255,255,255,0.22)";
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  if (spec.mark) {
    drawMark(ctx, w / 2, h / 2, h * 0.34, spec.ink);
  }

  if (spec.words.length) {
    const longest = Math.max(...spec.words.map((s) => s.length));
    const size = Math.min((h * 0.78) / spec.words.length, (w * 0.86) / (longest * 0.48));
    ctx.fillStyle = spec.ink;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${size}px ${display}`;
    const total = size * 0.92 * spec.words.length;
    spec.words.forEach((word, i) => {
      ctx.fillText(word, w / 2, h / 2 - total / 2 + size * 0.92 * (i + 0.5));
    });
  }

  ctx.font = `600 ${Math.round(Math.min(w, h) * 0.045)}px ${body}`;
  ctx.fillStyle = spec.ink;
  ctx.globalAlpha = 0.75;
  ctx.textAlign = "center";
  ctx.fillText("authentic creations", w / 2, h - Math.min(w, h) * 0.07);
  ctx.globalAlpha = 1;
}

export function makePosterTexture(kind: ProductId, display: string, body: string, scale = 0.5) {
  const p = getProduct(kind);
  const w = Math.round(p.canvas.w * scale);
  const h = Math.round(p.canvas.h * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const paint = () => {
    drawPoster(ctx, kind, w, h, display, body);
    tex.needsUpdate = true;
  };
  paint();
  // Repaint once web fonts are ready so the lettering uses Anton.
  if (typeof document !== "undefined" && document.fonts) {
    Promise.all([document.fonts.load(`80px ${display}`), document.fonts.load(`600 20px ${body}`)])
      .then(paint)
      .catch(() => {});
  }
  return tex;
}

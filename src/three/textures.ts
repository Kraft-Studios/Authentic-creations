import * as THREE from "three";

/* Procedural surface textures (generated once in the browser, nothing downloaded). */

function rand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Tileable value noise grid, sampled with smooth interpolation. */
function valueNoise(size: number, cells: number, seed: number) {
  const r = rand(seed);
  const g = Array.from({ length: cells * cells }, () => r());
  return (x: number, y: number) => {
    const fx = (x / size) * cells;
    const fy = (y / size) * cells;
    const x0 = Math.floor(fx);
    const y0 = Math.floor(fy);
    const tx = fx - x0;
    const ty = fy - y0;
    const sx = tx * tx * (3 - 2 * tx);
    const sy = ty * ty * (3 - 2 * ty);
    const at = (i: number, j: number) => g[(((j % cells) + cells) % cells) * cells + (((i % cells) + cells) % cells)];
    const a = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * sx;
    const b = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * sx;
    return a + (b - a) * sy;
  };
}

function canvasTexture(size: number, draw: (img: ImageData) => void, color = false, repeat = 1) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  draw(img);
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Converts a height function into a tangent-space normal map. */
function normalFromHeight(size: number, height: (x: number, y: number) => number, strength: number, repeat: number) {
  const h = new Float32Array(size * size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) h[y * size + x] = height(x, y);
  const at = (x: number, y: number) => h[((y + size) % size) * size + ((x + size) % size)];
  return canvasTexture(
    size,
    (img) => {
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const dx = (at(x + 1, y) - at(x - 1, y)) * strength;
          const dy = (at(x, y + 1) - at(x, y - 1)) * strength;
          const len = Math.hypot(dx, dy, 1);
          const i = (y * size + x) * 4;
          img.data[i] = ((-dx / len) * 0.5 + 0.5) * 255;
          img.data[i + 1] = ((dy / len) * 0.5 + 0.5) * 255;
          img.data[i + 2] = ((1 / len) * 0.5 + 0.5) * 255;
          img.data[i + 3] = 255;
        }
      }
    },
    false,
    repeat,
  );
}

const cache = new Map<string, THREE.Texture>();
function cached(key: string, make: () => THREE.Texture) {
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key)!;
}

/** Cotton jersey knit — small interlocking "V" loops. */
export const knitNormal = () =>
  cached("knit", () => {
    const size = 128;
    const n = valueNoise(size, 32, 7);
    return normalFromHeight(
      size,
      (x, y) => {
        const u = (x / size) * 16;
        const v = (y / size) * 22;
        const row = Math.abs(((v % 1) + 1) % 1 - 0.5);
        const loop = Math.abs(Math.sin(Math.PI * (u + (Math.floor(u) % 2 ? row : -row))));
        return loop * 0.8 + n(x, y) * 0.25;
      },
      2.2,
      14,
    );
  });

/** Polyester mousepad weave. */
export const weaveNormal = () =>
  cached("weave", () => {
    const size = 128;
    const n = valueNoise(size, 64, 3);
    return normalFromHeight(
      size,
      (x, y) => {
        const a = Math.sin((x / size) * Math.PI * 2 * 32) * 0.5 + 0.5;
        const b = Math.sin((y / size) * Math.PI * 2 * 32) * 0.5 + 0.5;
        return a * b * 0.6 + n(x, y) * 0.4;
      },
      1.2,
      10,
    );
  });

/** Rubber base — fine pebbled noise. */
export const rubberNormal = () =>
  cached("rubber", () => {
    const size = 128;
    const n = valueNoise(size, 48, 11);
    return normalFromHeight(size, (x, y) => n(x, y), 3, 8);
  });

/** Brushed steel — long horizontal streaks. */
export const brushedNormal = () =>
  cached("brushed", () => {
    const size = 256;
    const n = valueNoise(size, 128, 5);
    return normalFromHeight(size, (x, y) => n(x * 0.02, y) * 0.6 + n(x * 0.05, y * 2) * 0.4, 1.6, 2);
  });

/** Kraft cardboard colour with fibres and blotches. */
export const kraftMap = (base: string) =>
  cached(`kraft-${base}`, () => {
    const size = 256;
    const col = new THREE.Color(base);
    const n = valueNoise(size, 16, 21);
    const f = valueNoise(size, 128, 22);
    const r = rand(9);
    return canvasTexture(
      size,
      (img) => {
        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            const fiber = f(x * 0.25, y) * 0.5 + f(x, y * 0.25) * 0.5;
            const k = 0.9 + n(x, y) * 0.14 + (fiber - 0.5) * 0.12 + (r() - 0.5) * 0.05;
            const i = (y * size + x) * 4;
            img.data[i] = Math.min(255, col.r * 255 * k);
            img.data[i + 1] = Math.min(255, col.g * 255 * k);
            img.data[i + 2] = Math.min(255, col.b * 255 * k);
            img.data[i + 3] = 255;
          }
        }
      },
      true,
      2,
    );
  });

/** Paper / board surface relief. */
export const paperNormal = () =>
  cached("paper", () => {
    const size = 128;
    const n = valueNoise(size, 64, 31);
    const m = valueNoise(size, 16, 32);
    return normalFromHeight(size, (x, y) => n(x, y) * 0.6 + m(x, y) * 0.4, 1.4, 4);
  });

/** 1x1 rib knit (collar band) — 8 ribs across the tile. */
export const ribNormal = () =>
  cached("rib", () => {
    const size = 64;
    const n = valueNoise(size, 16, 41);
    return normalFromHeight(size, (x, y) => Math.abs(Math.sin((x / size) * Math.PI * 8)) * 0.9 + n(x, y) * 0.1, 3, 1);
  });

/**
 * Faint smudges and handling marks for glossy finishes (used as a roughness map),
 * so reflections break up the way they do on a real product instead of looking CG-perfect.
 */
export const smudgeMap = () =>
  cached("smudge", () => {
    const size = 256;
    const a = valueNoise(size, 5, 51);
    const b = valueNoise(size, 23, 52);
    const c = valueNoise(size, 90, 53);
    return canvasTexture(
      size,
      (img) => {
        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            const v = 0.7 + 0.3 * (a(x, y) * 0.6 + b(x, y) * 0.3 + c(x, y) * 0.1);
            const i = (y * size + x) * 4;
            img.data[i] = img.data[i + 1] = img.data[i + 2] = v * 255;
            img.data[i + 3] = 255;
          }
        }
      },
      false,
      1,
    );
  });

import * as THREE from "three";

/* ------------------------------------------------------------------ */
/* Crew-neck T-shirt, built like a "ghost mannequin" product photo:     */
/* a hollow body with an open neck and hem, separate sleeves, a ribbed  */
/* collar, turned-up hems and soft drape folds.                         */
/*                                                                      */
/* Every vertex carries:                                                */
/*   aFlap  - how free the fabric is to move in the wind (0 = pinned)   */
/*   aEdge  - distance from the nearest hem (draws the stitching)       */
/*   aAlong - distance around the garment (dashes the stitching)        */
/*   color  - baked contact shading (underarms, collar, inside hems)    */
/* ------------------------------------------------------------------ */

/* Body cross-section: a rounded-rectangle "superellipse". */
const N = 3.2;
const EXP = 2 / N;
const NECK_W = 0.27; // half-width of the neck opening
const SHOULDER_X = 0.71;
const NECK_TOP = 1.03; // where the shoulder seam meets the collar
const SHOULDER_Y = 0.86; // shoulder point (tucked just under the sleeve)
const HEM_Y = -1.06;
const CLOSE = 0.42; // how far down the shoulders start rounding over
const HEM_BAND = 0.062; // turned-up hem depth
const LIP = 0.008; // fabric thickness shown at open edges
const UV = 1.16; // knit texture density (matches the print decal)

/* Sleeve placement (right sleeve; the left one is mirrored). */
const S_ANG = -0.56;
const S_DIR = new THREE.Vector3(Math.cos(S_ANG), Math.sin(S_ANG), 0);
const S_UP = new THREE.Vector3(-Math.sin(S_ANG), Math.cos(S_ANG), 0);
const S_ROOT = new THREE.Vector3(0.508, 0.665, 0);
const S_LEN = 0.66;
/** The sleeve top rounds over into the body (a "sleeve cap") over this length. */
const S_CAP = 0.2;

/** Edge distances of the rows that shape the turned-up hems (dense, for the crease and stitching). */
const BAND_ROWS = [0, 0.006, 0.016, 0.028, 0.035, 0.04, 0.045, 0.05, 0.055, 0.06, 0.065, 0.072, 0.083, 0.095];

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const sgn = (x: number) => (x < 0 ? -1 : 1);
const sx = (phi: number) => sgn(Math.sin(phi)) * Math.abs(Math.sin(phi)) ** EXP;
const sz = (phi: number) => sgn(Math.cos(phi)) * Math.abs(Math.cos(phi)) ** EXP;
const halfW = (y: number) => 0.69 + 0.02 * smooth(-1.06, 0.2, y);
const halfD = (y: number) => 0.235 + 0.045 * smooth(-1.0, 0.35, y);
const hemY = (phi: number) => HEM_Y + 0.018 * sx(phi) ** 2;

/** Top of the panel above angle phi: the shoulder seam, or the neckline (front lower than back). */
function topOf(phi: number) {
  const x = Math.abs(sx(phi)) * SHOULDER_X;
  if (x >= NECK_W) {
    const t = (x - NECK_W) / (SHOULDER_X - NECK_W);
    return { y: NECK_TOP - (NECK_TOP - SHOULDER_Y) * t ** 1.15, open: 0 };
  }
  const k = Math.sqrt(1 - (x / NECK_W) ** 2);
  return { y: Math.cos(phi) >= 0 ? NECK_TOP - 0.23 * k : NECK_TOP - 0.05 * k, open: k };
}

/** How much of the body depth is left at height y: 1 = full, 0 = the shoulder seam. */
function closure(phi: number, y: number) {
  const top = topOf(phi);
  const s = clamp01((y - (top.y - CLOSE)) / CLOSE);
  const cTop = 0.62 * top.open;
  const g = Math.sqrt(1 - s * s) * (1 - top.open) + (1 - s * s) * top.open;
  return { c: cTop + (1 - cTop) * g, s, top };
}

/* Arc-length table so columns (and the print) are evenly spaced around the body. */
const ARC_N = 4096;
const ARC = (() => {
  const len = new Float32Array(ARC_N + 1);
  let px = SHOULDER_X * sx(0);
  let pz = 0.28 * sz(0);
  for (let i = 1; i <= ARC_N; i++) {
    const phi = (i / ARC_N) * Math.PI * 2;
    const x = SHOULDER_X * sx(phi);
    const z = 0.28 * sz(phi);
    len[i] = len[i - 1] + Math.hypot(x - px, z - pz);
    px = x;
    pz = z;
  }
  return len;
})();
const PERIM = ARC[ARC_N];

/** Angle at arc length d from the centre front (positive towards +x). */
function phiAtArc(d: number) {
  const t = ((d % PERIM) + PERIM) % PERIM;
  let lo = 0;
  let hi = ARC_N;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (ARC[mid] < t) lo = mid;
    else hi = mid;
  }
  const f = (t - ARC[lo]) / (ARC[hi] - ARC[lo] || 1);
  return ((lo + f) / ARC_N) * Math.PI * 2;
}

/** Outward direction (x, z) of the cross-section at a point. */
function outward(x: number, z: number, w: number, d: number): [number, number] {
  const gx = (sgn(x) * Math.abs(x / w) ** (N - 1)) / w;
  const gz = d > 1e-5 ? (sgn(z) * Math.abs(z / d) ** (N - 1)) / d : 0;
  const l = Math.hypot(gx, gz) || 1;
  return [gx / l, gz / l];
}

/** Hem band: a slightly thicker turned-up band with a soft crease above it. */
const hemBand = (edge: number) =>
  0.0035 * (1 - smooth(HEM_BAND - 0.006, HEM_BAND + 0.002, edge)) - 0.0018 * Math.exp(-(((edge - HEM_BAND - 0.004) / 0.005) ** 2));

/** A point on the body surface (folds included), the same for the body and the print. */
function bodyPoint(phi: number, y: number, out: THREE.Vector3, folds = true) {
  const { c, s } = closure(phi, y);
  const w = halfW(y);
  const d = halfD(y) * c;
  const x = w * sx(phi);
  const z = d * sz(phi);
  out.set(x, y, z);
  if (!folds || d < 1e-4) return out;
  const ax = Math.abs(x);
  const back = Math.cos(phi) < 0 ? 1 : 0;
  let f = 0;
  // ripples that open up towards the hem
  f += (1 - smooth(-1.06, -0.4, y)) * 0.008 * Math.sin(x * 15 + 0.4 + back * 1.7);
  // drape folds running from the underarms towards the waist
  const u = (0.7 - ax) * 0.62 + (0.27 - y) * 0.78;
  const v = (0.7 - ax) * 0.78 - (0.27 - y) * 0.62;
  f += smooth(-0.02, 0.06, u) * (1 - smooth(0.12, 0.5, u)) * Math.exp(-(v * v) / 0.02) * 0.011 * Math.cos(v * 38);
  // soft unevenness, like fabric that isn't stretched tight
  f += 0.004 * Math.sin(x * 4.1 + y * 3.3 + back * 2) * Math.sin(y * 5.7 - x * 2.2);
  f *= 1 - smooth(0.15, 0.75, s);
  f += hemBand(y - hemY(phi));
  const [ox, oz] = outward(x, z, w, d);
  out.x += ox * f;
  out.z += oz * f;
  return out;
}

function bodyFlap(phi: number, y: number) {
  const top = topOf(phi).y;
  const hy = hemY(phi);
  return clamp01((top - y) / (top - hy)) ** 1.6;
}

/** Is a point inside the body? Used to hide the sleeve roots tucked into it. */
function insideBody(x: number, y: number, z: number) {
  const w = halfW(y);
  const xn = Math.abs(x) / w;
  if (xn >= 0.999) return false;
  const a = Math.asin(Math.min(1, xn ** (1 / EXP)));
  const phi = z >= 0 ? sgn(x) * a : Math.PI - sgn(x) * a;
  const { c, top } = closure(phi, y);
  if (y > top.y || y < hemY(phi)) return false;
  return Math.abs(z) < halfD(y) * Math.abs(sz(phi)) * c - 0.003;
}

/* ------------------------------------------------------------------ */

interface Buffers {
  pos: number[];
  uv: number[];
  col: number[];
  flap: number[];
  edge: number[];
  along: number[];
  idx: number[];
}
const buffers = (): Buffers => ({ pos: [], uv: [], col: [], flap: [], edge: [], along: [], idx: [] });

function finish(b: Buffers, seams?: { cols: number; rows: number }) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(b.pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(b.uv, 2));
  g.setAttribute("color", new THREE.Float32BufferAttribute(b.col, 3));
  g.setAttribute("aFlap", new THREE.Float32BufferAttribute(b.flap, 1));
  g.setAttribute("aEdge", new THREE.Float32BufferAttribute(b.edge, 1));
  g.setAttribute("aAlong", new THREE.Float32BufferAttribute(b.along, 1));
  g.setIndex(b.idx);
  g.computeVertexNormals();
  // The first and last columns are the same points (kept apart for clean UVs): share their normals.
  if (seams) {
    const n = g.attributes.normal as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let j = 0; j < seams.rows; j++) {
      const a = j;
      const c = seams.cols * seams.rows + j;
      v.set(n.getX(a) + n.getX(c), n.getY(a) + n.getY(c), n.getZ(a) + n.getZ(c)).normalize();
      n.setXYZ(a, v.x, v.y, v.z);
      n.setXYZ(c, v.x, v.y, v.z);
    }
  }
  return g;
}

/** Column-major grid: `cols + 1` columns of `rows` vertices. */
function gridIndex(b: Buffers, cols: number, rows: number, keep?: (a: number, c: number, d: number) => boolean, flip = false) {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows - 1; j++) {
      const a = i * rows + j;
      const bb = (i + 1) * rows + j;
      const c = (i + 1) * rows + j + 1;
      const d = i * rows + j + 1;
      for (const [p, q, r] of [
        [a, bb, c],
        [a, c, d],
      ]) {
        if (keep && !keep(p, q, r)) continue;
        if (flip) b.idx.push(p, r, q);
        else b.idx.push(p, q, r);
      }
    }
  }
}

function buildBody(cols = 200, nv = 118) {
  const b = buffers();
  const p = new THREE.Vector3();
  const rows = 2 + BAND_ROWS.length + nv;
  for (let i = 0; i <= cols; i++) {
    const along = (i / cols) * PERIM;
    const phi = phiAtArc(along);
    const hy = hemY(phi);
    const top = topOf(phi);
    const h = top.y - hy;
    const flapHem = bodyFlap(phi, hy);
    const push = (x: number, y: number, z: number, edge: number, flap: number, ao: number) => {
      b.pos.push(x, y, z);
      b.uv.push(along * UV, y * UV);
      b.col.push(ao, ao, ao);
      b.flap.push(flap);
      b.edge.push(edge);
      b.along.push(along);
    };

    // Inside of the hem: the folded-up allowance, then the fabric thickness at the edge.
    for (const [ey, ao] of [
      [HEM_BAND * 0.85, 0.62],
      [0, 0.8],
    ] as const) {
      bodyPoint(phi, hy + ey, p, false);
      const d = halfD(hy + ey) * closure(phi, hy + ey).c;
      const [ox, oz] = outward(p.x, p.z, halfW(hy + ey), d);
      push(p.x - ox * LIP, p.y + (ey === 0 ? 0.002 : 0), p.z - oz * LIP, 1, flapHem, ao);
    }

    const ys = BAND_ROWS.map((e) => hy + e);
    for (let k = 1; k <= nv; k++) ys.push(hy + 0.095 + ((h - 0.095) * k) / nv);
    for (const y of ys) {
      bodyPoint(phi, y, p);
      let ao = 1;
      const dx = Math.abs(p.x) - 0.7;
      const dy = y - 0.28;
      ao -= 0.24 * Math.exp(-(dx * dx + dy * dy) / 0.012); // underarm
      if (top.open > 0) ao -= 0.16 * top.open * Math.exp(-(((top.y - y) / 0.05) ** 2)); // under the collar
      ao -= 0.05 * (1 - smooth(0, 0.03, y - hy)); // right at the hem edge
      push(p.x, p.y, p.z, y - hy, bodyFlap(phi, y), ao);
    }
  }
  gridIndex(b, cols, rows);
  return finish(b, { cols, rows });
}

const sleeveA = (l: number) => 0.285 + (0.195 - 0.285) * smooth(0, S_LEN, l) + 0.008 * Math.sin((Math.PI * l) / S_LEN);
const sleeveB = (l: number) => 0.185 + (0.13 - 0.185) * (l / S_LEN);

function sleevePoint(theta: number, l: number, out: THREE.Vector3, folds = true, inset = 0) {
  const cap = l < 0 ? Math.sqrt(Math.max(0, 1 - (l / S_CAP) ** 2)) : 1;
  let ra = (sleeveA(Math.max(0, l)) - inset) * cap;
  let rb = (sleeveB(Math.max(0, l)) - inset) * cap;
  if (folds && l >= 0) {
    let f = 0;
    // creases gathering under the arm
    f -= 0.012 * Math.exp(-(((theta - Math.PI) / 0.55) ** 2)) * (0.5 + 0.5 * Math.sin(l * 28 + 1)) * (1 - l / S_LEN);
    // gentle folds round the sleeve
    f += 0.004 * Math.sin(theta * 3 + l * 9);
    f += hemBand(S_LEN - l);
    ra += f;
    rb += f;
  }
  return out
    .copy(S_ROOT)
    .addScaledVector(S_DIR, l)
    .addScaledVector(S_UP, ra * Math.cos(theta))
    .setZ(rb * Math.sin(theta));
}

function buildSleeve(side: 1 | -1, cols = 96, nl = 30) {
  const b = buffers();
  const p = new THREE.Vector3();
  const ls: number[] = [];
  // rounded cap (from its tip, buried in the body, out to the full sleeve)
  for (let k = 0; k < 8; k++) ls.push(-S_CAP * Math.cos((Math.PI / 2) * (k / 8)));
  for (let k = 0; k <= nl; k++) ls.push(((S_LEN - 0.095) * k) / nl);
  for (let k = BAND_ROWS.length - 2; k >= 0; k--) ls.push(S_LEN - BAND_ROWS[k]);
  const rows = ls.length + 2;
  const inside: boolean[] = [];

  for (let i = 0; i <= cols; i++) {
    const rel = (i / cols) * Math.PI * 2;
    const theta = Math.PI + rel; // seam under the arm
    const push = (q: THREE.Vector3, l: number, edge: number, flap: number, ao: number) => {
      const along = rel * (sleeveA(l) + sleeveB(l)) * 0.5;
      b.pos.push(q.x * side, q.y, q.z);
      b.uv.push(along * UV, l * UV);
      b.col.push(ao, ao, ao);
      b.flap.push(flap);
      b.edge.push(edge);
      b.along.push(along);
      inside.push(insideBody(q.x, q.y, q.z));
    };
    for (const l of ls) {
      sleevePoint(theta, l, p);
      const under = (1 - Math.cos(theta)) / 2; // 0 on top of the sleeve, 1 underneath
      const ao = 1 - 0.26 * (1 - smooth(0, 0.25, l)) * (0.35 + 0.65 * under) - 0.05 * (1 - smooth(0, 0.03, S_LEN - l));
      push(p, l, S_LEN - l, 0.75 * (Math.max(0, l) / S_LEN) ** 2, ao);
    }
    // the cuff's thickness, then the turned-up allowance inside
    push(sleevePoint(theta, S_LEN + 0.002, p, false, LIP), S_LEN, 1, 0.75, 0.8);
    push(sleevePoint(theta, S_LEN - HEM_BAND * 0.85, p, false, LIP), S_LEN, 1, 0.75 * ((S_LEN - HEM_BAND) / S_LEN) ** 2, 0.62);
  }
  // Drop the parts of the sleeve root buried inside the body.
  gridIndex(b, cols, rows, (x, y, z) => !(inside[x] && inside[y] && inside[z]), side === -1);
  return finish(b, { cols, rows });
}

/** Ribbed crew-neck band that follows the neck opening. */
function buildCollar(segs = 180) {
  const phiN = Math.asin((NECK_W / SHOULDER_X) ** (1 / EXP));
  const pts: THREE.Vector3[] = [];
  const ups: THREE.Vector3[] = [];
  const p = new THREE.Vector3();
  const q = new THREE.Vector3();
  const half = segs / 2;
  for (let k = 0; k < segs; k++) {
    const phi = k < half ? -phiN + (2 * phiN * k) / half : Math.PI - phiN + (2 * phiN * (k - half)) / half;
    const top = topOf(phi);
    bodyPoint(phi, top.y, p, false);
    bodyPoint(phi, top.y - 0.02, q, false);
    const up = p.clone().sub(q).normalize().lerp(new THREE.Vector3(0, 1, 0), 1 - top.open).normalize();
    pts.push(p.clone());
    ups.push(up);
  }
  const PROFILE: [number, number, number][] = [
    // [out, up, shade]
    [0.0045, -0.014, 0.72],
    [0.0055, 0, 0.82],
    [0.0058, 0.036, 1],
    [0.0048, 0.047, 1],
    [0.0015, 0.053, 0.98],
    [-0.003, 0.052, 0.92],
    [-0.0065, 0.045, 0.8],
    [-0.0075, 0.03, 0.7],
    [-0.0075, -0.014, 0.55],
  ];
  const b = buffers();
  const rows = PROFILE.length;
  let along = 0;
  const T = new THREE.Vector3();
  const Nn = new THREE.Vector3();
  const U = new THREE.Vector3();
  for (let k = 0; k <= segs; k++) {
    const i = k % segs;
    if (k > 0) along += pts[i].distanceTo(pts[k - 1]);
    T.subVectors(pts[(i + 1) % segs], pts[(i - 1 + segs) % segs]).normalize();
    Nn.crossVectors(T, ups[i]).normalize();
    U.crossVectors(Nn, T).normalize();
    PROFILE.forEach(([o, u, ao], m) => {
      b.pos.push(pts[i].x + Nn.x * o + U.x * u, pts[i].y + Nn.y * o + U.y * u, pts[i].z + Nn.z * o + U.z * u);
      b.uv.push(along * 7.5, m / (rows - 1));
      b.col.push(ao, ao, ao);
      b.flap.push(0);
      b.edge.push(1);
      b.along.push(along);
    });
  }
  gridIndex(b, segs, rows);
  return finish(b, { cols: segs, rows });
}

/** The chest print: a patch of the front, lifted just off the fabric so it moves with it. */
function buildPrint(width: number, aspect: number, cy: number, nx = 44, ny = 58) {
  const h = width * aspect;
  const pos: number[] = [];
  const uv: number[] = [];
  const flap: number[] = [];
  const idx: number[] = [];
  const p = new THREE.Vector3();
  for (let j = 0; j <= ny; j++) {
    for (let i = 0; i <= nx; i++) {
      const phi = phiAtArc((i / nx - 0.5) * width);
      const y = cy + (j / ny - 0.5) * h;
      bodyPoint(phi, y, p);
      pos.push(p.x, p.y, p.z);
      uv.push(i / nx, j / ny);
      flap.push(bodyFlap(phi, y));
    }
  }
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const a = j * (nx + 1) + i;
      idx.push(a, a + 1, a + nx + 2, a, a + nx + 2, a + nx + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute("aFlap", new THREE.Float32BufferAttribute(flap, 1));
  g.setIndex(idx);
  g.computeVertexNormals();
  const ps = g.attributes.position as THREE.BufferAttribute;
  const ns = g.attributes.normal as THREE.BufferAttribute;
  for (let k = 0; k < ps.count; k++) {
    ps.setXYZ(k, ps.getX(k) + ns.getX(k) * 0.0035, ps.getY(k) + ns.getY(k) * 0.0035, ps.getZ(k) + ns.getZ(k) * 0.0035);
  }
  return g;
}

export interface ShirtParts {
  body: THREE.BufferGeometry;
  sleeveL: THREE.BufferGeometry;
  sleeveR: THREE.BufferGeometry;
  collar: THREE.BufferGeometry;
  print: THREE.BufferGeometry;
  dispose: () => void;
}

/** Builds every part of the shirt. `print` is the chest print area (width, height / width, centre y). */
export function buildShirt(print: { width: number; aspect: number; cy: number }): ShirtParts {
  const parts = {
    body: buildBody(),
    sleeveL: buildSleeve(-1),
    sleeveR: buildSleeve(1),
    collar: buildCollar(),
    print: buildPrint(print.width, print.aspect, print.cy),
  };
  return { ...parts, dispose: () => Object.values(parts).forEach((g) => g.dispose()) };
}

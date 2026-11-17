"use client";

import * as THREE from "three";
import { useEffect, useMemo, type DependencyList } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { getProduct, type ProductId } from "@/lib/products";
import { applyReveal, type RevealUniforms } from "./reveal";
import { roundedRect, shapeWithUV, sweepEllipse } from "./geometry";
import { brushedNormal, knitNormal, kraftMap, paperNormal, rubberNormal, smudgeMap, weaveNormal } from "./textures";
import { buildShirt } from "./shirt";
import { applyFlap, cottonMaterial, ribMaterial, tickFlap } from "./cloth";

/* ------------------------------------------------------------------ */
/* Product models, built to real proportions and finished with PBR      */
/* materials (glazed ceramic, coated steel, clear plastic, polyester,   */
/* cotton jersey, kraft board) so they read like product photography.   */
/* Each has a print surface whose UVs match its print-area canvas.      */
/* ------------------------------------------------------------------ */

export interface ModelProps {
  kind: ProductId;
  map: THREE.Texture | null;
  uniforms: RevealUniforms;
  /** The product's option colour (mug inside, lid, cap, shirt, box…). */
  color?: string;
}

type Inner = Omit<ModelProps, "kind">;

function useMat<T extends THREE.Material>(factory: () => T, deps: DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const m = useMemo(factory, deps);
  useEffect(() => () => m.dispose(), [m]);
  return m;
}

function useGeo<T extends THREE.BufferGeometry>(factory: () => T, deps: DependencyList = []): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const g = useMemo(factory, deps);
  useEffect(() => () => g.dispose(), [g]);
  return g;
}

function usePrint(
  map: THREE.Texture | null,
  uniforms: RevealUniforms,
  opts: {
    roughness?: number;
    clearcoat?: number;
    transparent?: boolean;
    normalMap?: THREE.Texture;
    sheen?: number;
    /** Moves with the T-shirt's breeze. */
    flap?: boolean;
    /** Faint handling marks in the gloss. */
    smudge?: boolean;
  } = {},
) {
  const { roughness = 0.3, clearcoat = 0.6, transparent = false, normalMap, sheen = 0, flap = false, smudge = false } = opts;
  return useMat(() => {
    const m = new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      map,
      roughness,
      roughnessMap: smudge ? smudgeMap() : null,
      clearcoat,
      clearcoatRoughness: smudge ? 0.11 : 0.08,
      clearcoatRoughnessMap: smudge ? smudgeMap() : null,
      sheen,
      sheenRoughness: 0.7,
      normalMap: normalMap ?? null,
      normalScale: new THREE.Vector2(0.35, 0.35),
      transparent,
      depthWrite: !transparent,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    applyReveal(m, uniforms);
    return flap ? applyFlap(m) : m;
  }, [map, uniforms, roughness, clearcoat, transparent, normalMap, sheen, flap, smudge]);
}

const lathe = (pts: [number, number][], segs = 96) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), segs);
const isClear = (c?: string) => c?.toLowerCase() === "#dfe7ee";

/* ------------------------------- Mug -------------------------------- */
const MUG_OUTER: [number, number][] = [
  [0, -0.6],
  [0.4, -0.6],
  [0.455, -0.596],
  [0.482, -0.582],
  [0.496, -0.555],
  [0.5, -0.52],
  [0.5, 0.57],
  [0.498, 0.588],
  [0.49, 0.598],
  [0.478, 0.6],
];
const MUG_INNER: [number, number][] = [
  [0.478, 0.6],
  [0.466, 0.598],
  [0.458, 0.588],
  [0.455, 0.57],
  [0.455, -0.49],
  [0.445, -0.525],
  [0.415, -0.542],
  [0, -0.545],
];

function Mug({ map, uniforms, color = "#f4f4f1" }: Inner) {
  const p = getProduct("mug");
  const R = 0.5;
  const gap = 0.16 * Math.PI * 2;
  const len = Math.PI * 2 - gap;
  const bandH = ((R + 0.003) * len) / (p.canvas.w / p.canvas.h);

  const outer = useGeo(() => lathe(MUG_OUTER, 128));
  const inner = useGeo(() => lathe(MUG_INNER, 128));
  const handle = useGeo(() => {
    const curve = new THREE.CatmullRomCurve3(
      [
        [-0.04, 0.34],
        [0.16, 0.38],
        [0.31, 0.3],
        [0.37, 0.1],
        [0.35, -0.1],
        [0.26, -0.24],
        [0.1, -0.29],
        [-0.04, -0.27],
      ].map(([x, y]) => new THREE.Vector3(x, y, 0)),
    );
    // Oval cross-section (wider than it is thick) that flares where it joins the mug.
    return sweepEllipse(curve, 120, 28, (t) => {
      const flare = Math.exp(-((t / 0.08) ** 2)) + Math.exp(-(((1 - t) / 0.08) ** 2));
      return [0.048 * (1 + 0.6 * flare), 0.08 * (1 + 0.35 * flare)];
    });
  });
  const glaze = useMat(
    () => new THREE.MeshPhysicalMaterial({
          color: "#f7f7f5",
          roughness: 0.18,
          roughnessMap: smudgeMap(),
          clearcoat: 1,
          clearcoatRoughness: 0.07,
          clearcoatRoughnessMap: smudgeMap(),
          ior: 1.5,
        }),
    [],
  );
  const accent = useMat(
    () => new THREE.MeshPhysicalMaterial({
          color,
          roughness: 0.18,
          roughnessMap: smudgeMap(),
          clearcoat: 1,
          clearcoatRoughness: 0.07,
          clearcoatRoughnessMap: smudgeMap(),
          side: THREE.DoubleSide,
        }),
    [color],
  );
  const print = usePrint(map, uniforms, { roughness: 0.16, clearcoat: 1, smudge: true });

  return (
    <group>
      <mesh geometry={outer} material={glaze} />
      <mesh geometry={inner} material={accent} />
      <group position={[0, 0.03, -R + 0.01]} rotation={[0, Math.PI / 2, 0]}>
        <mesh geometry={handle} material={accent} />
      </group>
      <mesh material={print} position={[0, 0.03, 0]}>
        <cylinderGeometry args={[R + 0.003, R + 0.003, bandH, 160, 1, true, -len / 2, len]} />
      </mesh>
    </group>
  );
}

/* ----------------------------- Tumbler ------------------------------ */
function Tumbler({ map, uniforms, color = "#dfe7ee" }: Inner) {
  const p = getProduct("tumbler");
  const R = 0.34;
  const bandH = (2 * Math.PI * (R + 0.003)) / (p.canvas.w / p.canvas.h);
  const clear = isClear(color);

  const body = useGeo(() =>
    lathe([
      [0, -1.05],
      [0.3, -1.05],
      [0.328, -1.043],
      [0.339, -1.025],
      [R, -0.99],
      [R, 0.86],
    ]),
  );
  const rim = useGeo(() =>
    lathe([
      [R, 0.86],
      [R, 1.0],
      [0.338, 1.012],
      [0.33, 1.016],
      [0.322, 1.012],
      [0.32, 0.99],
    ]),
  );
  const lid = useGeo(() =>
    lathe([
      [0.318, 0.95],
      [0.325, 1.012],
      [0.343, 1.02],
      [0.348, 1.05],
      [0.34, 1.085],
      [0.29, 1.1],
      [0.08, 1.105],
      [0, 1.105],
    ]),
  );
  const coat = useMat(() => new THREE.MeshPhysicalMaterial({
          color: "#f3f3f1",
          roughness: 0.28,
          roughnessMap: smudgeMap(),
          clearcoat: 0.9,
          clearcoatRoughness: 0.12,
          clearcoatRoughnessMap: smudgeMap(),
        }), []);
  const steel = useMat(
    () => new THREE.MeshPhysicalMaterial({ color: "#d9dce0", metalness: 1, roughness: 0.22, normalMap: brushedNormal(), normalScale: new THREE.Vector2(0.15, 0.15) }),
    [],
  );
  const lidMat = useMat(
    () =>
      clear
        ? new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.06, transmission: 1, thickness: 0.06, ior: 1.46, transparent: true })
        : new THREE.MeshPhysicalMaterial({ color, roughness: 0.3, clearcoat: 0.6 }),
    [clear, color],
  );
  const strawMat = useMat(
    () => new THREE.MeshPhysicalMaterial({ color: "#f6fbff", roughness: 0.05, transmission: 1, thickness: 0.03, ior: 1.46, transparent: true }),
    [],
  );
  const print = usePrint(map, uniforms, { roughness: 0.24, clearcoat: 0.9, smudge: true });

  return (
    <group>
      <mesh geometry={body} material={coat} />
      <mesh geometry={rim} material={steel} />
      <mesh geometry={lid} material={lidMat} />
      <mesh material={print} position={[0, -0.08, 0]}>
        <cylinderGeometry args={[R + 0.003, R + 0.003, bandH, 160, 1, true, -Math.PI, Math.PI * 2]} />
      </mesh>
      <mesh material={strawMat} position={[0.07, 1.48, 0.02]} rotation={[0, 0, -0.05]}>
        <cylinderGeometry args={[0.028, 0.028, 1.0, 24, 1, true]} />
      </mesh>
      <mesh material={lidMat} position={[0.07, 1.12, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.04, 0.012, 12, 32]} />
      </mesh>
    </group>
  );
}

/* ------------------------------ Bottle ------------------------------ */
function Bottle({ map, uniforms, color = "#c9ccd1" }: Inner) {
  const p = getProduct("bottle");
  const r = 0.4225;
  const bandH = (2 * Math.PI * r) / (p.canvas.w / p.canvas.h);
  const metal = color.toLowerCase() === "#c9ccd1";
  const body = useGeo(() =>
    lathe(
      [
        [0, -0.8],
        [0.37, -0.8],
        [0.405, -0.792],
        [0.418, -0.772],
        [0.42, -0.74],
        [0.42, 0.45],
        [0.414, 0.53],
        [0.39, 0.61],
        [0.33, 0.7],
        [0.27, 0.765],
        [0.247, 0.8],
        [0.242, 0.86],
      ],
      128,
    ),
  );
  const cap = useGeo(() =>
    lathe([
      [0.24, 0.86],
      [0.262, 0.865],
      [0.265, 0.88],
      [0.265, 1.1],
      [0.258, 1.13],
      [0.225, 1.15],
      [0, 1.152],
    ]),
  );
  const loop = useGeo(() => new THREE.TorusGeometry(0.11, 0.028, 16, 48, Math.PI));
  const coat = useMat(() => new THREE.MeshPhysicalMaterial({
          color: "#f3f3f1",
          roughness: 0.28,
          roughnessMap: smudgeMap(),
          clearcoat: 0.9,
          clearcoatRoughness: 0.12,
          clearcoatRoughnessMap: smudgeMap(),
        }), []);
  const capMat = useMat(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: metal ? "#d4d7db" : color,
        metalness: metal ? 1 : 0,
        roughness: metal ? 0.3 : 0.45,
        clearcoat: metal ? 0 : 0.4,
        normalMap: metal ? brushedNormal() : null,
        normalScale: new THREE.Vector2(0.2, 0.2),
      }),
    [metal, color],
  );
  const print = usePrint(map, uniforms, { roughness: 0.24, clearcoat: 0.9, smudge: true });

  return (
    <group>
      <mesh geometry={body} material={coat} />
      <mesh geometry={cap} material={capMat} />
      <mesh geometry={loop} material={capMat} position={[0, 1.15, 0]} />
      <mesh material={print} position={[0, -0.16, 0]}>
        <cylinderGeometry args={[r, r, bandH, 160, 1, true, -Math.PI, Math.PI * 2]} />
      </mesh>
    </group>
  );
}

/* ----------------------------- Mousepad ----------------------------- */
function Mousepad({ map, uniforms }: Inner) {
  const p = getProduct("mousepad");
  const W = 2.2;
  const D = W / (p.canvas.w / p.canvas.h);
  const T = 0.035;
  const shape = useMemo(() => roundedRect(W, D, 0.07), [D]);
  const base = useGeo(() => {
    const g = new THREE.ExtrudeGeometry(shape, { depth: T, bevelEnabled: true, bevelSize: 0.004, bevelThickness: 0.004, bevelSegments: 2, curveSegments: 24 });
    g.translate(0, 0, -T - 0.004);
    return g;
  }, [shape]);
  const top = useGeo(() => shapeWithUV(shape, W, D, 24), [shape]);
  const stitch = useGeo(() => {
    const pts = roundedRect(W - 0.004, D - 0.004, 0.068).getPoints(40).map((v) => new THREE.Vector3(v.x, v.y, 0));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 400, 0.011, 8, true);
  }, [D]);
  const rubber = useMat(
    () => new THREE.MeshStandardMaterial({ color: "#111111", roughness: 0.92, normalMap: rubberNormal(), normalScale: new THREE.Vector2(0.4, 0.4) }),
    [],
  );
  const thread = useMat(() => new THREE.MeshStandardMaterial({ color: "#1a1a1a", roughness: 0.85, normalMap: weaveNormal() }), []);
  const print = usePrint(map, uniforms, { roughness: 0.78, clearcoat: 0, normalMap: weaveNormal(), sheen: 0.4 });

  return (
    <group>
      <mesh geometry={base} material={rubber} />
      <mesh geometry={top} material={print} position={[0, 0, 0.001]} />
      <mesh geometry={stitch} material={thread} position={[0, 0, -0.006]} />
    </group>
  );
}

/* ----------------------------- Keyholder ---------------------------- */
/* Glossy MDF sublimation blank: white coated faces, bare brown fibreboard edges (about 3 mm thick). */
const MDF_BEVEL = 0.004;

function Keyholder({ map, uniforms }: Inner) {
  const p = getProduct("keyholder");
  const S = 1;
  const T = 0.05;
  const holeY = S / 2 - (p.hole?.y ?? 0.14) * S;
  const holeR = (p.hole?.r ?? 0.05) * S;
  const shape = useMemo(() => {
    const s = roundedRect(S, S, 0.12);
    const hole = new THREE.Path();
    hole.absarc(0, holeY, holeR, 0, Math.PI * 2, true);
    s.holes.push(hole);
    return s;
  }, [holeY, holeR]);
  const body = useGeo(() => {
    // Group 0 = the two coated faces, group 1 = the cut edges (and the inside of the hole).
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: T,
      bevelEnabled: true,
      bevelSize: MDF_BEVEL,
      bevelThickness: MDF_BEVEL,
      bevelSegments: 2,
      curveSegments: 32,
    });
    g.translate(0, 0, -T / 2);
    return g;
  }, [shape]);
  const face = useGeo(() => shapeWithUV(shape, S, S, 32), [shape]);
  const board = useMat(() => new THREE.MeshPhysicalMaterial({
        color: "#f5f5f3",
        roughness: 0.22,
        roughnessMap: smudgeMap(),
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        clearcoatRoughnessMap: smudgeMap(),
      }), []);
  // Raw fibreboard: matte, fibrous, a little uneven in colour.
  const mdf = useMat(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#ffffff",
        map: kraftMap("#8f6b4b"),
        roughness: 0.9,
        normalMap: paperNormal(),
        normalScale: new THREE.Vector2(0.7, 0.7),
      }),
    [],
  );
  const chrome = useMat(() => new THREE.MeshPhysicalMaterial({ color: "#e4e6e9", metalness: 1, roughness: 0.12 }), []);
  const print = usePrint(map, uniforms, { roughness: 0.14, clearcoat: 1, smudge: true });
  const ringY = holeY + 0.13;
  const faceZ = T / 2 + MDF_BEVEL + 0.0005;

  return (
    <group>
      <mesh geometry={body} material={[board, mdf]} />
      <mesh geometry={face} material={print} position={[0, 0, faceZ]} />
      <mesh geometry={face} material={print} position={[0, 0, -faceZ]} rotation={[0, Math.PI, 0]} />
      {/* split ring + chain */}
      <mesh material={chrome} position={[0, ringY, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.13, 0.014, 16, 64]} />
      </mesh>
      <mesh material={chrome} position={[0.006, ringY, 0]} rotation={[0, Math.PI / 2 + 0.06, 0]}>
        <torusGeometry args={[0.13, 0.014, 16, 64]} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} material={chrome} position={[0, ringY + 0.17 + i * 0.075, 0]} rotation={[0, i % 2 ? Math.PI / 2 : 0, 0]} scale={[1, 1.5, 1]}>
          <torusGeometry args={[0.03, 0.008, 10, 28]} />
        </mesh>
      ))}
      <mesh material={chrome} position={[0, ringY + 0.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.16, 0.016, 16, 64]} />
      </mesh>
    </group>
  );
}

/* ------------------------------ T-shirt ----------------------------- */
function Tshirt({ map, uniforms, color = "#f2f2ef" }: Inner) {
  const p = getProduct("tshirt");
  const shirt = useMemo(() => buildShirt({ width: 0.86, aspect: p.canvas.h / p.canvas.w, cy: 0.05 }), [p.canvas.w, p.canvas.h]);
  useEffect(() => () => shirt.dispose(), [shirt]);
  const cotton = useMat(() => cottonMaterial(color), [color]);
  const rib = useMat(() => ribMaterial(color), [color]);
  const print = usePrint(map, uniforms, { roughness: 0.85, clearcoat: 0, transparent: true, normalMap: knitNormal(), sheen: 0.3, flap: true });
  useFrame(tickFlap);

  return (
    <group>
      <mesh geometry={shirt.body} material={cotton} />
      <mesh geometry={shirt.sleeveL} material={cotton} />
      <mesh geometry={shirt.sleeveR} material={cotton} />
      <mesh geometry={shirt.collar} material={rib} />
      <mesh geometry={shirt.print} material={print} />
    </group>
  );
}

/* -------------------------------- Box ------------------------------- */
function Box({ map, uniforms, color = "#c49a6c" }: Inner) {
  const p = getProduct("box");
  const W = 2;
  const D = W / (p.canvas.w / p.canvas.h);
  const H = 0.55;
  const LID_H = 0.2;
  const kraft = color.toLowerCase() === "#c49a6c";
  const board = useMat(
    () =>
      new THREE.MeshStandardMaterial({
        color: kraft ? "#ffffff" : color,
        map: kraft ? kraftMap(color) : null,
        roughness: 0.92,
        normalMap: paperNormal(),
        normalScale: new THREE.Vector2(0.25, 0.25),
      }),
    [kraft, color],
  );
  const shadowGap = useMat(() => new THREE.MeshStandardMaterial({ color: new THREE.Color(color).multiplyScalar(0.25), roughness: 1 }), [color]);
  const print = usePrint(map, uniforms, { roughness: 0.7, clearcoat: 0, normalMap: paperNormal() });

  return (
    <group>
      {/* base, slightly inset under the lid */}
      <RoundedBox args={[W - 0.03, H - 0.02, D - 0.03]} position={[0, -0.01, 0]} radius={0.018} smoothness={4} material={board} />
      {/* the dark gap under the lid's edge */}
      <mesh material={shadowGap} position={[0, H / 2 - LID_H - 0.004, 0]}>
        <boxGeometry args={[W - 0.026, 0.01, D - 0.026]} />
      </mesh>
      <RoundedBox args={[W, LID_H, D]} position={[0, H / 2 - LID_H / 2, 0]} radius={0.022} smoothness={4} material={board} />
      <mesh material={print} position={[0, H / 2 + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W - 0.06, D - 0.06]} />
      </mesh>
    </group>
  );
}

const MODELS: Record<ProductId, (p: Inner) => React.JSX.Element> = {
  mug: Mug,
  tumbler: Tumbler,
  bottle: Bottle,
  mousepad: Mousepad,
  keyholder: Keyholder,
  tshirt: Tshirt,
  box: Box,
};

/** How each product sits in a "studio" camera view. */
export const MODEL_VIEW: Record<ProductId, { position: [number, number, number]; rotation: [number, number, number]; scale: number }> = {
  mug: { position: [0, -0.05, 0], rotation: [0.14, -0.85, 0], scale: 1.4 },
  tumbler: { position: [0, -0.3, 0], rotation: [0.06, 0, 0], scale: 1.0 },
  bottle: { position: [0, -0.2, 0], rotation: [0.06, 0, 0], scale: 1.3 },
  mousepad: { position: [0, 0, 0], rotation: [-0.55, 0, 0], scale: 1.15 },
  keyholder: { position: [0, -0.4, 0], rotation: [0, 0, 0], scale: 1.55 },
  tshirt: { position: [0, -0.05, 0], rotation: [0, 0, 0], scale: 1.2 },
  box: { position: [0, -0.05, 0], rotation: [1.0, 0, 0], scale: 1.2 },
};

export default function ProductModel({ kind, ...rest }: ModelProps) {
  const Model = MODELS[kind];
  return <Model {...rest} />;
}

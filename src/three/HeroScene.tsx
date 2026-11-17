"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import ProductModel from "./ProductModel";
import Lights from "./Lights";
import { createRevealUniforms } from "./reveal";
import { makePosterTexture } from "./posters";
import { anton, interTight } from "@/app/fonts";
import type { ProductId } from "@/lib/products";

type Slot = { kind: ProductId; pos: [number, number, number]; rot: [number, number, number]; scale: number; spin: number };

const WIDE: Slot[] = [
  { kind: "tumbler", pos: [-3.25, 0.45, -0.9], rot: [0.08, 0.3, 0.16], scale: 0.95, spin: 0.22 },
  { kind: "mug", pos: [-1.1, 0.05, 0.8], rot: [0.2, -0.7, -0.06], scale: 1.1, spin: -0.25 },
  { kind: "mousepad", pos: [1.15, 0.95, -1.7], rot: [-0.45, -0.35, 0.1], scale: 1.05, spin: 0 },
  { kind: "keyholder", pos: [3.2, -0.05, 0.25], rot: [0.05, -0.35, -0.14], scale: 1.0, spin: 0.4 },
  { kind: "tshirt", pos: [1.55, -0.85, -3.3], rot: [-0.12, 0.3, 0.05], scale: 1.0, spin: 0.1 },
];

const TALL: Slot[] = [
  { kind: "tumbler", pos: [-1.1, 1.15, -0.6], rot: [0.08, 0.3, 0.12], scale: 0.75, spin: 0.22 },
  { kind: "mug", pos: [0.95, 1.2, 0.4], rot: [0.2, -0.7, -0.06], scale: 0.9, spin: -0.25 },
  { kind: "mousepad", pos: [-0.15, -0.15, -1.4], rot: [-0.45, -0.3, 0.1], scale: 0.9, spin: 0 },
  { kind: "keyholder", pos: [1.45, -0.75, 0.4], rot: [0.05, -0.35, -0.14], scale: 0.85, spin: 0.4 },
  { kind: "tshirt", pos: [-1.3, -1.05, -2.4], rot: [-0.12, 0.3, 0.05], scale: 0.8, spin: 0.1 },
];

function Spinner({ speed, children }: { speed: number; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += speed * Math.min(dt, 0.05);
  });
  return <group ref={ref}>{children}</group>;
}

function Scene({ progress }: { progress: RefObject<number> }) {
  const { viewport, camera } = useThree();
  const uniforms = useMemo(() => {
    const u = createRevealUniforms(new THREE.Vector4(0.97, 0.97, 0.96, 1));
    u.uReveal.value = 0;
    return u;
  }, []);
  const textures = useMemo(() => {
    const kinds: ProductId[] = ["tumbler", "mug", "mousepad", "keyholder", "tshirt"];
    return Object.fromEntries(kinds.map((k) => [k, makePosterTexture(k, anton.style.fontFamily, interTight.style.fontFamily, 0.6)])) as Record<
      ProductId,
      THREE.CanvasTexture
    >;
  }, []);
  useEffect(() => () => Object.values(textures).forEach((t) => t.dispose()), [textures]);

  const group = useRef<THREE.Group>(null);
  const tall = viewport.aspect < 0.9;
  const slots = tall ? TALL : WIDE;
  const s = tall ? THREE.MathUtils.clamp(viewport.width / 5.4, 0.5, 0.9) : THREE.MathUtils.clamp(viewport.width / 9.8, 0.6, 1.08);

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    const p = progress.current ?? 0;
    // White sublimation blanks get "pressed" with colour as you scroll.
    const target = THREE.MathUtils.clamp((p - 0.05) * 1.7, 0, 1);
    uniforms.uReveal.value = THREE.MathUtils.damp(uniforms.uReveal.value, target, 2.4, d);

    camera.position.x = THREE.MathUtils.damp(camera.position.x, state.pointer.x * 0.5, 2.2, d);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.25 + state.pointer.y * 0.28, 2.2, d);
    camera.lookAt(0, -0.35, 0);

    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, p * 0.5, 4, d);
      group.current.position.z = THREE.MathUtils.damp(group.current.position.z, p * 1.4, 4, d);
    }
  });

  return (
    <>
      <Lights />
      <group ref={group} scale={s}>
        {slots.map((slot) => (
          <Float key={slot.kind} speed={1} rotationIntensity={0.25} floatIntensity={0.55}>
            <group position={slot.pos} rotation={slot.rot} scale={slot.scale}>
              <Spinner speed={slot.spin}>
                <ProductModel kind={slot.kind} map={textures[slot.kind]} uniforms={uniforms} />
              </Spinner>
            </group>
          </Float>
        ))}
      </group>
    </>
  );
}

export default function HeroScene({ progress, active = true }: { progress: RefObject<number>; active?: boolean }) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.6]}
      camera={{ position: [0, 0.25, 8], fov: 34, near: 0.1, far: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", toneMappingExposure: 1.05 }}
      aria-label="White sublimation blanks that get printed in colour as you scroll"
    >
      <Scene progress={progress} />
    </Canvas>
  );
}

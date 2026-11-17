"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Preload } from "@react-three/drei";
import gsap from "gsap";
import ProductModel, { MODEL_VIEW } from "./ProductModel";
import Lights from "./Lights";
import { createRevealUniforms } from "./reveal";
import { makePosterTexture } from "./posters";
import { anton, interTight } from "@/app/fonts";
import { PRODUCTS, type ProductId } from "@/lib/products";

const KINDS = PRODUCTS.map((p) => p.id);

/** Keeps the product inside narrow (portrait) frames. */
function Fit({ children }: { children: React.ReactNode }) {
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  return <group scale={Math.min(1, aspect * 0.95 + 0.05)}>{children}</group>;
}

/** A soft, pre-drawn floor shadow (much cheaper than a live contact shadow). */
function BlobShadow() {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(0,0,0,0.55)");
    g.addColorStop(0.5, "rgba(0,0,0,0.22)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <mesh position={[0, -1.6, 0]} rotation-x={-Math.PI / 2} scale={[4.2, 2.4, 1]} renderOrder={-1}>
      <planeGeometry />
      <meshBasicMaterial map={tex} transparent depthWrite={false} opacity={0.8} />
    </mesh>
  );
}

/** One product. All of them stay built; only the active one is shown, so hovering is instant. */
function Turntable({ kind, active }: { kind: ProductId; active: boolean }) {
  const uniforms = useMemo(() => createRevealUniforms(new THREE.Vector4(1, 1, 1, kind === "tshirt" ? 0 : 1)), [kind]);
  const texture = useMemo(() => makePosterTexture(kind, anton.style.fontFamily, interTight.style.fontFamily), [kind]);
  useEffect(() => () => texture.dispose(), [texture]);

  useEffect(() => {
    if (!active) return;
    uniforms.uReveal.value = 0;
    const t = gsap.to(uniforms.uReveal, { value: 1, duration: 1.3, ease: "power2.inOut", delay: 0.2 });
    return () => {
      t.kill();
    };
  }, [active, uniforms]);

  const spin = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (active && spin.current) spin.current.rotation.y += Math.min(dt, 0.05) * 0.5;
  });

  const view = MODEL_VIEW[kind];
  return (
    <group visible={active} position={view.position} rotation={view.rotation} scale={view.scale * 0.95}>
      <group ref={spin}>
        <ProductModel kind={kind} map={texture} uniforms={uniforms} />
      </group>
    </group>
  );
}

export default function TeaserScene({ kind, running = true }: { kind: ProductId; running?: boolean }) {
  return (
    <Canvas
      frameloop={running ? "always" : "never"}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.5, 6.8], fov: 35 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <Lights />
      <Fit>
        <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.4}>
          {KINDS.map((k) => (
            <Turntable key={k} kind={k} active={k === kind} />
          ))}
        </Float>
      </Fit>
      <BlobShadow />
      {/* Compile every product's materials up front so switching never stalls. */}
      <Preload all />
    </Canvas>
  );
}

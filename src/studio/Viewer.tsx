"use client";

import * as THREE from "three";
import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, type Ref } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import gsap from "gsap";
import ProductModel, { MODEL_VIEW } from "@/three/ProductModel";
import Lights from "@/three/Lights";
import { createRevealUniforms } from "@/three/reveal";
import type { Product } from "@/lib/products";

export interface ViewerHandle {
  /** PNG of the current 3D view (transparent background). */
  capture: () => string | null;
  /** Replay the heat-press reveal. */
  press: () => void;
  resetView: () => void;
}

interface Props {
  product: Product;
  texture: THREE.Texture | null;
  color?: string;
  autoRotate: boolean;
  printed: boolean;
  /** Stop rendering while the viewer is hidden (phones, print-area view). */
  active?: boolean;
  ref?: Ref<ViewerHandle>;
}

type Three = { gl: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.Camera };

/** Shrinks the product on narrow (portrait) viewports so it never spills off the sides. */
function Fit({ children }: { children: React.ReactNode }) {
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  const k = Math.min(1, aspect * 0.9 + 0.08);
  return <group scale={k}>{children}</group>;
}

function Bridge({ onReady }: { onReady: (t: Three) => void }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  useEffect(() => onReady({ gl, scene, camera }), [gl, scene, camera, onReady]);
  return null;
}

export default function Viewer({ product, texture, color, autoRotate, printed, active = true, ref }: Props) {
  const three = useRef<Three | null>(null);
  const controls = useRef<OrbitControlsImpl>(null);
  const uniforms = useMemo(() => createRevealUniforms(), []);
  const onReady = useCallback((t: Three) => {
    three.current = t;
  }, []);

  const press = useCallback(() => {
    gsap.killTweensOf(uniforms.uReveal);
    gsap.fromTo(uniforms.uReveal, { value: 0 }, { value: 1, duration: 1.8, ease: "power2.inOut" });
  }, [uniforms]);

  useImperativeHandle(
    ref,
    () => ({
      capture: () => {
        const t = three.current;
        if (!t) return null;
        t.gl.render(t.scene, t.camera);
        return t.gl.domElement.toDataURL("image/png");
      },
      press,
      resetView: () => controls.current?.reset(),
    }),
    [press],
  );

  // Blank areas of a T-shirt print are see-through, everywhere else they're white.
  useEffect(() => {
    uniforms.uBlank.value.set(1, 1, 1, product.canvas.transparent ? 0 : 1);
  }, [product, uniforms]);

  // Every new product gets "pressed" in.
  useEffect(() => {
    if (printed) press();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  useEffect(() => {
    gsap.killTweensOf(uniforms.uReveal);
    gsap.to(uniforms.uReveal, { value: printed ? 1 : 0, duration: 0.9, ease: "power2.inOut" });
  }, [printed, uniforms]);

  const view = MODEL_VIEW[product.id];

  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.45, 5.6], fov: 35 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      aria-label={`3D preview of your ${product.name}`}
    >
      <Bridge onReady={onReady} />
      <Lights />
      <Fit>
        <group key={product.id} position={view.position} rotation={view.rotation} scale={view.scale}>
          <ProductModel kind={product.id} map={texture} uniforms={uniforms} color={color} />
        </group>
      </Fit>
      <ContactShadows position={[0, -1.55, 0]} opacity={0.5} scale={9} blur={2.6} far={3.5} />
      <OrbitControls
        ref={controls}
        makeDefault
        enablePan={false}
        enableDamping
        minDistance={3.2}
        maxDistance={9}
        minPolarAngle={0.25}
        maxPolarAngle={Math.PI * 0.62}
        autoRotate={autoRotate}
        autoRotateSpeed={1.3}
      />
    </Canvas>
  );
}

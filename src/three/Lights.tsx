"use client";

import { Environment, Lightformer } from "@react-three/drei";

/**
 * Photo-studio lighting: a real studio HDRI (Poly Haven "Studio Small 09", CC0)
 * plus soft-box light-formers for crisp product highlights.
 */
export default function Lights({ intensity = 1 }: { intensity?: number }) {
  return (
    <>
      <ambientLight intensity={0.15 * intensity} />
      <directionalLight position={[3, 5, 4]} intensity={1.1 * intensity} />
      <Environment files="/hdr/studio.hdr" resolution={256} environmentIntensity={0.95 * intensity}>
        <Lightformer form="rect" intensity={2.4} position={[0, 4.5, 2.5]} rotation-x={Math.PI / 2.4} scale={[7, 2.2, 1]} />
        <Lightformer form="rect" intensity={1.6} position={[-4.5, 1.2, 1.5]} rotation-y={Math.PI / 2.2} scale={[2.2, 5, 1]} />
        <Lightformer form="rect" intensity={1.1} position={[4.5, 0.8, 1]} rotation-y={-Math.PI / 2.2} scale={[2.2, 5, 1]} />
        <Lightformer form="rect" intensity={0.6} position={[0, -3, 3]} rotation-x={-Math.PI / 2.5} scale={[6, 1.5, 1]} />
      </Environment>
    </>
  );
}

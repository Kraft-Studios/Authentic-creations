import * as THREE from "three";

/**
 * "Sublimation" reveal: a noise-driven dissolve from a blank colour to the printed
 * texture, with a hot glowing edge where the ink is "transferring".
 * Patched into any MeshStandard/Physical material via onBeforeCompile.
 */
export interface RevealUniforms {
  [uniform: string]: THREE.IUniform;
  uReveal: { value: number };
  uBlank: { value: THREE.Vector4 };
  uEdge: { value: THREE.Color };
  /** 1 = blank areas ignore lighting (flat colour), used for the black hero look. */
  uFlat: { value: number };
}

export function createRevealUniforms(blank = new THREE.Vector4(1, 1, 1, 1), edge = "#ff5a1f", flat = 0): RevealUniforms {
  return {
    uReveal: { value: 1 },
    uBlank: { value: blank },
    uEdge: { value: new THREE.Color(edge) },
    uFlat: { value: flat },
  };
}

const HEAD = /* glsl */ `
uniform float uReveal;
uniform vec4 uBlank;
uniform vec3 uEdge;
uniform float uFlat;
float rvHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float rvNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(rvHash(i), rvHash(i + vec2(1.0, 0.0)), u.x),
             mix(rvHash(i + vec2(0.0, 1.0)), rvHash(i + vec2(1.0, 1.0)), u.x), u.y);
}
`;

const MAP = /* glsl */ `
float rvEdge = 0.0;
float rvM = 0.0;
#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D( map, vMapUv );
  float rvN = rvNoise(vMapUv * vec2(9.0, 7.0)) * 0.62 + rvNoise(vMapUv * vec2(31.0, 27.0)) * 0.38;
  float rvT = uReveal * 1.25 - 0.12;
  rvM = smoothstep(rvT - 0.035, rvT, rvN);
  rvEdge = (1.0 - smoothstep(0.0, 0.045, abs(rvN - rvT))) * step(0.002, uReveal) * step(uReveal, 0.998);
  diffuseColor *= mix(sampledDiffuseColor, uBlank, rvM);
#endif
`;

export function applyReveal<T extends THREE.MeshStandardMaterial>(material: T, uniforms: RevealUniforms): T {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${HEAD}`)
      .replace("#include <map_fragment>", MAP)
      .replace(
        "#include <emissivemap_fragment>",
        "#include <emissivemap_fragment>\n totalEmissiveRadiance += uEdge * rvEdge * 2.6;",
      )
      .replace(
        "#include <opaque_fragment>",
        "#include <opaque_fragment>\n gl_FragColor.rgb = mix(gl_FragColor.rgb, uBlank.rgb, rvM * uFlat * (1.0 - rvEdge));",
      );
  };
  material.customProgramCacheKey = () => "ac-reveal-v2";
  return material;
}

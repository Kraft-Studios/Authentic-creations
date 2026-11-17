import * as THREE from "three";
import { knitNormal, ribNormal } from "./textures";

/* ------------------------------------------------------------------ */
/* Fabric shading for the T-shirt: a gentle breeze that ripples the     */
/* hem and sleeves (shoulders stay put), double-needle hem stitching,   */
/* and a darker inside seen through the neck, hem and cuffs.            */
/* ------------------------------------------------------------------ */

/** Shared by every shirt on the page; updated once per frame from wall-clock time. */
export const FLAP = { uTime: { value: 0 }, uWind: { value: 1 } };

export function tickFlap() {
  FLAP.uTime.value = performance.now() / 1000;
}

const FLAP_HEAD = /* glsl */ `
attribute float aFlap;
uniform float uTime;
uniform float uWind;
// Travelling waves (wind from the left): the fabric sways, ripples and drifts.
vec3 acFlap(vec3 p, float w) {
  float t = uTime;
  float a = sin(p.x * 2.4 + p.y * 1.3 - t * 2.3);
  float b = sin(p.x * 4.7 - p.y * 2.6 - t * 3.4 + 1.7);
  float c = sin(p.y * 2.8 + p.x * 1.1 - t * 1.5 + 0.6);
  float z = (a * 0.65 + b * 0.35) * 0.062;
  float x = (0.55 + 0.45 * c) * 0.04;
  float y = -abs(a) * 0.008;
  return vec3(x, y, z) * w * uWind;
}
`;

/** Re-derive the normal from the moved surface so the ripples catch the light. */
const FLAP_NORMAL = /* glsl */ `
vec3 objectNormal = vec3( normal );
{
  vec3 n0 = normalize( normal );
  vec3 t1 = normalize( abs( n0.y ) < 0.9 ? cross( n0, vec3( 0.0, 1.0, 0.0 ) ) : cross( n0, vec3( 1.0, 0.0, 0.0 ) ) );
  vec3 t2 = cross( n0, t1 );
  float e = 0.02;
  vec3 q0 = position + acFlap( position, aFlap );
  vec3 q1 = position + t1 * e + acFlap( position + t1 * e, aFlap );
  vec3 q2 = position + t2 * e + acFlap( position + t2 * e, aFlap );
  vec3 nn = normalize( cross( q1 - q0, q2 - q0 ) );
  objectNormal = dot( nn, n0 ) < 0.0 ? -nn : nn;
}
`;

const FLAP_BEGIN = "vec3 transformed = vec3( position ) + acFlap( position, aFlap );";

function patchVertex(shader: THREE.WebGLProgramParametersWithUniforms, extraHead = "", extraBegin = "") {
  shader.uniforms.uTime = FLAP.uTime;
  shader.uniforms.uWind = FLAP.uWind;
  shader.vertexShader = shader.vertexShader
    .replace("#include <common>", `#include <common>\n${FLAP_HEAD}\n${extraHead}`)
    .replace("#include <beginnormal_vertex>", FLAP_NORMAL)
    .replace("#include <begin_vertex>", `${FLAP_BEGIN}\n${extraBegin}`);
}

/** Makes any material move with the shirt (used for the chest print). Geometry needs `aFlap`. */
export function applyFlap<T extends THREE.Material>(material: T): T {
  const prev = material.onBeforeCompile;
  const prevKey = material.customProgramCacheKey.bind(material);
  material.onBeforeCompile = (shader, renderer) => {
    prev.call(material, shader, renderer);
    patchVertex(shader);
  };
  material.customProgramCacheKey = () => `${prevKey()}|flap`;
  return material;
}

/** Two rows of hem stitching plus the fold line, drawn on the outside only. */
const STITCH = /* glsl */ `
#include <color_fragment>
{
  float aa = fwidth( vEdge ) + 0.0004;
  float ph = fract( vAlong * 95.0 );
  float dash = smoothstep( 0.12, 0.3, ph ) * ( 1.0 - smoothstep( 0.78, 0.94, ph ) );
  float s1 = 1.0 - smoothstep( 0.0024 - aa, 0.0024 + aa, abs( vEdge - 0.040 ) );
  float s2 = 1.0 - smoothstep( 0.0024 - aa, 0.0024 + aa, abs( vEdge - 0.051 ) );
  float fold = 1.0 - smoothstep( 0.003 - aa, 0.003 + aa, abs( vEdge - 0.065 ) );
  float outside = gl_FrontFacing ? 1.0 : 0.0;
  diffuseColor.rgb *= 1.0 - ( max( s1, s2 ) * dash * 0.3 + fold * 0.07 ) * outside;
}
`;

/** Cotton jersey for the body and sleeves. Geometry needs `aFlap`, `aEdge`, `aAlong` and `color`. */
export function cottonMaterial(color: string) {
  const m = new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.92,
    sheen: 1,
    sheenRoughness: 0.5,
    sheenColor: new THREE.Color(color).lerp(new THREE.Color("#ffffff"), 0.35),
    normalMap: knitNormal(),
    normalScale: new THREE.Vector2(0.4, 0.4),
    side: THREE.DoubleSide,
    vertexColors: true,
  });
  m.onBeforeCompile = (shader) => {
    patchVertex(
      shader,
      "attribute float aEdge;\nattribute float aAlong;\nvarying float vEdge;\nvarying float vAlong;",
      "vEdge = aEdge;\nvAlong = aAlong;",
    );
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vEdge;\nvarying float vAlong;")
      .replace("#include <color_fragment>", STITCH)
      // The inside of the shirt sits in shadow.
      .replace("#include <opaque_fragment>", "#include <opaque_fragment>\ngl_FragColor.rgb *= gl_FrontFacing ? 1.0 : 0.5;");
  };
  m.customProgramCacheKey = () => "ac-cotton-v1";
  return m;
}

/** 1×1 rib knit for the collar. */
export function ribMaterial(color: string) {
  const c = new THREE.Color(color).multiplyScalar(0.96);
  return new THREE.MeshPhysicalMaterial({
    color: c,
    roughness: 0.95,
    sheen: 1,
    sheenRoughness: 0.5,
    sheenColor: c.clone().lerp(new THREE.Color("#ffffff"), 0.3),
    normalMap: ribNormal(),
    normalScale: new THREE.Vector2(0.7, 0.7),
    side: THREE.DoubleSide,
    vertexColors: true,
  });
}

import * as THREE from "three";

const lines = (pts: number[]) => {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  return g;
};

/** Clean quad wireframe for a cylinder: horizontal rings + vertical meridians. */
export function cylinderGrid(r: number, h: number, rings = 8, meridians = 24, thetaStart = 0, thetaLength = Math.PI * 2, segs = 72) {
  const pts: number[] = [];
  const full = Math.abs(thetaLength - Math.PI * 2) < 1e-4;
  for (let i = 0; i <= rings; i++) {
    const y = -h / 2 + (h * i) / rings;
    for (let s = 0; s < segs; s++) {
      const a0 = thetaStart + (thetaLength * s) / segs;
      const a1 = thetaStart + (thetaLength * (s + 1)) / segs;
      pts.push(r * Math.sin(a0), y, r * Math.cos(a0), r * Math.sin(a1), y, r * Math.cos(a1));
    }
  }
  const count = full ? meridians : meridians + 1;
  for (let j = 0; j < count; j++) {
    const a = thetaStart + (thetaLength * j) / meridians;
    pts.push(r * Math.sin(a), -h / 2, r * Math.cos(a), r * Math.sin(a), h / 2, r * Math.cos(a));
  }
  return lines(pts);
}

/** Grid of lines in the XY plane, centred on the origin. */
export function rectGrid(w: number, h: number, nx: number, ny: number, inset = 0) {
  const pts: number[] = [];
  const x0 = -w / 2 + inset;
  const x1 = w / 2 - inset;
  const y0 = -h / 2 + inset;
  const y1 = h / 2 - inset;
  for (let i = 1; i < nx; i++) {
    const x = x0 + ((x1 - x0) * i) / nx;
    pts.push(x, y0, 0, x, y1, 0);
  }
  for (let j = 1; j < ny; j++) {
    const y = y0 + ((y1 - y0) * j) / ny;
    pts.push(x0, y, 0, x1, y, 0);
  }
  return lines(pts);
}

export function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** ShapeGeometry whose UVs span the shape's bounding box (0–1), so a texture maps edge to edge. */
export function shapeWithUV(shape: THREE.Shape, w: number, h: number, curveSegments = 24, cx = 0, cy = 0) {
  const g = new THREE.ShapeGeometry(shape, curveSegments);
  const pos = g.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = (pos.getX(i) - cx + w / 2) / w;
    uv[i * 2 + 1] = (pos.getY(i) - cy + h / 2) / h;
  }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return g;
}

/**
 * Sweeps an ellipse along a curve (like TubeGeometry, but the cross-section can be
 * oval and change size), e.g. a mug handle that flares where it joins the body.
 * `radius(t)` returns [radius along the curve normal, radius along the binormal].
 */
export function sweepEllipse(curve: THREE.Curve<THREE.Vector3>, segs: number, radial: number, radius: (t: number) => [number, number]) {
  const frames = curve.computeFrenetFrames(segs, false);
  const pos: number[] = [];
  const idx: number[] = [];
  const p = new THREE.Vector3();
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    curve.getPointAt(t, p);
    const [rn, rb] = radius(t);
    const nv = frames.normals[i];
    const bv = frames.binormals[i];
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      const c = -Math.cos(a) * rn;
      const s = Math.sin(a) * rb;
      pos.push(p.x + nv.x * c + bv.x * s, p.y + nv.y * c + bv.y * s, p.z + nv.z * c + bv.z * s);
    }
  }
  for (let i = 1; i <= segs; i++) {
    for (let j = 1; j <= radial; j++) {
      const a = (radial + 1) * (i - 1) + (j - 1);
      const b = (radial + 1) * i + (j - 1);
      const c = (radial + 1) * i + j;
      const d = (radial + 1) * (i - 1) + j;
      idx.push(a, b, d, b, c, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  // Close the shading seam where each ring starts and ends.
  const n = g.attributes.normal as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i <= segs; i++) {
    const a = (radial + 1) * i;
    const b = a + radial;
    v.set(n.getX(a) + n.getX(b), n.getY(a) + n.getY(b), n.getZ(a) + n.getZ(b)).normalize();
    n.setXYZ(a, v.x, v.y, v.z);
    n.setXYZ(b, v.x, v.y, v.z);
  }
  return g;
}

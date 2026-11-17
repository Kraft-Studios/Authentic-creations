"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * "Spilled ink" cursor. A drop of ink follows the pointer with a liquid tail,
 * swells and bubbles over anything clickable, flicks droplets when you move
 * fast, and splats (with drips) when you click. Drawn as GPU metaballs and
 * blended with `difference`, so it reads as black ink on white and white ink
 * on black.
 */
const MAX = 72;

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}`;
const FRAG = `precision highp float;
uniform vec3 uBalls[${MAX}];
uniform int uCount;
uniform float uTime;
uniform float uScale;
void main(){
  vec2 p = gl_FragCoord.xy / uScale;
  float f = 0.0;
  for (int i = 0; i < ${MAX}; i++) {
    if (i >= uCount) break;
    vec3 b = uBalls[i];
    vec2 d = p - b.xy;
    f += (b.z * b.z) / (dot(d, d) + 0.0001);
  }
  float wob = sin(p.x * 0.09 + uTime * 2.3) * sin(p.y * 0.08 - uTime * 1.7) * 0.08;
  float a = smoothstep(0.9, 1.1, f + wob);
  gl_FragColor = vec4(a, a, a, a);
}`;

type Drop = { x: number; y: number; vx: number; vy: number; r: number; life: number; decay: number; g: number };
type Splat = { x: number; y: number; t: number; parts: { dx: number; dy: number; r: number }[] };

const INTERACTIVE = "a,button,[data-cursor],input,select,textarea,label,[role='button'],[role='switch']";

export default function InkCursor() {
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const disabled = pathname?.startsWith("/studio");

  useEffect(() => {
    if (disabled) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current;
    if (!fine || reduced || !canvas) return;
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) return;

    // --- GL setup ---
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uBalls = gl.getUniformLocation(prog, "uBalls");
    const uCount = gl.getUniformLocation(prog, "uCount");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uScale = gl.getUniformLocation(prog, "uScale");
    const data = new Float32Array(MAX * 3);

    let W = 0;
    let H = 0;
    const scale = Math.min(window.devicePixelRatio || 1, 1.25);
    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * scale);
      canvas.height = Math.round(H * scale);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    document.documentElement.classList.add("ink-cursor");

    // --- simulation state ---
    const target = { x: W / 2, y: H / 2 };
    const head = { ...target };
    const trail = Array.from({ length: 8 }, () => ({ ...target }));
    let r = 0;
    let rTarget = 7;
    let visible = false;
    let hovering: Element | null = null;
    const drops: Drop[] = [];
    const splats: Splat[] = [];
    let last = performance.now();
    let raf = 0;
    let drewLast = false;

    const spawn = (x: number, y: number, vx: number, vy: number, rad: number, g = 0.25, decay = 0.02) => {
      if (drops.length > 26) drops.shift();
      drops.push({ x, y, vx, vy, r: rad, life: 1, decay, g });
    };

    const splash = (x: number, y: number, big: boolean) => {
      const n = big ? 11 : 6;
      const parts: Splat["parts"] = [{ dx: 0, dy: 0, r: big ? 24 : 15 }];
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + Math.random() * 0.5;
        const d = (big ? 20 : 12) + Math.random() * (big ? 26 : 14);
        parts.push({ dx: Math.cos(a) * d, dy: Math.sin(a) * d, r: (big ? 6 : 4) + Math.random() * (big ? 9 : 5) });
        if (big && Math.random() < 0.5) {
          // spikes
          const d2 = d + 14 + Math.random() * 14;
          parts.push({ dx: Math.cos(a) * d2, dy: Math.sin(a) * d2, r: 3 + Math.random() * 3 });
        }
      }
      if (splats.length > 2) splats.shift();
      splats.push({ x, y, t: 0, parts });
      const flicks = big ? 7 : 4;
      for (let i = 0; i < flicks; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = (big ? 4 : 2.5) + Math.random() * 4;
        spawn(x, y, Math.cos(a) * s, Math.sin(a) * s - (big ? 2 : 1), 3 + Math.random() * 4, 0.28, 0.018 + Math.random() * 0.01);
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const dx = e.clientX - target.x;
      const dy = e.clientY - target.y;
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) {
        visible = true;
        head.x = target.x;
        head.y = target.y;
        trail.forEach((t) => {
          t.x = target.x;
          t.y = target.y;
        });
      }
      const speed = Math.hypot(dx, dy);
      if (speed > 38 && Math.random() < 0.55) {
        // flick droplets off the back of a fast stroke
        spawn(head.x, head.y, -dx * 0.08 + (Math.random() - 0.5) * 2, -dy * 0.08 + (Math.random() - 0.5) * 2, 2.5 + Math.random() * 3, 0.18, 0.025);
      }
    };

    const onOver = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.(INTERACTIVE) ?? null;
      if (el === hovering) return;
      hovering = el;
      rTarget = el ? 26 : 7;
      const label = el instanceof HTMLElement ? el.dataset.cursor ?? "" : "";
      if (labelRef.current) labelRef.current.textContent = label;
      if (el) splash(target.x, target.y, false);
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      splash(e.clientX, e.clientY, true);
      r *= 0.6;
    };

    const onLeave = () => {
      visible = false;
    };

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 16.67, 3);
      last = now;
      const time = now / 1000;

      head.x += (target.x - head.x) * Math.min(1, 0.32 * dt);
      head.y += (target.y - head.y) * Math.min(1, 0.32 * dt);
      let prev = head;
      for (const t of trail) {
        t.x += (prev.x - t.x) * Math.min(1, 0.42 * dt);
        t.y += (prev.y - t.y) * Math.min(1, 0.42 * dt);
        prev = t;
      }
      r += ((visible ? rTarget : 0) - r) * Math.min(1, 0.16 * dt);

      let n = 0;
      // Bounding box of the ink, so only those pixels get shaded.
      let x0 = Infinity;
      let y0 = Infinity;
      let x1 = -Infinity;
      let y1 = -Infinity;
      const push = (x: number, y: number, rad: number) => {
        if (n >= MAX || rad <= 0.2) return;
        data[n * 3] = x;
        data[n * 3 + 1] = H - y;
        data[n * 3 + 2] = rad;
        n++;
        const m = rad * 3 + 10;
        if (x - m < x0) x0 = x - m;
        if (y - m < y0) y0 = y - m;
        if (x + m > x1) x1 = x + m;
        if (y + m > y1) y1 = y + m;
      };

      push(head.x, head.y, r);
      trail.forEach((t, i) => push(t.x, t.y, r * (0.42 - i * 0.04)));

      if (hovering && visible) {
        // ink bubbling around the swollen drop
        for (let i = 0; i < 4; i++) {
          const a = time * (1.1 + i * 0.23) + i * 1.7;
          const d = r * (0.72 + 0.12 * Math.sin(time * 2 + i));
          push(head.x + Math.cos(a) * d, head.y + Math.sin(a) * d, r * 0.36);
        }
      }

      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.vx *= 0.97;
        d.vy = d.vy * 0.97 + d.g * dt;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.life -= d.decay * dt;
        if (d.life <= 0) drops.splice(i, 1);
        else push(d.x, d.y, d.r * Math.pow(d.life, 0.5));
      }

      for (let i = splats.length - 1; i >= 0; i--) {
        const s = splats[i];
        s.t += 0.014 * dt;
        if (s.t >= 1) {
          splats.splice(i, 1);
          continue;
        }
        const k = Math.pow(1 - s.t, 0.7);
        const grow = Math.min(1, s.t * 9);
        s.parts.forEach((p) => push(s.x + p.dx * grow, s.y + p.dy * grow + s.t * 10, p.r * k));
      }

      if (labelRef.current) {
        labelRef.current.style.transform = `translate3d(${head.x + r + 12}px, ${head.y - 7}px, 0)`;
        labelRef.current.style.opacity = hovering && visible && labelRef.current.textContent ? "1" : "0";
      }

      if (n || drewLast) {
        gl.disable(gl.SCISSOR_TEST);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      if (n) {
        const sx = Math.max(0, Math.floor(x0 * scale));
        const sy = Math.max(0, Math.floor((H - y1) * scale));
        const sw = Math.min(canvas.width, Math.ceil(x1 * scale)) - sx;
        const sh = Math.min(canvas.height, Math.ceil((H - y0) * scale)) - sy;
        if (sw > 0 && sh > 0) {
          gl.enable(gl.SCISSOR_TEST);
          gl.scissor(sx, sy, sw, sh);
          gl.uniform3fv(uBalls, data);
          gl.uniform1i(uCount, n);
          gl.uniform1f(uTime, time);
          gl.uniform1f(uScale, scale);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
        }
      }
      drewLast = n > 0;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", resize);
      document.documentElement.classList.remove("ink-cursor");
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
      gl.clear(gl.COLOR_BUFFER_BIT);
    };
  }, [disabled]);

  if (disabled) return null;
  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[100] h-full w-full mix-blend-difference"
      />
      <span
        ref={labelRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[101] font-mono text-[11px] lowercase tracking-wider text-white opacity-0 mix-blend-difference transition-opacity duration-200"
      />
    </>
  );
}

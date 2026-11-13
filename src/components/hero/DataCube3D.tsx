import { useEffect, useRef } from "react";
import { gsap, MOTION_OK, ScrollTrigger } from "../../lib/gsap";

/**
 * Experimental 3D hero piece (enabled with ?hero=3d): a "data cube" made of small blocks.
 * Load: a scattered cloud assembles into a cube. Mouse: the cube turns toward the cursor.
 * Scroll: the cube breaks apart and settles into a 3D bar chart (data → visualization).
 * three.js is loaded on demand, only in this mode. Reduced motion: a still cube, no loop.
 */

const N = 8; // 8×8×8 = 512 blocks
const COUNT = N * N * N;
const GAP = 0.34;

// Bar chart target: an 8×8 grid of columns with smooth "data" heights.
function barHeight(ix: number, iz: number) {
  const v = 0.55 + 0.45 * Math.sin(ix * 0.7 + 0.6) * Math.cos(iz * 0.55 - 0.3) + ix * 0.05;
  return Math.max(1, Math.min(N, Math.round(v * N)));
}

export function DataCube3D() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let cleanup = () => {};

    import("three").then((THREE) => {
      if (disposed || !host) return;
      const reduced = !window.matchMedia(MOTION_OK).matches;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      host.appendChild(renderer.domElement);
      renderer.domElement.style.cssText = "width:100%;height:100%;display:block";

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
      camera.position.set(0, 0.6, 9);

      scene.add(new THREE.AmbientLight(0xffffff, 1.1));
      const sun = new THREE.DirectionalLight(0xffffff, 1.6);
      sun.position.set(4, 6, 5);
      scene.add(sun);

      const css = getComputedStyle(document.documentElement);
      const ink = new THREE.Color(css.getPropertyValue("--text").trim() || "#1f1b16");
      const accent = new THREE.Color(css.getPropertyValue("--accent").trim() || "#2438d4");
      const soft = ink.clone().lerp(new THREE.Color("#ffffff"), 0.55);

      const geo = new THREE.BoxGeometry(0.26, 0.26, 0.26);
      const mat = new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.05 });
      const mesh = new THREE.InstancedMesh(geo, mat, COUNT);
      const group = new THREE.Group();
      group.add(mesh);
      scene.add(group);

      // Three formations per block: cloud → cube → bars.
      const cloud = new Float32Array(COUNT * 3);
      const cube = new Float32Array(COUNT * 3);
      const bars = new Float32Array(COUNT * 3);
      const barScale = new Float32Array(COUNT); // 0 = hidden in the bar chart
      const half = ((N - 1) * GAP) / 2;
      let i = 0;
      for (let x = 0; x < N; x++)
        for (let y = 0; y < N; y++)
          for (let z = 0; z < N; z++, i++) {
            const r = 3.2 * Math.cbrt(Math.random());
            const th = Math.random() * Math.PI * 2;
            const ph = Math.acos(2 * Math.random() - 1);
            cloud.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)], i * 3);
            cube.set([x * GAP - half, y * GAP - half, z * GAP - half], i * 3);
            const h = barHeight(x, z);
            bars.set([x * GAP * 1.25 - half * 1.25, y * GAP - half, z * GAP * 1.25 - half * 1.25], i * 3);
            barScale[i] = y < h ? 1 : 0;
            const color = y === h - 1 && x === N - 1 ? accent : (x + z) % 7 === 0 && y === h - 1 ? accent : (x + y + z) % 5 === 0 ? soft : ink;
            mesh.setColorAt(i, color);
          }
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

      const state = { assemble: reduced ? 1 : 0, chart: 0 };
      const dummy = new THREE.Object3D();
      const pose = () => {
        const a = state.assemble;
        const c = state.chart;
        for (let k = 0; k < COUNT; k++) {
          const o = k * 3;
          // cloud → cube by `assemble`, cube → bars by `chart`.
          const cx = cloud[o] + (cube[o] - cloud[o]) * a;
          const cy = cloud[o + 1] + (cube[o + 1] - cloud[o + 1]) * a;
          const cz = cloud[o + 2] + (cube[o + 2] - cloud[o + 2]) * a;
          dummy.position.set(cx + (bars[o] - cx) * c, cy + (bars[o + 1] - cy) * c, cz + (bars[o + 2] - cz) * c);
          const s = 1 + (barScale[k] - 1) * c;
          dummy.scale.setScalar(Math.max(0.0001, s));
          dummy.updateMatrix();
          mesh.setMatrixAt(k, dummy.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;
      };

      const resize = () => {
        const w = host.clientWidth;
        const h = host.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / Math.max(1, h);
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(host);

      // Mouse: target rotation; the cube eases toward it.
      const target = { rx: -0.35, ry: 0.6 };
      const onMove = (e: PointerEvent) => {
        target.ry = 0.6 + (e.clientX / window.innerWidth - 0.5) * 1.2;
        target.rx = -0.35 + (e.clientY / window.innerHeight - 0.5) * 0.6;
      };
      if (!reduced) window.addEventListener("pointermove", onMove, { passive: true });
      group.rotation.set(target.rx, target.ry, 0);

      const tweens: Array<gsap.core.Tween | ScrollTrigger> = [];
      if (!reduced) {
        tweens.push(gsap.to(state, { assemble: 1, duration: 2.2, ease: "expo.out", delay: 0.4 }));
        tweens.push(
          ScrollTrigger.create({
            trigger: host.closest("section"),
            start: "top top",
            end: "bottom top",
            scrub: 0.8,
            onUpdate: (self) => {
              state.chart = gsap.parseEase("power2.inOut")(self.progress);
            },
          }),
        );
      }

      // Render only while the hero is on screen.
      let raf = 0;
      let visible = true;
      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !raf && !reduced) raf = requestAnimationFrame(loop);
      });
      io.observe(host);
      const loop = () => {
        raf = 0;
        group.rotation.x += (target.rx - group.rotation.x) * 0.06;
        group.rotation.y += (target.ry + state.chart * 0.5 - group.rotation.y) * 0.06;
        pose();
        renderer.render(scene, camera);
        if (visible) raf = requestAnimationFrame(loop);
      };
      pose();
      renderer.render(scene, camera);
      if (!reduced) raf = requestAnimationFrame(loop);

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        window.removeEventListener("pointermove", onMove);
        tweens.forEach((t) => t.kill());
        geo.dispose();
        mat.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <div ref={hostRef} className="pointer-events-none absolute inset-0" aria-hidden="true" />;
}

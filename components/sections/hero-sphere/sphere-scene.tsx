"use client";

import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export type SphereSceneProps = {
  /** Render loop on/off (off while the hero is off screen) */
  active: boolean;
  /** Reduced motion: one still frame, no spin */
  still: boolean;
  /** Sphere diameter as a share of the shorter screen side (1 = touches top and bottom on desktop) */
  fill: number;
  /** Base opacity of the whole layer; the scene fades it further while scrolling away */
  opacity: number;
  /** The wrapper element whose opacity is driven per frame */
  layerRef: MutableRefObject<HTMLDivElement | null>;
  /** Called after the first frame is drawn, so the layer can fade in */
  onReady: () => void;
};

const RADIUS = 1;
/** Icosahedron detail 4 = a geodesic sphere with 252 nodes and 750 struts (like the reference) */
const DETAIL = 4;
const FOV = 35;
const BG = "#030712";

/** Unique vertices and edges of a geodesic sphere (three's icosahedron is non-indexed, so merge by position). */
function buildGeodesic(): { nodes: THREE.Vector3[]; edges: [number, number][] } {
  const geo = new THREE.IcosahedronGeometry(RADIUS, DETAIL);
  const pos = geo.getAttribute("position");
  const key = (i: number): string =>
    `${pos.getX(i).toFixed(4)},${pos.getY(i).toFixed(4)},${pos.getZ(i).toFixed(4)}`;
  const index = new Map<string, number>();
  const nodes: THREE.Vector3[] = [];
  const ids: number[] = [];
  for (let i = 0; i < pos.count; i++) {
    const k = key(i);
    let id = index.get(k);
    if (id === undefined) {
      id = nodes.length;
      index.set(k, id);
      nodes.push(new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)));
    }
    ids.push(id);
  }
  const seen = new Set<string>();
  const edges: [number, number][] = [];
  for (let t = 0; t < ids.length; t += 3) {
    const tri = [ids[t], ids[t + 1], ids[t + 2]];
    for (let e = 0; e < 3; e++) {
      const a = Math.min(tri[e], tri[(e + 1) % 3]);
      const b = Math.max(tri[e], tri[(e + 1) % 3]);
      const k = `${a}-${b}`;
      if (a !== b && !seen.has(k)) {
        seen.add(k);
        edges.push([a, b]);
      }
    }
  }
  geo.dispose();
  return { nodes, edges };
}

const clamp = (v: number, a: number, b: number): number => Math.min(b, Math.max(a, v));
const outCubic = (t: number): number => 1 - (1 - t) ** 3;

/**
 * Glass-blue geodesic sphere: glossy nodes joined by thin struts. Two instanced meshes = two draw
 * calls. Fog fades the far side into the page colour, which gives the depth.
 * Motion (all in one useFrame, no React state):
 * - constant slow spin, plus a short intro (grows in and spins up on load)
 * - scroll: spins faster in the scroll direction (up reverses it), rises, grows and tilts as the hero
 *   scrolls away, and the layer fades out
 * - mouse: a gentle tilt toward the pointer
 */
function GeodesicSphere({ still, fill, opacity, layerRef }: Pick<SphereSceneProps, "still" | "fill" | "opacity" | "layerRef">) {
  const group = useRef<THREE.Group>(null);
  const nodesRef = useRef<THREE.InstancedMesh>(null);
  const strutsRef = useRef<THREE.InstancedMesh>(null);
  const { camera, size, scene } = useThree();
  const { nodes, edges } = useMemo(buildGeodesic, []);

  // Place every node and strut once; afterwards only the group transform changes.
  useEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);
    const dir = new THREE.Vector3();
    const mid = new THREE.Vector3();
    nodes.forEach((p, i) => {
      m.makeTranslation(p.x, p.y, p.z);
      nodesRef.current?.setMatrixAt(i, m);
    });
    edges.forEach(([a, b], i) => {
      dir.subVectors(nodes[b], nodes[a]);
      const len = dir.length();
      mid.addVectors(nodes[a], nodes[b]).multiplyScalar(0.5);
      q.setFromUnitVectors(up, dir.normalize());
      s.set(1, len, 1);
      m.compose(mid, q, s);
      strutsRef.current?.setMatrixAt(i, m);
    });
    if (nodesRef.current) nodesRef.current.instanceMatrix.needsUpdate = true;
    if (strutsRef.current) strutsRef.current.instanceMatrix.needsUpdate = true;
  }, [nodes, edges]);

  // Camera distance so the sphere fills `fill` of the shorter side; fog spans the sphere's depth.
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / Math.max(1, size.height);
    const t = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    // on portrait screens the sphere is allowed to bleed past the sides, so it still feels big
    const f = aspect < 1 ? fill * 1.35 : fill;
    const z = RADIUS / (f * t * Math.min(1, aspect));
    cam.position.set(0, 0, z);
    cam.near = 0.1;
    cam.far = z + 10;
    cam.updateProjectionMatrix();
    scene.fog = new THREE.Fog(BG, z - RADIUS * 0.9, z + RADIUS * 1.35);
  }, [camera, size, fill, scene]);

  // Motion state lives in refs: the frame loop never touches React.
  const st = useRef({ start: -1, spin: 0, spinVel: 0.14, lastY: 0, vel: 0, px: 0, py: 0, tx: 0, ty: 0, op: -1 });

  useEffect(() => {
    if (still) return;
    st.current.lastY = window.scrollY;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;
    const onMove = (e: PointerEvent): void => {
      st.current.px = (e.clientX / window.innerWidth) * 2 - 1;
      st.current.py = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [still]);

  useFrame((state, rawDelta) => {
    const g = group.current;
    if (!g) return;
    const s = st.current;
    const delta = Math.min(rawDelta, 1 / 20); // no jumps after a tab switch
    const vh = window.innerHeight || 1;
    const y = window.scrollY;
    const progress = clamp(y / vh, 0, 1.2); // 0 at the top, 1 when the hero has scrolled away

    if (still) {
      g.rotation.set(0.38, 0.6, 0.12);
      return;
    }

    // Intro: grows in from 82% and spins up over ~2.4s
    if (s.start < 0) s.start = state.clock.elapsedTime;
    const intro = outCubic(clamp((state.clock.elapsedTime - s.start) / 2.4, 0, 1));

    // Scroll velocity (px/s), smoothed; direction aware
    const rawVel = (y - s.lastY) / Math.max(delta, 1e-3);
    s.lastY = y;
    s.vel += (rawVel - s.vel) * (1 - Math.exp(-delta * 6));
    const targetSpin = 0.14 + clamp(s.vel * 0.0011, -2.2, 2.2) + (1 - intro) * 1.4;
    s.spinVel += (targetSpin - s.spinVel) * (1 - Math.exp(-delta * 3.5));
    s.spin += s.spinVel * delta;

    // Pointer tilt, eased
    s.tx += (s.py * 0.12 - s.tx) * (1 - Math.exp(-delta * 2.5));
    s.ty += (s.px * 0.18 - s.ty) * (1 - Math.exp(-delta * 2.5));

    const p = outCubic(clamp(progress, 0, 1));
    g.rotation.set(0.38 + s.tx + p * 0.55, s.spin + s.ty, 0.12 - p * 0.18);
    const scale = (0.82 + 0.18 * intro) * (1 + p * 0.32);
    g.scale.setScalar(scale);
    g.position.y = p * 0.55;

    // Layer opacity: fades in with the intro, fades out as the hero scrolls away
    const op = opacity * intro * (1 - p * 0.75);
    if (layerRef.current && Math.abs(op - s.op) > 0.004) {
      layerRef.current.style.opacity = op.toFixed(3);
      s.op = op;
    }
  });

  return (
    <group ref={group}>
      <instancedMesh ref={nodesRef} args={[undefined, undefined, nodes.length]} frustumCulled={false}>
        <sphereGeometry args={[0.026, 14, 10]} />
        <meshStandardMaterial color="#4a7dff" emissive="#1f38d8" emissiveIntensity={0.45} metalness={0.35} roughness={0.2} />
      </instancedMesh>
      <instancedMesh ref={strutsRef} args={[undefined, undefined, edges.length]} frustumCulled={false}>
        <cylinderGeometry args={[0.0048, 0.0048, 1, 6, 1, true]} />
        <meshStandardMaterial color="#6aa8ff" emissive="#2f6bff" emissiveIntensity={0.7} metalness={0.2} roughness={0.35} />
      </instancedMesh>
    </group>
  );
}

/** Starts the frame loop once something is drawn, then reports ready. */
function ReadySignal({ onReady }: { onReady: () => void }) {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    requestAnimationFrame(onReady);
  });
  return null;
}

export default function SphereScene({ active, still, fill, opacity, layerRef, onReady }: SphereSceneProps) {
  return (
    <Canvas
      frameloop={still ? "demand" : active ? "always" : "never"}
      dpr={[1, 1.75]}
      camera={{ fov: FOV, position: [0, 0, 4] }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[2.5, 3, 4]} intensity={2.4} color="#dfe8ff" />
      <pointLight position={[-3, -1.5, 2.5]} intensity={7} color="#7b61ff" />
      <pointLight position={[3, -2, 1.5]} intensity={4} color="#22d8ff" />
      <GeodesicSphere still={still} fill={fill} opacity={opacity} layerRef={layerRef} />
      <ReadySignal onReady={onReady} />
    </Canvas>
  );
}

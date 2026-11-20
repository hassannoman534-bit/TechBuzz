"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { BLOG_FIELD } from "./blog.config";

export type BlogFieldProps = {
  /** Render loop on/off. Off while the hero is scrolled out of view. */
  active: boolean;
  /** Reduced motion: one still frame, no drift, no spin, no parallax. */
  still: boolean;
};

/**
 * Per-instance animation lives in the vertex shader, so the only thing the CPU
 * touches per frame is one float uniform and the group's rotation. No instance
 * matrices are rebuilt or re-uploaded after the first frame.
 */
const VERT = /* glsl */ `
  attribute float aSeed;
  attribute vec3 aColor;

  uniform float uTime;
  uniform float uNear;
  uniform float uFar;
  uniform float uDrift;
  uniform float uSpan;

  varying vec2 vUv;
  varying vec3 vColor;
  varying float vFade;
  varying float vFacing;

  void main() {
    vUv = uv;
    vColor = aColor;

    // Each plate turns on its own axis at its own rate, so the field never
    // reads as one rigid object rotating.
    float a = uTime * (0.04 + aSeed * 0.11) + aSeed * 6.2831;
    float s = sin(a);
    float c = cos(a);
    mat2 spin = mat2(c, -s, s, c);

    vec3 p = position;
    p.xz = spin * p.xz;

    vec4 world = instanceMatrix * vec4(p, 1.0);

    // Slow upward drift that wraps, so the field is endless without ever
    // allocating a new instance.
    //
    // The wrap has to be worked out from the instance's own origin, not from
    // each vertex. Taking mod() of a vertex position tears the quad apart the
    // moment one corner crosses the boundary and the others have not: the
    // corner jumps a full span away and the plate renders as a line across
    // the whole field.
    float baseY = instanceMatrix[3][1];
    float halfSpan = uSpan * 0.5;
    float wrappedY = mod(baseY + uTime * uDrift + aSeed * uSpan + halfSpan, uSpan) - halfSpan;
    world.y += wrappedY - baseY;

    vec4 mv = modelViewMatrix * world;

    // Depth fade doubles as the fog: plates dissolve into the page colour
    // rather than clipping at the far plane.
    float depth = -mv.z;
    vFade = smoothstep(uFar, uFar - 1.5, depth) * smoothstep(uNear, uNear + 1.2, depth);

    // A plate seen exactly edge on is one hard pixel-wide line across the
    // screen, which looks like a rendering fault rather than a reflection.
    // Fading by facing angle also gives the field its glint, because a plate
    // brightens as it turns towards the camera.
    vec3 nLocal = normal;
    nLocal.xz = spin * nLocal.xz;
    vec3 nView = normalize(mat3(modelViewMatrix) * mat3(instanceMatrix) * nLocal);
    float facing = abs(dot(nView, normalize(-mv.xyz)));
    vFacing = smoothstep(0.05, 0.62, facing);

    gl_Position = projectionMatrix * mv;
  }
`;

/**
 * A rounded-rectangle rim in UV space. One draw call produces the whole
 * "glass slide with a lit edge" look, with no second mesh for the outline and
 * no texture to download.
 */
const FRAG = /* glsl */ `
  precision mediump float;

  uniform float uOpacity;

  varying vec2 vUv;
  varying vec3 vColor;
  varying float vFade;
  varying float vFacing;

  void main() {
    vec2 q = abs(vUv - 0.5) * 2.0;
    float edge = max(q.x, q.y);

    // A wide, soft rim rather than a hairline outline: at this scale a hard
    // 1px border reads as wireframe, which is the wrong material entirely.
    float rim = smoothstep(0.42, 1.0, edge);
    rim *= rim;
    float corner = smoothstep(1.06, 0.74, length(max(q - 0.72, 0.0)));

    // A faint sheet of light across the plate, so the middle is glass rather
    // than a hole.
    float sheet = 0.085 * (1.0 - edge * 0.45);

    float alpha = (sheet + rim * 0.34) * corner * vFade * vFacing * uOpacity;
    if (alpha < 0.0015) discard;

    vec3 rgb = vColor * (0.42 + rim * 1.1);
    gl_FragColor = vec4(rgb, alpha);
  }
`;

const PALETTE: readonly [string, number][] = [
  ["#5b7cff", 0.42],
  ["#7b61ff", 0.24],
  ["#22d8ff", 0.18],
  ["#c9c2ff", 0.11],
  ["#2cf5b0", 0.05],
];

function pickColor(rand: () => number): THREE.Color {
  let r = rand();
  for (const [hex, weight] of PALETTE) {
    if (r < weight) return new THREE.Color(hex);
    r -= weight;
  }
  return new THREE.Color(PALETTE[0][0]);
}

/** Deterministic, so the server and client agree and the field never "jumps". */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Plates({ still }: { still: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const { size } = useThree();

  // Fewer plates on a phone: same composition, a third of the fragments.
  const count = size.width < 820 ? BLOG_FIELD.countMobile : BLOG_FIELD.count;

  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1.38);
    const rand = mulberry32(0x7b61ff);

    const seeds = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      seeds[i] = rand();
      const c = pickColor(rand);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    g.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 1));
    g.setAttribute("aColor", new THREE.InstancedBufferAttribute(colors, 3));
    return g;
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: BLOG_FIELD.opacity },
          uNear: { value: BLOG_FIELD.near },
          uFar: { value: BLOG_FIELD.far },
          uDrift: { value: BLOG_FIELD.drift },
          uSpan: { value: BLOG_FIELD.span },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    [],
  );

  // Placement runs once. After this the CPU never writes to the matrix buffer.
  useEffect(() => {
    const m = mesh.current;
    if (!m) return;

    const rand = mulberry32(0x22d8ff);
    const dummy = new THREE.Object3D();
    const half = BLOG_FIELD.span * 0.5;

    for (let i = 0; i < count; i++) {
      // Depth first, so scale and spread can follow from it.
      const z = -2.6 - rand() * 8.4;
      const spread = 3 + -z * 0.58;

      dummy.position.set(
        (rand() - 0.5) * spread * 2,
        (rand() - 0.5) * BLOG_FIELD.span,
        z,
      );
      dummy.rotation.set(
        (rand() - 0.5) * 0.9,
        rand() * Math.PI * 2,
        (rand() - 0.5) * 0.55,
      );
      // Scale grows with distance so every plate covers roughly the same area
      // on screen. Without this the nearest few dominate the composition.
      const s = 0.2 + rand() * 0.34 + -z * 0.085;
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }

    m.instanceMatrix.needsUpdate = true;
    m.frustumCulled = false;
  }, [count]);

  // Pointer parallax, read from a ref so a moving mouse never re-renders React.
  useEffect(() => {
    if (still) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [still]);

  useFrame((state, delta) => {
    if (still) return;

    // Clamped so a backgrounded tab does not resume with a jump.
    material.uniforms.uTime.value += Math.min(delta, 0.05);

    const g = group.current;
    if (!g) return;
    const k = 1 - Math.pow(0.0015, delta);
    g.rotation.y += (pointer.current.x * BLOG_FIELD.parallax - g.rotation.y) * k;
    g.rotation.x += (pointer.current.y * BLOG_FIELD.parallax * 0.6 - g.rotation.x) * k;
  });

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  return (
    <group ref={group}>
      <instancedMesh
        ref={mesh}
        args={[geometry, material, count]}
        // A still frame still needs the shader to run once at t=0.
        renderOrder={0}
      />
    </group>
  );
}

/**
 * The drifting plate field behind the blog masthead.
 *
 * One instanced mesh, one shader, one draw call. Nothing in the loop allocates
 * and nothing in it touches React state, so scrolling the page does not
 * contend with the render loop.
 */
export default function BlogField({ active, still }: BlogFieldProps) {
  return (
    <Canvas
      // Capped so a 3x phone does not shade nine times the fragments a 1x one does.
      dpr={[1, 1.4]}
      // Reduced motion draws exactly one frame and then stops for good.
      frameloop={still ? "demand" : active ? "always" : "never"}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: "low-power",
        stencil: false,
        depth: true,
      }}
      camera={{ fov: 42, position: [0, 0, 7], near: 0.1, far: 40 }}
      style={{ pointerEvents: "none" }}
    >
      <Plates still={still} />
    </Canvas>
  );
}

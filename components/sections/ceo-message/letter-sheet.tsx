"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";
import { LETTER_MOTION, SHEET } from "./belief-letter.config";
import { paintLetter, type LetterFonts } from "./paint-letter";

/**
 * The sheet: one mesh, one texture, one draw call.
 *
 * Why WebGL and not CSS. A sheet of paper has to bend, and CSS can only apply a
 * flat projective transform to a flat box; there is no per vertex deformation,
 * so a CSS sheet can be tilted but never curled. On top of that, this page has
 * already been through the Chrome bug where text under a CSS perspective
 * renders half sheared, which is why the message block above is built from
 * affine transforms. Baking the letter into a texture sidesteps that entirely:
 * the type is rasterised once, upright, and from then on it is an image, and
 * images warp correctly.
 *
 * Lighting is modulation, not illumination. The stock is painted already lit,
 * and the shader only adds the part that has to respond to the bend: a wide
 * specular sheen and a gentle diffuse term. Paper lit from zero by a lambert
 * term goes grey, and grey paper looks like cardboard.
 */

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uCurl;
  uniform float uIdle;
  uniform float uIdleSpeed;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying float vCurve;

  void main() {
    vUv = uv;

    float W = ${SHEET.worldW.toFixed(4)};
    float H = ${SHEET.worldH.toFixed(4)};

    // Normalised sheet coordinates, 0 to 1, left to right and bottom to top.
    float u = position.x / W + 0.5;
    float v = position.y / H + 0.5;

    // Cylindrical curl about the vertical axis. Zero on the centre line, most
    // at the two vertical edges, which is how a held sheet actually falls.
    float cu = (u - 0.5);
    float curlZ = uCurl * cu * cu * 4.0;

    // Slow breathing across the stock, weighted to the top where paper is free.
    float phase = u * 3.1 + v * 1.7 + uTime * uIdleSpeed;
    float weight = 0.25 + 0.75 * v;
    float waveZ = uIdle * sin(phase) * weight;

    float z = curlZ + waveZ;

    // Analytic normal. Taking it from the derivatives of the displacement is
    // exact and costs two cosines, where recomputing it from neighbouring
    // vertices would need the geometry re-sent every frame.
    float dzdu = uCurl * 8.0 * cu + uIdle * cos(phase) * 3.1 * weight;
    float dzdv = uIdle * (cos(phase) * 1.7 * weight + sin(phase) * 0.75);
    vec3 n = normalize(vec3(-dzdu / W, -dzdv / H, 1.0));

    vNormal = normalize(normalMatrix * n);
    vCurve = abs(dzdu);

    vec3 displaced = vec3(position.x, position.y, position.z + z);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uLightDir;
  uniform float uSheenSpread;
  uniform float uSheenStrength;
  uniform float uGrain;
  uniform vec3 uStock;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying float vCurve;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    vec3 N = normalize(vNormal);
    vec3 L = normalize(uLightDir);
    // Orthographic enough at this focal length to treat the eye as straight on.
    vec3 V = vec3(0.0, 0.0, 1.0);

    vec3 base;
    if (gl_FrontFacing) {
      base = texture2D(uMap, vUv).rgb;
    } else {
      // The back of the sheet. Stock, with the ink showing faintly through it,
      // mirrored, because that is what you see when you turn a page over.
      vec3 through = texture2D(uMap, vec2(1.0 - vUv.x, vUv.y)).rgb;
      base = mix(uStock, through, 0.08) * 0.97;
      N = -N;
    }

    // Diffuse as modulation only: the stock is painted lit, this just answers
    // the bend. Floor at 0.82 so a curled edge darkens without going muddy.
    float lambert = max(dot(N, L), 0.0);
    float shade = 0.82 + 0.18 * lambert;

    // One broad sheen. Paper is not glossy, so the lobe is wide and weak.
    vec3 Hv = normalize(L + V);
    float spec = pow(max(dot(N, Hv), 0.0), uSheenSpread) * uSheenStrength;

    // Where the sheet bends hardest it loses a little light to itself.
    float selfShade = 1.0 - clamp(vCurve * 0.1, 0.0, 0.08);

    vec3 col = base * shade * selfShade + spec;

    // Fibre. Fine, warm, and low enough that it reads as stock, not as noise.
    float g = hash(vUv * 2048.0) - 0.5;
    col += vec3(g * uGrain, g * uGrain * 0.92, g * uGrain * 0.78);

    gl_FragColor = vec4(col, 1.0);
  }
`;

type SheetProps = {
  fonts: LetterFonts;
  /** Section scroll progress, read in the frame loop so it never re renders. */
  progress: MotionValue<number>;
  pointer: React.RefObject<{ x: number; y: number; active: boolean; hover: boolean }>;
};

/**
 * Written out rather than inferred. The config is `as const`, so inferring this
 * from the initial values types every uniform as the literal it started at and
 * the frame loop cannot assign to any of them.
 */
type Uniforms = {
  uMap: { value: THREE.Texture };
  uTime: { value: number };
  uCurl: { value: number };
  uIdle: { value: number };
  uIdleSpeed: { value: number };
  uLightDir: { value: THREE.Vector3 };
  uSheenSpread: { value: number };
  uSheenStrength: { value: number };
  uGrain: { value: number };
  uStock: { value: THREE.Color };
};

function Sheet({ fonts, progress, pointer }: SheetProps): React.ReactElement {
  const mesh = useRef<THREE.Mesh>(null);
  const { gl, viewport } = useThree();

  // Painted once. The texture is the expensive part of this component and it
  // never changes, so it is built on mount and disposed on unmount.
  const texture = useMemo(() => {
    const tex = new THREE.CanvasTexture(paintLetter(fonts));
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    tex.needsUpdate = true;
    return tex;
  }, [fonts, gl]);

  useEffect(() => () => texture.dispose(), [texture]);

  const uniforms = useMemo<Uniforms>(
    () => ({
      uMap: { value: texture },
      uTime: { value: 0 },
      uCurl: { value: 0 },
      uIdle: { value: LETTER_MOTION.idleAmp },
      uIdleSpeed: { value: LETTER_MOTION.idleSpeedS },
      uLightDir: { value: new THREE.Vector3(...LETTER_MOTION.lightDir).normalize() },
      uSheenSpread: { value: LETTER_MOTION.sheenSpread },
      uSheenStrength: { value: LETTER_MOTION.sheenStrength },
      uGrain: { value: LETTER_MOTION.grain },
      uStock: { value: new THREE.Color("#efe8d9") },
    }),
    [texture],
  );

  // Spring state lives in refs. A sheet that re rendered React on every frame
  // of its own settle would cost more than the shader it is driving.
  const rot = useRef<{ x: number; y: number }>({ x: LETTER_MOTION.restX, y: LETTER_MOTION.restY });
  const vel = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lift = useRef(0);

  useFrame((state, rawDelta) => {
    const m = mesh.current;
    if (!m) return;

    // A tab that was backgrounded hands back one enormous delta. Left
    // unclamped it throws the spring across its own travel in a single step.
    const dt = Math.min(rawDelta, 1 / 30);
    const p = pointer.current;

    const targetX = p?.active
      ? LETTER_MOTION.restX + p.y * LETTER_MOTION.dragRangeX
      : LETTER_MOTION.restX;
    const targetY = p?.active
      ? LETTER_MOTION.restY + p.x * LETTER_MOTION.dragRangeY
      : LETTER_MOTION.restY;

    const k = LETTER_MOTION.stiffness;
    const c = 2 * Math.sqrt(k) * LETTER_MOTION.damping;

    (["x", "y"] as const).forEach((axis) => {
      const target = axis === "x" ? targetX : targetY;
      const accel = k * (target - rot.current[axis]) - c * vel.current[axis];
      vel.current[axis] += accel * dt;
      rot.current[axis] += vel.current[axis] * dt;
    });

    rot.current.x = THREE.MathUtils.clamp(rot.current.x, -LETTER_MOTION.maxX, LETTER_MOTION.maxX);
    rot.current.y = THREE.MathUtils.clamp(rot.current.y, -LETTER_MOTION.maxY, LETTER_MOTION.maxY);

    // Scroll gives the sheet a small rise and turn as the section crosses, so
    // it is already in motion before anyone touches it.
    const sp = progress.get();
    const centred = (sp - 0.5) * 2;

    m.rotation.x = rot.current.x + centred * LETTER_MOTION.scrollTurn * 0.35;
    m.rotation.y = rot.current.y + centred * LETTER_MOTION.scrollTurn;
    m.position.y = -centred * LETTER_MOTION.scrollRiseVh * viewport.height * 0.5;

    const wantLift = p?.hover ? LETTER_MOTION.hoverLift : 0;
    lift.current += (wantLift - lift.current) * Math.min(1, dt * 7);
    m.position.z = lift.current;

    // Paper bends as it is lifted: curl tracks the turn away from rest.
    const turn = Math.abs(rot.current.y - LETTER_MOTION.restY) + Math.abs(rot.current.x - LETTER_MOTION.restX);
    uniforms.uCurl.value = turn * LETTER_MOTION.curlFromTurn;
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uSheenStrength.value =
      LETTER_MOTION.sheenStrength * (1 + (p?.hover ? LETTER_MOTION.hoverSheen : 0));
  });

  return (
    <mesh ref={mesh}>
      <planeGeometry args={[SHEET.worldW, SHEET.worldH, SHEET.segX, SHEET.segY]} />
      <shaderMaterial
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export type LetterSheetProps = {
  fonts: LetterFonts;
  progress: MotionValue<number>;
  pointer: React.RefObject<{ x: number; y: number; active: boolean; hover: boolean }>;
  /** True only while the sheet is actually on screen. Drives the render loop. */
  onScreen: boolean;
  onLost?: () => void;
};

/**
 * Canvas host. Kept separate so the section can mount and unmount it on
 * visibility without the section itself re rendering.
 */
export function LetterSheet({
  fonts,
  progress,
  pointer,
  onScreen,
  onLost,
}: LetterSheetProps): React.ReactElement {
  const hostRef = useRef<HTMLDivElement>(null);

  // A lost context on this page has history: the liquid headlines needed a
  // recovery path because Chrome never fired the restore event. Here the sheet
  // is replaceable by a static letter, so losing it just reports upward.
  useEffect(() => {
    const el = hostRef.current?.querySelector("canvas");
    if (!el || !onLost) return;
    const handle = (e: Event): void => {
      e.preventDefault();
      onLost();
    };
    el.addEventListener("webglcontextlost", handle);
    return () => el.removeEventListener("webglcontextlost", handle);
  }, [onLost]);

  return (
    <div ref={hostRef} className="h-full w-full">
      <Canvas
        /*
          The loop stops dead when the sheet is not on screen.

          R3F defaults to rendering every frame for as long as the canvas
          exists, so without this the sheet carried on shading itself for the
          whole rest of the page once the reader had scrolled past it. Measured
          over one scripted scroll at 4x throttle, that was the difference
          between 12.2s and 1.1s of main thread task time.

          Never, rather than unmounting: the context is kept, so coming back to
          the sheet costs nothing and there is no risk of thrashing a context
          on a page that has already had to be trimmed to two of them.
        */
        frameloop={onScreen ? "always" : "never"}
        // Two is the point past which the extra samples are not visible on this
        // kind of surface, and the texture is already oversampled.
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        // 3.0 puts the sheet at about 82% of the frame height. 3.35 left it at
        // 74% and the letter read as a small card floating in a large dark box.
        // Closer than this and a corner clips when the sheet is turned to its
        // limit, because the near edge gains about 13% from the perspective.
        camera={{ fov: 32, position: [0, 0, 3.0], near: 0.1, far: 20 }}
        style={{ touchAction: "pan-y" }}
      >
        <Sheet fonts={fonts} progress={progress} pointer={pointer} />
      </Canvas>
    </div>
  );
}

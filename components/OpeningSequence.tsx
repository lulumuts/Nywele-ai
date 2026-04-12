'use client';

/**
 * Opening sequence WebGL: vanilla three.js for `Final-nywele.glb`.
 *
 * GLB layout (Khronos Blender I/O): meshes `Base-model`, `main-wireframe`, `Cube`, `Plane`.
 * We hide `Cube` / `Plane`. The file ships KHR clearcoat/specular/ior on the base mesh and
 * emissive wireframe geometry — scene.environment (PMREM DataTexture IBL), clearcoat on base mesh (no transmission).
 * Wire overlay: world-space triplanar grid `ShaderMaterial` on a cloned mesh (silhouette conformant; hidden source mesh, same local transform + light scale bump). Helpers + baked `main-wireframe` removed.
 * Grid overlay: triplanar mesh + light “HUD” read (drift, dual sweep, cyan-tinted rim), warm orange base; post CA / scan / vignette / grain.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import * as THREE from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { APP_PAGE_BACKGROUND } from '@/lib/app-theme';
import {
  getIntroContentHoldPending,
  INTRO_HOLD_CONTENT_MAX_SEC,
  OPENING_CROSSFADE_SEC,
  setIntroContentHoldPending,
} from '@/lib/intro-crossfade';

/** Cache-bust so browser picks up replaced `public/Final-nywele.glb`. Bump when asset changes. */
const BUST_GLB_PATH = '/Final-nywele.glb?v=4';
const OVERLAY_Z = 400_000;
const WIRE_OVERLAY_NAME = '__wireframe_overlay__';
/** Grid line base — deep saturated orange for cream plate contrast. */
const WIRE_FRAME_COLOR = 0xc76f16 as const;
/** Grid line visibility vs layered look on the cream plate. */
const WIRE_PEAK_OPACITY = 0.84;
/** Slight inflate on top of source mesh scale so lines sit above z-fights; keeps full `scale.copy` from GLB. */
const WIRE_SHELL_SCALE = 1.001;
/** Raise the final clip/sweep floor by this fraction of mesh height so the bust reads shorter (upper-chest cut like the reference). */
const BUST_BOTTOM_TRIM_RATIO = 0.14;
/** Camera look-at Y (world). Lower values move the bust toward the top of the viewport. */
const OPENING_LOOK_AT_Y = 0.38;

const DRACO_DECODER_PATH = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';

/** Alpha-aware RGB shift: skips transparent pixels so CA does not sample empty buffer (green fringing). */
const SafeRGBShiftShader = {
  name: 'SafeRGBShiftShader',
  uniforms: {
    tDiffuse: { value: null },
    amount: { value: 0.0003 },
    angle: { value: 0.0 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float amount;
    uniform float angle;
    varying vec2 vUv;
    void main() {
      vec4 center = texture2D(tDiffuse, vUv);

      if (center.a < 0.01) {
        gl_FragColor = center;
        return;
      }

      vec2 offset = amount * vec2(cos(angle), sin(angle));
      float r = texture2D(tDiffuse, vUv + offset).r;
      float g = center.g;
      float b = texture2D(tDiffuse, vUv - offset).b;

      float rAlpha = texture2D(tDiffuse, vUv + offset).a;
      float bAlpha = texture2D(tDiffuse, vUv - offset).a;

      r = rAlpha > 0.01 ? r : center.r;
      b = bAlpha > 0.01 ? b : center.b;

      gl_FragColor = vec4(r, g, b, center.a);
    }
  `,
};

/**
 * RGB shift: subtle horizontal CA. Scanlines: light CRT-style pass (no bloom — keeps the bust clean).
 */
const LOOK = {
  rgbShiftAmount: 0.00042,
  rgbShiftAngle: 0.12,
  scanlineStrength: 0.038,
  vignetteStrength: 0.2,
} as const;

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Gentler at start/end than cubic — less abrupt sweep acceleration. */
const easeInOutQuint = (t: number) =>
  t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;

function smoothToward(current: number, target: number, dt: number, rate: number) {
  const k = 1 - Math.exp(-rate * dt);
  return current + (target - current) * k;
}

/** Post pass: faint horizontal scan lines (after RGB shift). */
const ScanlineShader = {
  name: 'ScanlineShader',
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0 },
    strength: { value: LOOK.scanlineStrength },
    vignette: { value: LOOK.vignetteStrength },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform float strength;
    uniform float vignette;
    varying vec2 vUv;
    void main() {
      vec4 base = texture2D(tDiffuse, vUv);
      float rowsA = vUv.y * 920.0;
      float rowsB = vUv.y * 420.0;
      float scanA = pow(abs(sin(rowsA * 3.14159265 + time * 1.9)), 20.0);
      float scanB = pow(abs(sin(rowsB * 3.14159265 + time * 0.75)), 10.0) * 0.35;
      float roll = 0.965 + 0.035 * sin(vUv.y * 40.0 + time * 3.2);
      float dim = (1.0 - strength * (scanA + scanB)) * roll;
      float gr = fract(sin(dot(floor(vUv * 800.0), vec2(12.9898, 78.233))) * 43758.5453);
      dim *= 0.982 + 0.036 * gr;
      vec2 q = vUv - 0.5;
      float vig = 1.0 - dot(q, q) * vignette * 1.35;
      vig = clamp(vig, 0.68, 1.0);
      vec3 rgb = base.rgb * dim * vig;
      rgb *= mix(vec3(1.0), vec3(0.96, 1.02, 1.05), (1.0 - dim) * 0.22);
      float luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
      rgb = mix(vec3(luma), rgb, 1.12);
      gl_FragColor = vec4(rgb, base.a);
    }
  `,
};

export type OpeningSequenceProps = {
  onComplete?: () => void;
  /** Fired once when the bust hide finishes and the shell/canvas fade-out begins (pair with page content fade-in). */
  onFadeUiStart?: () => void;
  backgroundColor?: string;
  /** Shorter reveal/hold/hide for in-app route transitions (still shows bust + Loading text). */
  phasePreset?: 'full' | 'route';
  /**
   * After reveal, stay in the hold phase (bust visible + “Loading…”) until this component unmounts.
   * Use for long async work (e.g. hair analysis) so the sequence does not fade out early.
   */
  holdUntilUnmount?: boolean;
  /**
   * Replaces the default “Loading…..” label; bust is moved up so this content fits below (e.g. hair-care status copy).
   */
  holdStatusContent?: ReactNode;
};

export default function OpeningSequence({
  onComplete,
  onFadeUiStart,
  backgroundColor = APP_PAGE_BACKGROUND,
  phasePreset = 'full',
  holdUntilUnmount = false,
  holdStatusContent,
}: OpeningSequenceProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(true);
  const [openingAssetLoading, setOpeningAssetLoading] = useState(true);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const onFadeUiStartRef = useRef(onFadeUiStart);
  onFadeUiStartRef.current = onFadeUiStart;

  const triggerDone = useCallback(() => {
    setVisible(false);
    onCompleteRef.current?.();
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const size = () => {
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      return { w: Math.max(w, 2), h: Math.max(h, 2) };
    };

    /** Reveal clip limits in world Y; overwritten from bust group AABB after placement (see loader). */
    let bottomY = -0.65;
    let topY = 0.65;

    /** Cap frame delta so a long main-thread hitch (loader, tab switch) cannot finish the whole reveal in one frame. */
    const DELTA_CAP = 1 / 24;
    const REVEAL_SEC = phasePreset === 'route' ? 1.05 : 2.2;
    const HOLD_SEC = phasePreset === 'route' ? 0.28 : 0.8;
    const HIDE_SEC = phasePreset === 'route' ? 0.52 : 1.8;
    /** Fade the fixed shell (and CRT pass) before unmount so the app does not pop in. */
    const UI_FADE_OUT_SEC = OPENING_CROSSFADE_SEC;
    const SCAN_EDGE_SMOOTH_RATE = 9;

    let disposed = false;
    let deferredCleanupId: ReturnType<typeof setTimeout> | undefined;
    let raf = 0;
    let modelReady = false;
    let phase: 'reveal' | 'hold' | 'hide' | 'fadeUi' | 'done' = 'reveal';
    let progress = 0;
    let uiFade = 0;
    let displayScanStrength = 0;
    const wireOverlays: {
      material: { opacity: number };
      _shell: THREE.Mesh;
      _mat: THREE.ShaderMaterial;
    }[] = [];
    let done = false;
    let loadingLabelDismissed = false;

    const completeOnce = () => {
      if (done || disposed) return;
      done = true;
      triggerDone();
    };

    const { w: iw, h: ih } = size();
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      stencil: false,
      depth: true,
      powerPreference: 'default',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(iw, ih);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    /** Balanced so orange stays saturated; nudged up for more “lit” mesh vs cream plate. */
    renderer.toneMappingExposure = 0.94;
    renderer.localClippingEnabled = false;
    Object.assign(renderer.domElement.style, {
      display: 'block',
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      background: 'transparent',
    });

    if (!renderer.getContext()) {
      setOpeningAssetLoading(false);
      completeOnce();
      renderer.dispose();
      return () => {
        disposed = true;
      };
    }

    mount.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    /* Equirectangular DataTexture IBL — warm top → neutral bottom (no RoomEnvironment). */
    const envW = 512;
    const envH = 256;
    const envData = new Uint8Array(envW * envH * 4);
    const warmTop = new THREE.Color(0xfff0e0);
    const neutralBottom = new THREE.Color(0xd8d2c8);
    const rowColor = new THREE.Color();
    for (let y = 0; y < envH; y++) {
      const t = y / Math.max(envH - 1, 1);
      rowColor.copy(warmTop).lerp(neutralBottom, t);
      for (let x = 0; x < envW; x++) {
        const i = (y * envW + x) * 4;
        envData[i] = Math.round(rowColor.r * 255);
        envData[i + 1] = Math.round(rowColor.g * 255);
        envData[i + 2] = Math.round(rowColor.b * 255);
        envData[i + 3] = 255;
      }
    }
    const envEquirect = new THREE.DataTexture(envData, envW, envH);
    envEquirect.needsUpdate = true;
    envEquirect.colorSpace = THREE.SRGBColorSpace;
    envEquirect.mapping = THREE.EquirectangularReflectionMapping;
    envEquirect.minFilter = THREE.LinearFilter;
    envEquirect.magFilter = THREE.LinearFilter;
    const envMap = pmremGenerator.fromEquirectangular(envEquirect).texture;
    envEquirect.dispose();
    pmremGenerator.dispose();

    const scene = new THREE.Scene();
    scene.background = null;
    scene.environment = envMap;

    const camera = new THREE.PerspectiveCamera(30, iw / ih, 0.1, 1000);
    camera.position.set(2.8, 1.6, -3.2); // behind + to the side
    camera.lookAt(0, OPENING_LOOK_AT_Y, 0);
    const cameraWorldPos = new THREE.Vector3();

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));

    const key = new THREE.DirectionalLight(0xffffff, 3.0);
    key.position.set(4, 6, 3);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xff9944, 0.6);
    fill.position.set(-4, 1, 2);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffffff, 1.2);
    rim.position.set(0, 3, -5);
    scene.add(rim);

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    const rgbPass = new ShaderPass(SafeRGBShiftShader);
    rgbPass.uniforms.amount.value = LOOK.rgbShiftAmount;
    rgbPass.uniforms.angle.value = LOOK.rgbShiftAngle;
    const scanPass = new ShaderPass(ScanlineShader);
    scanPass.uniforms.strength.value = LOOK.scanlineStrength;
    scanPass.uniforms.vignette.value = LOOK.vignetteStrength;
    const outputPass = new OutputPass();
    composer.addPass(renderPass);
    composer.addPass(rgbPass);
    composer.addPass(scanPass);
    composer.addPass(outputPass);

    const timer = new THREE.Timer();
    if (typeof document !== 'undefined') {
      timer.connect(document);
    }

    /** Matches scene key (~4,6,3) toward bust focal point — warm crowns / back of head in ref stills. */
    const wireLightDir = new THREE.Vector3(4, 6, 3)
      .sub(new THREE.Vector3(0, 0.6, 0))
      .normalize();

    const applyWireframeOnly = (rootObj: THREE.Object3D) => {
      wireOverlays.length = 0;

      const attachWireframeShell = (sourceMesh: THREE.Mesh) => {
        const geo = sourceMesh.geometry;
        if (!geo?.getAttribute('position')) return;

        const shellGeo = geo.clone();

        const gridMat = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          depthTest: false,
          side: THREE.DoubleSide,
          uniforms: {
            uOpacity: { value: WIRE_PEAK_OPACITY },
            uGridSize: { value: 102.0 },
            uColor: { value: new THREE.Color(WIRE_FRAME_COLOR) },
            uClipY: { value: bottomY },
            uScanStrength: { value: 0 },
            uTime: { value: 0 },
            uCameraPos: { value: new THREE.Vector3() },
            uLightDir: { value: wireLightDir.clone() },
          },
          vertexShader: `
            varying vec3 vWorldPos;
            varying vec3 vWorldNormal;
            void main() {
              vWorldNormal = normalize(mat3(modelMatrix) * normal);
              vec4 worldPos = modelMatrix * vec4(position, 1.0);
              vWorldPos = worldPos.xyz;
              gl_Position = projectionMatrix * viewMatrix * worldPos;
            }
          `,
          fragmentShader: `
            uniform float uOpacity;
            uniform float uGridSize;
            uniform vec3 uColor;
            uniform float uClipY;
            uniform float uScanStrength;
            uniform float uTime;
            uniform vec3 uCameraPos;
            uniform vec3 uLightDir;
            varying vec3 vWorldPos;
            varying vec3 vWorldNormal;

            void main() {
              if (vWorldPos.y < uClipY) discard;

              vec3 wob = vec3(
                sin(uTime * 1.15 + vWorldPos.y * 2.4 + vWorldPos.x * 0.6),
                sin(uTime * 0.95 + vWorldPos.x * 2.1 + vWorldPos.z * 0.5),
                sin(uTime * 1.05 + vWorldPos.z * 2.2 + vWorldPos.y * 0.4)
              ) * 0.014;
              vec3 coord = (vWorldPos + wob) * uGridSize;

              vec2 gXY = abs(fract(coord.xy - 0.5) - 0.5) / fwidth(coord.xy);
              vec2 gXZ = abs(fract(coord.xz - 0.5) - 0.5) / fwidth(coord.xz);
              vec2 gYZ = abs(fract(coord.yz - 0.5) - 0.5) / fwidth(coord.yz);
              float line = min(min(gXY.x, gXY.y), min(min(gXZ.x, gXZ.y), min(gYZ.x, gYZ.y)));

              const float lineOuter = 1.42;
              const float lineCore = 0.34;
              float outer = 1.0 - smoothstep(0.0, lineOuter, line);
              float core = 1.0 - smoothstep(0.0, lineCore, line);
              float live = 0.985 + 0.015 * sin(uTime * 1.1 + dot(vWorldPos, vec3(2.2, 3.9, 1.6)));

              vec3 N = normalize(vWorldNormal);
              float ndl = max(dot(N, uLightDir), 0.0);
              float gloss = pow(ndl, 3.2);
              float sheen = pow(ndl, 1.12);
              float fill = 0.78 + 0.22 * pow(ndl, 0.62);
              vec3 baseA = uColor * 0.84;
              vec3 baseB = uColor * 1.22;
              vec3 lineCol = mix(baseA, baseB, core) * fill * live;
              vec3 peak = mix(uColor, vec3(1.0, 0.97, 0.92), 0.38);
              lineCol += peak * gloss * 0.4;
              lineCol += peak * sheen * 0.14;
              lineCol += uColor * outer * (0.22 + 0.32 * core);

              float baseAlpha = outer * uOpacity;
              if (baseAlpha < 0.01) discard;

              vec3 viewDir = normalize(uCameraPos - vWorldPos);
              float ndv = max(dot(N, viewDir), 0.0);
              float holo = pow(1.0 - ndv, 2.35);
              vec3 holoCol = mix(uColor, vec3(1.0, 0.97, 0.93), 0.4);

              float d = vWorldPos.y - uClipY;
              float scanLine = exp(-d * 120.0) * uScanStrength;
              float scanEdge = exp(-d * 220.0) * uScanStrength;

              vec3 scanTeal = vec3(0.45, 0.94, 1.0);
              vec3 scanWarm = mix(uColor * 0.98, vec3(1.0, 0.97, 0.9), 0.35);
              vec3 scanHi = mix(uColor * 1.08, vec3(1.0, 0.99, 0.95), 0.5);
              vec3 sweepCol = mix(scanWarm, mix(scanHi, scanTeal, 0.35), scanLine * 0.55);
              vec3 rgb = mix(lineCol, sweepCol, scanLine * 0.58);
              rgb += holoCol * holo * 0.085;
              rgb += mix(uColor, scanTeal, 0.55) * holo * 0.065;
              rgb += scanHi * scanLine * 0.065;
              rgb += scanTeal * scanEdge * 0.24;
              float lu = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
              rgb = mix(vec3(lu), rgb, 1.38);
              rgb *= 1.02;
              float alpha = min(1.0, baseAlpha + scanLine * 0.56);
              gl_FragColor = vec4(rgb, alpha);
            }
          `,
        });
        gridMat.extensions = {
          clipCullDistance: false,
          multiDraw: false,
          ...( { derivatives: true } as Record<string, boolean> ),
        };

        const shell = new THREE.Mesh(shellGeo, gridMat);
        shell.name = WIRE_OVERLAY_NAME;
        shell.renderOrder = 999;
        shell.frustumCulled = false;
        shell.position.copy(sourceMesh.position);
        shell.rotation.copy(sourceMesh.rotation);
        shell.scale.copy(sourceMesh.scale).multiplyScalar(WIRE_SHELL_SCALE);

        const parent = sourceMesh.parent ?? scene;
        parent.add(shell);

        wireOverlays.push({
          material: { opacity: WIRE_PEAK_OPACITY },
          _shell: shell,
          _mat: gridMat,
        });

        sourceMesh.visible = false;
      };

      const toStrip: THREE.Mesh[] = [];
      rootObj.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        const n = child.name.toLowerCase();
        if (n.includes('cube') || n.includes('plane') || n === 'main-wireframe') {
          toStrip.push(child);
        }
      });

      for (const m of toStrip) {
        m.geometry?.dispose();
        const hm = m.material;
        if (Array.isArray(hm)) hm.forEach((x) => x.dispose());
        else hm?.dispose?.();
        m.removeFromParent();
      }

      rootObj.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        attachWireframeShell(child);
      });
    };

    const resize = () => {
      if (disposed) return;
      const { w, h } = size();
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    const boot = async () => {
      await MeshoptDecoder.ready;
      if (disposed) return;

      const loader = new GLTFLoader();
      const draco = new DRACOLoader();
      draco.setDecoderPath(DRACO_DECODER_PATH);
      loader.setDRACOLoader(draco);
      loader.setMeshoptDecoder(MeshoptDecoder);

      loader.load(
        BUST_GLB_PATH,
        (gltf) => {
          if (disposed) return;
          const root = gltf.scene.clone(true);

          const box = new THREE.Box3().setFromObject(root);
          const bboxSize = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());

          const targetHeight = 1.5;
          const normalizedScale = targetHeight / Math.max(bboxSize.y, 1e-6);
          const groupScale = normalizedScale * 0.85;

          try {
            applyWireframeOnly(root);
          } catch (e) {
            console.error('OpeningSequence: applyWireframeOnly failed', e);
          }

          const group = new THREE.Group();
          group.add(root);
          group.scale.setScalar(groupScale);
          group.position.set(
            -center.x * groupScale,
            -center.y * groupScale,
            -center.z * groupScale,
          );
          group.position.y += 0.3;
          scene.add(group);

          const nuclearRemove: THREE.Object3D[] = [];
          scene.traverse((obj) => {
            const n = obj.name.toLowerCase();
            if (n.includes('plane') || n.includes('cube')) {
              nuclearRemove.push(obj);
              return;
            }
            if (
              obj instanceof THREE.LineSegments &&
              obj.name !== WIRE_OVERLAY_NAME
            ) {
              nuclearRemove.push(obj);
              return;
            }
            if (obj instanceof THREE.Mesh && n === 'main-wireframe') {
              nuclearRemove.push(obj);
            }
          });
          for (const o of nuclearRemove) {
            if (o instanceof THREE.Mesh) {
              o.geometry?.dispose();
              const hm = o.material;
              if (Array.isArray(hm)) hm.forEach((x) => x.dispose());
              else hm?.dispose?.();
            } else if (o instanceof THREE.LineSegments) {
              o.geometry?.dispose();
              const lm = o.material;
              if (Array.isArray(lm)) lm.forEach((x) => x.dispose());
              else (lm as THREE.Material | undefined)?.dispose?.();
            }
            o.removeFromParent();
          }

          const toRemove = new Set<THREE.Object3D>();
          scene.traverse((obj) => {
            const n = obj.name.toLowerCase();

            if (n.includes('plane') || n.includes('cube')) {
              toRemove.add(obj);
              return;
            }

            if (
              obj instanceof THREE.LineSegments &&
              obj.name !== WIRE_OVERLAY_NAME
            ) {
              toRemove.add(obj);
              return;
            }

            if (obj instanceof THREE.Mesh) {
              const meshName = obj.name.toLowerCase();
              if (meshName !== 'base-model' && meshName !== 'main-wireframe') {
                const box = new THREE.Box3().setFromObject(obj);
                const size = box.getSize(new THREE.Vector3());
                if (size.y < 0.01) toRemove.add(obj);
              }
            }
          });
          for (const obj of toRemove) {
            if (obj instanceof THREE.Mesh) {
              obj.geometry?.dispose();
              const hm = obj.material;
              if (Array.isArray(hm)) hm.forEach((x) => x.dispose());
              else hm?.dispose?.();
            } else if (
              obj instanceof THREE.LineSegments ||
              obj instanceof THREE.Line
            ) {
              obj.geometry?.dispose();
              const lm = obj.material;
              if (Array.isArray(lm)) lm.forEach((x) => x.dispose());
              else (lm as THREE.Material | undefined)?.dispose?.();
            }
            obj.removeFromParent();
          }

          scene.traverse((obj) => {
            if (obj instanceof THREE.Mesh) {
              const n = obj.name.toLowerCase();
              if (n.includes('plane')) {
                obj.visible = false;
                obj.geometry?.dispose();
                const hm = obj.material;
                if (Array.isArray(hm)) hm.forEach((x) => x.dispose());
                else hm?.dispose?.();
                obj.removeFromParent();
              }
            }
          });

          group.updateMatrixWorld(true);
          const clipBox = new THREE.Box3().setFromObject(group);
          const rawBottom = clipBox.min.y;
          const rawTop = clipBox.max.y;
          const clipSpan = Math.max(rawTop - rawBottom, 1e-6);
          const clipPad = Math.max(0.03 * clipSpan, 0.02);
          bottomY = rawBottom + clipSpan * BUST_BOTTOM_TRIM_RATIO;
          topY = rawTop + clipPad;
          wireOverlays.forEach((m) => {
            m._mat.uniforms.uClipY.value = topY;
            m._mat.uniforms.uScanStrength.value = 0;
          });

          deferredCleanupId = setTimeout(() => {
            deferredCleanupId = undefined;
            if (disposed) return;
            const toKill = new Set<THREE.Object3D>();
            scene.traverse((obj) => {
              if (
                obj instanceof THREE.LineSegments &&
                obj.name !== WIRE_OVERLAY_NAME
              ) {
                toKill.add(obj);
              }
              if (obj instanceof THREE.Mesh) {
                const n = obj.name.toLowerCase();
                if (n.includes('plane') || n.includes('cube')) toKill.add(obj);
              }
            });
            for (const o of toKill) {
              if (o instanceof THREE.Mesh) {
                o.geometry?.dispose();
                const hm = o.material;
                if (Array.isArray(hm)) hm.forEach((x) => x.dispose());
                else hm?.dispose?.();
              } else if (o instanceof THREE.LineSegments) {
                o.geometry?.dispose();
                const lm = o.material;
                if (Array.isArray(lm)) lm.forEach((x) => x.dispose());
                else (lm as THREE.Material | undefined)?.dispose?.();
              }
              o.removeFromParent();
            }
          }, 0);

          timer.reset();
          modelReady = true;
          phase = 'reveal';
          progress = 0;
        },
        undefined,
        () => {
          if (!disposed) {
            setOpeningAssetLoading(false);
            completeOnce();
          }
        },
      );
    };

    void boot();

    const loop = (timestamp: number) => {
      if (disposed) return;
      raf = requestAnimationFrame(loop);
      timer.update(timestamp);
      const delta = Math.min(timer.getDelta(), DELTA_CAP);

      const timeSec = timestamp * 0.001;
      scanPass.uniforms.time.value = timeSec;
      rgbPass.uniforms.amount.value = LOOK.rgbShiftAmount;

      if (modelReady && (phase === 'reveal' || phase === 'hold' || phase === 'hide')) {
        progress += delta;
        if (phase === 'reveal') {
          const t = easeInOutQuint(Math.min(progress / REVEAL_SEC, 1));
          const clipY = THREE.MathUtils.lerp(topY, bottomY, t);
          wireOverlays.forEach((m) => {
            m._mat.uniforms.uClipY.value = clipY;
          });

          if (progress >= REVEAL_SEC) {
            phase = 'hold';
            progress = 0;
          }
        } else if (phase === 'hold') {
          const waitingForContent =
            phasePreset !== 'route' && getIntroContentHoldPending();
          if (
            waitingForContent &&
            progress >= HOLD_SEC + INTRO_HOLD_CONTENT_MAX_SEC
          ) {
            setIntroContentHoldPending(false);
          }
          const minHoldDone = progress >= HOLD_SEC;
          const contentOk =
            phasePreset === 'route' || !getIntroContentHoldPending();
          if (minHoldDone && contentOk && !holdUntilUnmount) {
            phase = 'hide';
            progress = 0;
          }
        } else if (phase === 'hide') {
          const t = easeInOutQuint(Math.min(progress / HIDE_SEC, 1));
          const clipY = THREE.MathUtils.lerp(bottomY, topY, t);
          wireOverlays.forEach((m) => {
            m._mat.uniforms.uClipY.value = clipY;
          });

          if (progress >= HIDE_SEC) {
            phase = 'fadeUi';
            uiFade = 0;
            if (!disposed && !loadingLabelDismissed) {
              loadingLabelDismissed = true;
              setOpeningAssetLoading(false);
            }
          }
        }
      } else if (modelReady && phase === 'fadeUi') {
        if (uiFade === 0) {
          onFadeUiStartRef.current?.();
        }
        uiFade += delta;
        const t = Math.min(uiFade / UI_FADE_OUT_SEC, 1);
        const eased = easeInOutCubic(t);
        if (shellRef.current) {
          shellRef.current.style.opacity = String(1 - eased);
        }
        scanPass.uniforms.strength.value = LOOK.scanlineStrength * (1 - eased);
        scanPass.uniforms.vignette.value = LOOK.vignetteStrength * (1 - eased);
        if (t >= 1) {
          phase = 'done';
        }
      }

      if (modelReady && phase !== 'done') {
        if (phase !== 'fadeUi') {
          scanPass.uniforms.strength.value = LOOK.scanlineStrength;
          scanPass.uniforms.vignette.value = LOOK.vignetteStrength;
        }
        camera.getWorldPosition(cameraWorldPos);
        const scanTarget = phase === 'reveal' || phase === 'hide' ? 1 : 0;
        displayScanStrength = smoothToward(
          displayScanStrength,
          scanTarget,
          delta,
          SCAN_EDGE_SMOOTH_RATE,
        );
        wireOverlays.forEach((m) => {
          m._mat.uniforms.uScanStrength.value = displayScanStrength;
          m._mat.uniforms.uTime.value = timeSec;
          m._mat.uniforms.uCameraPos.value.copy(cameraWorldPos);
        });
      }

      composer.render();

      if (phase === 'done' && !done) {
        completeOnce();
      }
    };

    raf = requestAnimationFrame(loop);

    return () => {
      disposed = true;
      if (deferredCleanupId !== undefined) clearTimeout(deferredCleanupId);
      timer.dispose();
      cancelAnimationFrame(raf);
      ro.disconnect();
      rgbPass.dispose();
      scanPass.dispose();
      outputPass.dispose();
      composer.dispose();
      scene.environment = null;
      envMap.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      const seenGeometries = new Set<THREE.BufferGeometry>();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          const geo = obj.geometry as THREE.BufferGeometry | undefined;
          if (geo && !seenGeometries.has(geo)) {
            seenGeometries.add(geo);
            geo.dispose();
          }
          const mat = obj.material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat?.dispose?.();
          return;
        }
        if (obj instanceof THREE.LineSegments) {
          const geo = obj.geometry as THREE.BufferGeometry | undefined;
          if (geo && !seenGeometries.has(geo)) {
            seenGeometries.add(geo);
            geo.dispose();
          }
          const lm = obj.material;
          if (Array.isArray(lm)) lm.forEach((m) => m.dispose());
          else (lm as THREE.Material | undefined)?.dispose?.();
        }
      });
    };
  }, [backgroundColor, phasePreset, triggerDone, holdUntilUnmount]);

  if (!visible) return null;

  /** Bust uses upper viewport so status copy can sit below. */
  const useHoldStatusLayout = Boolean(holdStatusContent);
  const showHoldStatus =
    Boolean(holdStatusContent) && (openingAssetLoading || holdUntilUnmount);

  return (
    <div
      ref={shellRef}
      data-nywele-opening-sequence=""
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: OVERLAY_Z,
        isolation: 'isolate',
        opacity: 1,
        minHeight: '100dvh',
        background:
          typeof document !== 'undefined'
            ? getComputedStyle(document.documentElement)
                .getPropertyValue('--background')
                .trim() || backgroundColor
            : backgroundColor,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight: '100dvh',
          display: useHoldStatusLayout ? 'flex' : 'block',
          flexDirection: useHoldStatusLayout ? 'column' : undefined,
          justifyContent: useHoldStatusLayout ? 'flex-start' : undefined,
        }}
      >
        <div
          ref={mountRef}
          style={
            useHoldStatusLayout
              ? {
                  position: 'relative',
                  flex: '0 0 auto',
                  width: '100%',
                  height: 'min(48vh, 500px)',
                  transform: 'translateY(-2vh)',
                }
              : {
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                }
          }
        />
        {showHoldStatus ? (
          <div
            style={{
              flex: '0 0 auto',
              width: '100%',
              maxWidth: '36rem',
              marginLeft: 'auto',
              marginRight: 'auto',
              paddingLeft: 'clamp(1rem, 4vw, 1.5rem)',
              paddingRight: 'clamp(1rem, 4vw, 1.5rem)',
              paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
              paddingTop: '0.25rem',
              zIndex: 1,
              pointerEvents: 'none',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
            aria-live="polite"
            aria-busy="true"
          >
            {holdStatusContent}
          </div>
        ) : null}
        {openingAssetLoading && !useHoldStatusLayout ? (
          <div
            style={{
              position: 'absolute',
              top: '80%',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1,
              pointerEvents: 'none',
              textAlign: 'center',
              color: '#AF5500',
              fontFamily: 'ui-sans-serif, system-ui, sans-serif',
              fontSize: '0.9375rem',
              fontWeight: 600,
            }}
            aria-live="polite"
            aria-busy="true"
          >
            Loading.....
          </div>
        ) : null}
      </div>
    </div>
  );
}

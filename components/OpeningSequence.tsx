'use client';

/**
 * Opening sequence WebGL: vanilla three.js for `Final-nywele.glb`.
 *
 * GLB layout (Khronos Blender I/O): meshes `Base-model`, `main-wireframe`, `Cube`, `Plane`.
 * We hide `Cube` / `Plane`. The file ships KHR clearcoat/specular/ior on the base mesh and
 * emissive wireframe geometry — scene.environment (PMREM DataTexture IBL), clearcoat on base mesh (no transmission).
 * Wire-form only: `WireframeGeometry` + `LineSegments` / `LineBasicMaterial` per mesh (hidden source mesh, same local transform + light scale bump). Helpers + baked `main-wireframe` removed.
 * Base + wire share `revealPlane`; wire opacity animates in. Transparent WebGL canvas (`alpha: true`); cream from the wrapper div / CSS. EffectComposer = RenderPass → RGB shift → scanlines → OutputPass.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { APP_PAGE_BACKGROUND } from '@/lib/app-theme';

/** Cache-bust so browser picks up replaced `public/Final-nywele.glb`. Bump when asset changes. */
const BUST_GLB_PATH = '/Final-nywele.glb?v=4';
const OVERLAY_Z = 400_000;
const WIRE_OVERLAY_NAME = '__wireframe_overlay__';
const WIRE_FADE_OUT_SEC = 1.2;
const WIRE_PEAK_OPACITY = 0.7;
/** Slight inflate on top of source mesh scale so lines sit above z-fights; keeps full `scale.copy` from GLB. */
const WIRE_SHELL_SCALE = 1.001;

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
  rgbShiftAmount: 0.0003,
  rgbShiftAngle: 0,

  scanlineStrength: 0.04,
} as const;

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Post pass: faint horizontal scan lines (after RGB shift). */
const ScanlineShader = {
  name: 'ScanlineShader',
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0 },
    strength: { value: LOOK.scanlineStrength },
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
    varying vec2 vUv;
    void main() {
      vec4 base = texture2D(tDiffuse, vUv);
      float rows = vUv.y * 720.0;
      float scan = abs(sin(rows * 3.14159265 + time * 1.4));
      float line = pow(scan, 18.0);
      float dim = 1.0 - line * strength;
      gl_FragColor = vec4(base.rgb * dim, base.a);
    }
  `,
};

export type OpeningSequenceProps = {
  onComplete?: () => void;
  backgroundColor?: string;
};

export default function OpeningSequence({
  onComplete,
  backgroundColor = APP_PAGE_BACKGROUND,
}: OpeningSequenceProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

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

    const revealPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    /** Reveal clip limits in Y; set from GLB bounds after load (see loader). */
    let bottomY = -0.65;
    let topY = 0.65;

    /** Cap frame delta so a long main-thread hitch (loader, tab switch) cannot finish the whole reveal in one frame. */
    const DELTA_CAP = 1 / 24;
    const REVEAL_SEC = 1.6;
    const HOLD_SEC = 1.0;
    const HIDE_SEC = WIRE_FADE_OUT_SEC;

    let disposed = false;
    let deferredCleanupId: ReturnType<typeof setTimeout> | undefined;
    let raf = 0;
    let modelReady = false;
    let phase: 'reveal' | 'hold' | 'hide' | 'done' = 'reveal';
    let progress = 0;
    let wireOpacity = 0;
    const wireOverlays: THREE.LineSegments[] = [];
    let done = false;

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
    renderer.toneMappingExposure = 0.9;
    /* Must stay `true` for material clipping — base + wireframe use `clippingPlanes`. */
    renderer.localClippingEnabled = true;
    Object.assign(renderer.domElement.style, {
      display: 'block',
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      background: 'transparent',
    });

    if (!renderer.getContext()) {
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
    camera.lookAt(0, 0.6, 0);

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
    const outputPass = new OutputPass();
    composer.addPass(renderPass);
    composer.addPass(rgbPass);
    composer.addPass(scanPass);
    composer.addPass(outputPass);

    const timer = new THREE.Timer();
    if (typeof document !== 'undefined') {
      timer.connect(document);
    }

    const applyWireframeOnly = (rootObj: THREE.Object3D) => {
      revealPlane.constant = bottomY;
      wireOverlays.length = 0;

      const attachWireframeShell = (sourceMesh: THREE.Mesh) => {
        const geo = sourceMesh.geometry;
        if (!geo?.getAttribute('position')) return;

        const wireGeo = new THREE.WireframeGeometry(geo);
        const wireMat = new THREE.LineBasicMaterial({
          color: 0xff6600,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          depthTest: false,
          blending: THREE.NormalBlending,
          clippingPlanes: [revealPlane],
        });
        (wireMat as unknown as { clipping: boolean }).clipping = true;

        const lines = new THREE.LineSegments(wireGeo, wireMat);
        lines.name = WIRE_OVERLAY_NAME;
        lines.renderOrder = 999;
        lines.frustumCulled = false;

        lines.position.copy(sourceMesh.position);
        lines.rotation.copy(sourceMesh.rotation);
        lines.scale.copy(sourceMesh.scale).multiplyScalar(WIRE_SHELL_SCALE);

        const parent = sourceMesh.parent;
        if (parent) {
          parent.add(lines);
        } else {
          scene.add(lines);
        }
        wireOverlays.push(lines);
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

          const halfH = (bboxSize.y * groupScale) / 2;
          bottomY = -halfH;
          topY = halfH;
          revealPlane.constant = bottomY;
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
          wireOpacity = 0;
        },
        undefined,
        () => {
          if (!disposed) completeOnce();
        },
      );
    };

    void boot();

    const loop = (timestamp: number) => {
      if (disposed) return;
      raf = requestAnimationFrame(loop);
      timer.update(timestamp);
      const delta = Math.min(timer.getDelta(), DELTA_CAP);

      scanPass.uniforms.time.value = timestamp * 0.001;

      if (modelReady && phase !== 'done') {
        progress += delta;
        if (phase === 'reveal') {
          const t = easeInOutCubic(Math.min(progress / REVEAL_SEC, 1));
          revealPlane.constant = THREE.MathUtils.lerp(bottomY, topY, t);

          wireOpacity =
            easeInOutCubic(Math.min(progress / 1.2, 1)) * WIRE_PEAK_OPACITY;
          wireOverlays.forEach((m) => {
            (m.material as THREE.LineBasicMaterial).opacity = wireOpacity;
          });

          if (progress >= REVEAL_SEC) {
            phase = 'hold';
            progress = 0;
          }
        } else if (phase === 'hold') {
          if (progress >= HOLD_SEC) {
            phase = 'hide';
            progress = 0;
          }
        } else if (phase === 'hide') {
          const hideT = Math.min(progress / HIDE_SEC, 1);
          const t = easeInOutCubic(hideT);
          revealPlane.constant = THREE.MathUtils.lerp(topY, bottomY, t);

          wireOpacity =
            (1 - easeInOutCubic(Math.min(progress / WIRE_FADE_OUT_SEC, 1))) *
            WIRE_PEAK_OPACITY;
          wireOverlays.forEach((m) => {
            (m.material as THREE.LineBasicMaterial).opacity = wireOpacity;
          });

          if (progress >= HIDE_SEC) {
            phase = 'done';
          }
        }
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
  }, [backgroundColor, triggerDone]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: OVERLAY_Z,
        isolation: 'isolate',
        background:
          typeof document !== 'undefined'
            ? getComputedStyle(document.documentElement)
                .getPropertyValue('--background')
                .trim() || backgroundColor
            : backgroundColor,
      }}
    >
      <div
        ref={mountRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          minHeight: '100dvh',
        }}
      />
    </div>
  );
}

// A compact 3D product viewer for product pages. Scroll progress (0..1)
// turns the product, opens the case and lifts the earbuds out; dragging adds
// a manual rotation on top. Renders only when something changed, pauses when
// off-screen and disposes everything on unmount.
import * as THREE from 'three';
import { createEarbudSet } from './model.js';
import { createHeadphones } from './headphones.js';
import { dockPose } from './pose.js';
import { createLights, createShadowTexture } from './studio.js';
import { createRoomEnvironment, enableSoftShadows } from './experience.js';

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const lerp = (a, b, t) => a + (b - a) * t;

export function createProductViewer({ container, product, colour, maxDpr = 2, onReady }) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  const env = createRoomEnvironment(renderer);
  scene.environment = env.texture;
  scene.environmentIntensity = 0.45;
  const lights = createLights(scene);
  lights.key.intensity = 2.6;
  lights.key.position.set(1.2, 8, 3);
  lights.rim.color.set('#ffffff');
  lights.rim.intensity = 2.2;
  enableSoftShadows(renderer, lights.key);

  const camera = new THREE.PerspectiveCamera(26, 1, 0.05, 100);
  const rig = new THREE.Group();
  scene.add(rig);

  const earbuds = product.kind === 'earbuds';
  const built = earbuds
    ? createEarbudSet({ model: product.model, finish: colour.finish, internals: false })
    : createHeadphones({ model: product.model, finish: colour.finish });
  rig.add(built.root);
  built.root.traverse((o) => {
    if (o.isMesh) o.castShadow = true;
  });

  // Frame the closed / resting product once and keep that framing.
  if (earbuds) {
    for (const [i, side] of [
      [0, -1],
      [1, 1],
    ]) {
      const p = dockPose(product.model, side);
      built.buds[i].group.position.set(p.x, p.y, p.z);
      built.buds[i].group.rotation.set(p.rx, p.ry, p.rz, 'YXZ');
    }
  }
  built.root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(built.root);
  const sphere = box.getBoundingSphere(new THREE.Sphere());
  const centre = sphere.center.clone();
  const floorY = box.min.y - 0.01;

  const shadowTex = createShadowTexture();
  const blobMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.35 });
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), blobMat);
  blob.rotation.x = -Math.PI / 2;
  blob.position.set(centre.x, floorY, centre.z);
  const size = box.getSize(new THREE.Vector3());
  blob.scale.set(size.x * 1.3, Math.max(size.z, size.x * 0.5) * 1.4, 1);
  scene.add(blob);
  const floorMat = new THREE.ShadowMaterial({ opacity: 0.16 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = floorY;
  floor.receiveShadow = true;
  scene.add(floor);

  let width = 1;
  let height = 1;
  let dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  let progress = 0;
  let drag = 0;
  let dirty = true;
  let visible = true;
  let raf = 0;
  let first = true;

  const resize = () => {
    const r = container.getBoundingClientRect();
    width = Math.max(1, Math.round(r.width));
    height = Math.max(1, Math.round(r.height));
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    dirty = true;
    schedule();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) schedule();
  });
  io.observe(container);

  function apply() {
    const p = progress;
    if (earbuds) {
      // 0–0.25 turn the closed case, 0.25–0.5 open, 0.45–0.75 lift and part, then turn.
      built.lidPivot.rotation.x = -1.95 * smooth(0.22, 0.48, p);
      const lift = smooth(0.42, 0.72, p);
      const stem = product.model.budStyle === 'stem';
      built.buds.forEach((bud, i) => {
        const side = i === 0 ? -1 : 1;
        const d = dockPose(product.model, side);
        bud.group.position.set(lerp(d.x, side * 0.66, lift), lerp(d.y, stem ? 1.25 : 1.0, lift), lerp(d.z, 0.15, lift));
        bud.group.rotation.set(lerp(d.rx, stem ? 0.12 : -0.9, lift), lerp(0, side * -0.5, lift) + smooth(0.7, 1, p) * Math.PI * 2 * 0.5, 0, 'YXZ');
      });
      // Turn from a three-quarter view to the other three-quarter view, so the
      // lifted earbuds always stay in front of the open lid.
      rig.rotation.y = -0.85 + smooth(0, 1, p) * 1.25 + drag;
    } else {
      rig.rotation.y = -0.9 + p * Math.PI * 2 + drag;
      rig.rotation.x = Math.sin(p * Math.PI) * 0.12;
    }

    const fovV = THREE.MathUtils.degToRad(camera.fov);
    const fovH = 2 * Math.atan(Math.tan(fovV / 2) * camera.aspect);
    const dist = (sphere.radius / Math.sin(Math.min(fovV, fovH) / 2)) * (earbuds ? 1.45 + smooth(0.2, 0.75, p) * 0.45 : 1.05);
    const el = 0.22 + Math.sin(p * Math.PI) * 0.12;
    const target = centre.clone();
    if (earbuds) target.y += smooth(0.42, 0.72, p) * 0.35;
    camera.position.set(target.x + dist * Math.cos(el) * Math.sin(0), target.y + dist * Math.sin(el), target.z + dist * Math.cos(el));
    camera.lookAt(target);
  }

  function frame() {
    raf = 0;
    if (!visible || !dirty) return;
    dirty = false;
    apply();
    renderer.render(scene, camera);
    if (first) {
      first = false;
      onReady?.();
    }
  }

  function schedule() {
    if (!raf && visible) raf = requestAnimationFrame(frame);
  }

  resize();

  return {
    setProgress(p) {
      progress = Math.min(1, Math.max(0, p));
      dirty = true;
      schedule();
    },
    setDrag(radians) {
      drag = radians;
      dirty = true;
      schedule();
    },
    dispose() {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      built.dispose();
      blob.geometry.dispose();
      blobMat.dispose();
      shadowTex.dispose();
      floor.geometry.dispose();
      floorMat.dispose();
      env.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}

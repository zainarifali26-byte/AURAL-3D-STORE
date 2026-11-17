// Offline renderer (dev only). Exposes window.__aural so the render script can
// export concept renders for the products that have no photography yet.
// Output matches the processed photos: 4:5 frame on the shared studio
// backdrop, plus a transparent cutout. Not included in the production build.
import * as THREE from 'three';
import { createEarbudSet } from '../three/model.js';
import { createStudioEnvironment, createLights, createShadowTexture } from '../three/studio.js';
import { dockPose } from '../three/pose.js';
import { getProduct, getColour } from '../data/products.js';
import { paintBackdrop } from '../../scripts/backdrop.js';

const FOV = 24;
const W = 1600;
const H = 2000;

let shared = null;
function stage() {
  if (shared) return shared;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  document.getElementById('stage').appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.environment = createStudioEnvironment(renderer).texture;
  createLights(scene);
  const shadowMat = new THREE.MeshBasicMaterial({ map: createShadowTexture(), transparent: true, depthWrite: false, opacity: 0.42 });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  scene.add(shadow);
  const camera = new THREE.PerspectiveCamera(FOV, W / H, 0.05, 100);
  shared = { renderer, scene, shadow, camera };
  return shared;
}

function frame(camera, object, { az = 0, el, fill }) {
  const box = new THREE.Box3().setFromObject(object);
  const sphere = box.getBoundingSphere(new THREE.Sphere());
  const fovV = THREE.MathUtils.degToRad(camera.fov);
  const fovH = 2 * Math.atan(Math.tan(fovV / 2) * camera.aspect);
  const dist = sphere.radius / Math.sin(Math.min(fovV, fovH) / 2) / fill;
  const t = sphere.center;
  camera.position.set(t.x + dist * Math.cos(el) * Math.sin(az), t.y + dist * Math.sin(el), t.z + dist * Math.cos(el) * Math.cos(az));
  camera.lookAt(t);
  return box;
}

function pose(set, model, view) {
  const place = (bud, p) => {
    bud.group.position.set(p.x, p.y, p.z);
    bud.group.rotation.set(p.rx, p.ry, p.rz, 'YXZ');
  };
  const stem = model.budStyle === 'stem';
  if (view === 'hero') {
    set.lidPivot.rotation.x = -1.95;
    place(set.buds[0], { x: -0.6, y: stem ? 1.3 : 1.0, z: 0.15, rx: stem ? 0.12 : -1.0, ry: stem ? 0.5 : 0.25, rz: 0 });
    place(set.buds[1], { x: 0.6, y: stem ? 1.18 : 1.0, z: 0.15, rx: stem ? 0.12 : -1.0, ry: stem ? -0.5 : -0.25, rz: 0 });
    set.root.rotation.y = -0.4;
    return { el: 0.2, fill: 1.12 };
  }
  if (view === 'buds') {
    set.caseGroup.visible = false;
    place(set.buds[0], { x: -0.5, y: 0.12, z: 0, rx: 0.15, ry: 1.05, rz: 0 });
    place(set.buds[1], { x: 0.5, y: -0.12, z: 0, rx: 0.15, ry: -1.05, rz: 0 });
    return { el: 0.16, fill: 1.3 };
  }
  place(set.buds[0], dockPose(model, -1));
  place(set.buds[1], dockPose(model, 1));
  set.root.rotation.y = -0.6;
  set.mats.led.color.multiplyScalar(1.4);
  return { el: 0.3, fill: 1.1 };
}

function encode(canvas, w, h, q) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const x = c.getContext('2d');
  x.imageSmoothingQuality = 'high';
  x.drawImage(canvas, 0, 0, w, h);
  return c.toDataURL('image/webp', q);
}

window.__aural = {
  product(productId, colourId, view) {
    const product = getProduct(productId);
    const colour = getColour(product, colourId);
    const { renderer, scene, shadow, camera } = stage();
    const set = createEarbudSet({ model: product.model, finish: colour.finish, internals: false });
    const opts = pose(set, product.model, view);
    scene.add(set.root);
    set.root.updateMatrixWorld(true);
    const box = frame(camera, set.root, opts);
    const size = box.getSize(new THREE.Vector3());
    shadow.position.set((box.min.x + box.max.x) / 2, box.min.y - 0.02, (box.min.z + box.max.z) / 2);
    shadow.scale.set(size.x * 1.3, Math.max(size.z, size.x * 0.55) * 1.35, 1);
    renderer.render(scene, camera);

    // Plate: the render composited onto the shared studio backdrop.
    const plate = document.createElement('canvas');
    plate.width = W;
    plate.height = H;
    const ctx = plate.getContext('2d');
    paintBackdrop(ctx, W, H);
    ctx.drawImage(renderer.domElement, 0, 0);

    const urls = {
      full: encode(plate, W, H, 0.86),
      half: encode(plate, W / 2, H / 2, 0.84),
      cutFull: encode(renderer.domElement, W, H, 0.88),
      cutHalf: encode(renderer.domElement, W / 2, H / 2, 0.86),
    };
    scene.remove(set.root);
    set.dispose();
    return urls;
  },
};

// Story stills: the scroll story's 3D stage frozen at each scene, used when
// WebGL is unavailable and for the reduced-motion version of the story.
window.__aural.scene = async (key, w = 1600, h = 1000) => {
  const [{ createExperience }, { createStoryState, buildSceneTimeline, SCENE_FOCUS }] = await Promise.all([
    import('../three/experience.js'),
    import('../story/timeline.js'),
  ]);
  const stageEl = document.getElementById('stage');
  stageEl.style.width = `${w}px`;
  stageEl.style.height = `${h}px`;
  const product = getProduct('pro-x');
  const S = createStoryState(product.model);
  const tl = buildSceneTimeline(S, product.model);
  tl.seek(SCENE_FOCUS[key], false);
  S.cam.side = 0;
  S.cam.lift = 0;
  S.float = 0;
  S.version++;
  const experience = createExperience({
    container: stageEl,
    state: S,
    model: product.model,
    finish: product.colours[0].finish,
    maxDpr: 1,
    preserveDrawingBuffer: true,
  });
  experience.renderNow(1.35);
  const url = experience.canvas.toDataURL('image/webp', 0.84);
  experience.dispose();
  tl.kill();
  return url;
};

window.__auralReady = true;

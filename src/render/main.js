// Offline renderer (dev only). Exposes window.__aural so the render script
// can export product images and story stills from the same 3D models the site
// uses. Not included in the production build.
import * as THREE from 'three';
import { createExperience } from '../three/experience.js';
import { createEarbudSet } from '../three/model.js';
import { createHeadphones } from '../three/headphones.js';
import { createStudioEnvironment, createLights, createShadowTexture } from '../three/studio.js';
import { dockPose } from '../three/pose.js';
import { createStoryState, buildSceneTimeline, SCENE_FOCUS } from '../story/timeline.js';
import { getProduct, getColour } from '../data/products.js';

const stage = document.getElementById('stage');
const FOV = 26;

function setSize(w, h) {
  stage.style.width = `${w}px`;
  stage.style.height = `${h}px`;
}

/** Return [full, half] WebP data URLs from a canvas. */
function encode(canvas) {
  const full = canvas.toDataURL('image/webp', 0.86);
  const half = document.createElement('canvas');
  half.width = Math.round(canvas.width / 2);
  half.height = Math.round(canvas.height / 2);
  const ctx = half.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(canvas, 0, 0, half.width, half.height);
  return [full, half.toDataURL('image/webp', 0.84)];
}

// ---- Product shots: one shared renderer, camera auto-framed per shot ----
let shared = null;
function productStage(w, h) {
  if (!shared) {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(1);
    const scene = new THREE.Scene();
    scene.environment = createStudioEnvironment(renderer).texture;
    const brightEnv = createStudioEnvironment(renderer, { bright: true }).texture;
    createLights(scene);
    const shadowMat = new THREE.MeshBasicMaterial({ map: createShadowTexture(), transparent: true, depthWrite: false, opacity: 0.55 });
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    scene.add(shadow);
    shared = { renderer, scene, shadow, brightEnv, camera: new THREE.PerspectiveCamera(FOV, 1, 0.05, 100) };
  }
  shared.renderer.setSize(w, h, false);
  shared.camera.aspect = w / h;
  shared.camera.updateProjectionMatrix();
  return shared;
}

function frame(camera, object, { az, el, fill = 0.78, lift = 0 }) {
  const box = new THREE.Box3().setFromObject(object);
  const sphere = box.getBoundingSphere(new THREE.Sphere());
  const fovV = THREE.MathUtils.degToRad(camera.fov);
  const fovH = 2 * Math.atan(Math.tan(fovV / 2) * camera.aspect);
  const dist = sphere.radius / Math.sin(Math.min(fovV, fovH) / 2) / (fill * 1.15);
  const target = sphere.center.clone();
  target.y += lift * sphere.radius;
  camera.position.set(
    target.x + dist * Math.cos(el) * Math.sin(az),
    target.y + dist * Math.sin(el),
    target.z + dist * Math.cos(el) * Math.cos(az),
  );
  camera.lookAt(target);
  return box;
}

function poseEarbuds(set, model, view) {
  const place = (bud, p) => {
    bud.group.position.set(p.x, p.y, p.z);
    bud.group.rotation.set(p.rx, p.ry, p.rz, 'YXZ');
  };
  const stem = model.budStyle === 'stem';
  if (view === 'hero') {
    set.lidPivot.rotation.x = -1.95;
    place(set.buds[0], { x: -0.62, y: stem ? 1.25 : 0.95, z: 0.1, rx: stem ? 0.12 : -1.0, ry: stem ? 0.5 : 0.25, rz: 0 });
    place(set.buds[1], { x: 0.62, y: stem ? 1.15 : 0.95, z: 0.1, rx: stem ? 0.12 : -1.0, ry: stem ? -0.5 : -0.25, rz: 0 });
    set.root.rotation.y = -0.42;
    return { az: 0, el: 0.2 };
  }
  if (view === 'buds') {
    set.caseGroup.visible = false;
    place(set.buds[0], { x: -0.55, y: 0.05, z: 0, rx: 0.15, ry: 1.05, rz: 0 });
    place(set.buds[1], { x: 0.55, y: -0.05, z: 0, rx: 0.15, ry: -1.05, rz: 0 });
    return { az: 0, el: 0.16, fill: 0.85 };
  }
  if (view === 'top') {
    set.lidPivot.rotation.x = -1.95;
    place(set.buds[0], dockPose(model, -1));
    place(set.buds[1], dockPose(model, 1));
    set.root.rotation.y = 0.25;
    return { az: 0, el: 1.05, fill: 0.84 };
  }
  // case
  place(set.buds[0], dockPose(model, -1));
  place(set.buds[1], dockPose(model, 1));
  set.root.rotation.y = -0.6;
  set.mats.led.color.multiplyScalar(1.6);
  return { az: 0, el: 0.3, fill: 0.74 };
}

function poseHeadphones(hp, view) {
  if (view === 'side') {
    hp.root.rotation.y = Math.PI / 2 - 0.25;
    return { az: 0, el: 0.08, fill: 0.8 };
  }
  if (view === 'detail') {
    hp.root.rotation.y = Math.PI / 2 + 0.55;
    return { az: 0, el: 0.05, fill: 1.25, lift: -0.35 };
  }
  hp.root.rotation.y = 0.55;
  hp.root.rotation.z = 0.06;
  return { az: 0, el: 0.14, fill: 0.84 };
}

window.__aural = {
  product(productId, colourId, view, w = 1200, h = 1000) {
    const product = getProduct(productId);
    const colour = getColour(product, colourId);
    setSize(w, h);
    const { renderer, scene, shadow, camera, brightEnv } = productStage(w, h);
    let built;
    let opts;
    if (product.kind === 'headphones') {
      built = createHeadphones({ finish: colour.finish, model: product.model });
      opts = poseHeadphones(built, view);
    } else {
      built = createEarbudSet({ model: product.model, finish: colour.finish, internals: false });
      opts = poseEarbuds(built, product.model, view);
      if (product.model.caseMetalness >= 1) built.mats.case.envMap = brightEnv;
    }
    scene.add(built.root);
    built.root.updateMatrixWorld(true);
    const box = frame(camera, built.root, opts);
    const size = box.getSize(new THREE.Vector3());
    shadow.position.set((box.min.x + box.max.x) / 2, box.min.y - 0.02, (box.min.z + box.max.z) / 2);
    shadow.scale.set(size.x * 1.25, Math.max(size.z, size.x * 0.5) * 1.3, 1);
    shadow.visible = view !== 'detail';
    renderer.render(scene, camera);
    const urls = encode(renderer.domElement);
    scene.remove(built.root);
    built.dispose();
    return urls;
  },

  scene(key, w = 1600, h = 1000) {
    setSize(w, h);
    const product = getProduct('pro-x');
    const S = createStoryState(product.model);
    const tl = buildSceneTimeline(S, product.model);
    tl.seek(SCENE_FOCUS[key], false);
    S.cam.side = 0;
    S.cam.lift = 0;
    S.float = 0;
    S.version++;
    const experience = createExperience({
      container: stage,
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
  },
};

window.__auralReady = true;

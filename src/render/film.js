// Offline film renderer (dev only). Renders the "Pro X" scroll film: an
// original, unbranded AURAL product film made from the procedural model.
// Exposes window.__film for scripts/render-film.mjs. Not in the production build.
//
// Chapters: float (earbuds drift in the dark), case (closed case on a glossy
// floor, camera orbit), open (the lid opens, the light wakes), rise (the
// earbuds lift out of the case).
import * as THREE from 'three';
import { createEarbudSet } from '../three/model.js';
import { createStudioEnvironment, createLights } from '../three/studio.js';
import { dockPose } from '../three/pose.js';
import { getProduct, getColour } from '../data/products.js';

export const CHAPTERS = ['float', 'case', 'open', 'rise'];

const product = getProduct('pro-x');
const colour = getColour(product, 'onyx');
const model = product.model;

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (t) => Math.min(1, Math.max(0, t));
const span = (t, a, b) => clamp01((t - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;

let st = null;
function stage() {
  if (st) return st;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(1);
  document.getElementById('stage').appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.environment = createStudioEnvironment(renderer).texture;
  createLights(scene);
  // Extra cool rim from behind so the black shells separate from the dark.
  const back = new THREE.DirectionalLight('#cfe2ff', 2.2);
  back.position.set(0, 4, -6);
  scene.add(back);

  const camera = new THREE.PerspectiveCamera(24, 16 / 9, 0.05, 100);
  const set = createEarbudSet({ model, finish: colour.finish, internals: false });
  scene.add(set.root);
  const ledBase = set.mats.led.color.clone();
  st = { renderer, scene, camera, set, ledBase };
  return st;
}

function placeBud(bud, p) {
  bud.group.position.set(p.x, p.y, p.z);
  bud.group.rotation.set(p.rx, p.ry, p.rz, 'YXZ');
}

/** Puts the model in its pose for chapter `c` at local time t (0..1). */
function pose(c, t) {
  const { set } = st;
  const e = ease(t);
  set.root.rotation.set(0, 0, 0);
  set.caseGroup.visible = c !== 'float';
  set.lidPivot.rotation.x = 0;
  set.mats.led.color.copy(st.ledBase).multiplyScalar(0.25);

  if (c === 'float') {
    const bob = Math.sin(t * Math.PI * 2) * 0.04;
    placeBud(set.buds[0], { x: -0.58, y: 0.28 + bob, z: 0.05, rx: 0.22, ry: -0.9 + t * 1.9, rz: 0.28 });
    placeBud(set.buds[1], { x: 0.58, y: -0.22 - bob, z: -0.05, rx: 0.18, ry: 0.85 - t * 1.7, rz: -0.24 });
    return { view: { az: 0, el: 0.06, fill: lerp(0.86, 1.0, e) }, floor: false };
  }

  const docked = (side) => dockPose(model, side);
  placeBud(set.buds[0], docked(-1));
  placeBud(set.buds[1], docked(1));

  if (c === 'case') {
    set.root.rotation.y = lerp(-1.0, 0.35, e);
    return { view: { az: 0, el: 0.14, fill: lerp(0.86, 0.96, e) }, floor: true };
  }

  const lid = c === 'open' ? ease(span(t, 0.12, 0.82)) : 1;
  set.lidPivot.rotation.x = -1.95 * lid;
  set.mats.led.color.copy(st.ledBase).multiplyScalar(lerp(0.25, 1.6, lid));

  if (c === 'open') {
    set.root.rotation.y = lerp(0.35, 0.05, e);
    return { view: { az: 0, el: lerp(0.16, 0.34, e), fill: lerp(0.9, 0.98, e) }, floor: true };
  }

  // rise: the earbuds lift out of the case and turn toward the camera.
  set.root.rotation.y = lerp(0.05, -0.12, e);
  const up = ease(span(t, 0.05, 0.85));
  [-1, 1].forEach((side, k) => {
    const d = docked(side);
    placeBud(set.buds[k], {
      x: d.x + side * 0.38 * up,
      y: d.y + 1.25 * up + Math.sin(t * Math.PI * 2) * 0.02 * up,
      z: d.z + 0.15 * up,
      rx: 0.12 * up,
      ry: side * -0.55 * up,
      rz: side * -0.12 * up,
    });
  });
  return { view: { az: 0, el: lerp(0.3, 0.18, e), fill: 0.88 }, floor: true };
}

/** Bounding sphere of the chapter's whole motion, so the camera never jitters. */
function chapterSphere(c) {
  const box = new THREE.Box3();
  for (const t of [0, 0.25, 0.5, 0.75, 1]) {
    pose(c, t);
    st.set.root.updateMatrixWorld(true);
    box.union(new THREE.Box3().setFromObject(st.set.root));
  }
  return box.getBoundingSphere(new THREE.Sphere());
}

const spheres = {};

function aim(camera, sphere, { az, el, fill }, w, h, portrait) {
  const fovV = THREE.MathUtils.degToRad(camera.fov);
  const fovH = 2 * Math.atan(Math.tan(fovV / 2) * camera.aspect);
  const dist = sphere.radius / Math.sin(Math.min(fovV, fovH) / 2) / (fill * (portrait ? 1.18 : 1));
  const c = sphere.center;
  camera.position.set(c.x + dist * Math.cos(el) * Math.sin(az), c.y + dist * Math.sin(el), c.z + dist * Math.cos(el) * Math.cos(az));
  camera.lookAt(c);
  // Leave room for the captions: product right of centre on wide frames,
  // above centre on tall (phone) frames.
  if (portrait) camera.setViewOffset(w, h, 0, Math.round(h * 0.1), w, h);
  else camera.setViewOffset(w, h, -Math.round(w * 0.14), 0, w, h);
  camera.updateProjectionMatrix();
}

function paintBackground(ctx, w, h, cx) {
  ctx.fillStyle = '#060606';
  ctx.fillRect(0, 0, w, h);
  // Soft overhead light pool.
  const pool = ctx.createRadialGradient(cx, -h * 0.1, 0, cx, -h * 0.1, h * 1.05);
  pool.addColorStop(0, 'rgba(150,172,196,0.22)');
  pool.addColorStop(0.5, 'rgba(90,104,120,0.08)');
  pool.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = pool;
  ctx.fillRect(0, 0, w, h);
  // Light cone from above, like a studio spot.
  const cone = ctx.createLinearGradient(0, 0, 0, h * 0.9);
  cone.addColorStop(0, 'rgba(210,225,240,0.11)');
  cone.addColorStop(1, 'rgba(210,225,240,0)');
  ctx.fillStyle = cone;
  ctx.filter = `blur(${Math.round(Math.max(w, h) * 0.025)}px)`;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.05, 0);
  ctx.lineTo(cx + w * 0.05, 0);
  ctx.lineTo(cx + Math.max(w, h) * 0.34, h * 0.9);
  ctx.lineTo(cx - Math.max(w, h) * 0.34, h * 0.9);
  ctx.closePath();
  ctx.fill();
  ctx.filter = 'none';
}

function encode(canvas, q) {
  return canvas.toDataURL('image/webp', q);
}

window.__film = {
  chapters: CHAPTERS,
  /**
   * Renders one frame. size: 'lg' (1600x900) or 'sm' (720x1280 for phones).
   * Returns a WebP data URL.
   */
  frame(chapterIndex, t, size) {
    const { renderer, scene, camera, set } = stage();
    const portrait = size === 'sm';
    const w = portrait ? 720 : 1600;
    const h = portrait ? 1280 : 900;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = portrait ? 30 : 24;

    const c = CHAPTERS[chapterIndex];
    const key = `${c}-${size}`;
    spheres[key] ??= chapterSphere(c);
    const opts = pose(c, t);
    set.root.updateMatrixWorld(true);
    aim(camera, spheres[key], opts.view, w, h, portrait);
    renderer.render(scene, camera);

    // Where the subject sits on screen, and where the floor meets it.
    const centre = spheres[key].center.clone().project(camera);
    const cx = ((centre.x + 1) / 2) * w;
    const out = document.createElement('canvas');
    out.width = w;
    out.height = h;
    const ctx = out.getContext('2d');
    paintBackground(ctx, w, h, cx);

    if (opts.floor) {
      const box = new THREE.Box3().setFromObject(set.caseGroup);
      const floor = new THREE.Vector3(box.getCenter(new THREE.Vector3()).x, box.min.y, box.getCenter(new THREE.Vector3()).z).project(camera);
      const fy = ((1 - floor.y) / 2) * h;
      // Glossy floor: a soft pool of light around the case and a fading mirror image.
      ctx.save();
      ctx.translate(cx, fy);
      ctx.scale(1, 0.22);
      const sheen = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(w, h) * 0.42);
      sheen.addColorStop(0, 'rgba(200,215,230,0.10)');
      sheen.addColorStop(1, 'rgba(200,215,230,0)');
      ctx.fillStyle = sheen;
      ctx.fillRect(-w, -h * 3, w * 2, h * 6);
      ctx.restore();
      const mirror = document.createElement('canvas');
      mirror.width = w;
      mirror.height = h;
      const m = mirror.getContext('2d');
      m.translate(0, 2 * fy);
      m.scale(1, -1);
      m.drawImage(renderer.domElement, 0, 0);
      m.setTransform(1, 0, 0, 1, 0, 0);
      m.globalCompositeOperation = 'destination-in';
      const fade = m.createLinearGradient(0, fy, 0, fy + h * 0.28);
      fade.addColorStop(0, 'rgba(0,0,0,0.32)');
      fade.addColorStop(1, 'rgba(0,0,0,0)');
      m.fillStyle = fade;
      m.fillRect(0, 0, w, h);
      ctx.drawImage(mirror, 0, 0);
    }

    ctx.drawImage(renderer.domElement, 0, 0);
    return encode(out, portrait ? 0.7 : 0.72);
  },
};

window.__filmReady = true;

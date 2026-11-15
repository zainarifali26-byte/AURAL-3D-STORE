// Studio lighting: a small procedural environment (soft boxes in a dark room)
// baked once into a PMREM texture, plus two real lights. No HDR file needed.
import * as THREE from 'three';

function panel(scene, geo, color, intensity, position, rotation = [0, 0, 0]) {
  const mat = new THREE.MeshBasicMaterial({ color });
  mat.color.multiplyScalar(intensity);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  scene.add(mesh);
  return mat;
}

export function createStudioEnvironment(renderer) {
  const scene = new THREE.Scene();
  const box = new THREE.BoxGeometry(1, 1, 1);
  const materials = [];

  const room = new THREE.Mesh(
    new THREE.BoxGeometry(24, 24, 24),
    new THREE.MeshBasicMaterial({ color: '#05070a', side: THREE.BackSide }),
  );
  scene.add(room);

  const add = (...args) => materials.push(panel(scene, box, ...args));
  // Key soft box overhead, slightly forward.
  add('#ffffff', 7, [0, 7, 2], [0, 0, 0]);
  scene.children.at(-1).scale.set(7, 0.2, 4.5);
  // Cool rim strip, camera left.
  add('#b8d8ff', 9, [-8, 1.5, -1]);
  scene.children.at(-1).scale.set(0.2, 6, 2.2);
  // Neutral strip, camera right.
  add('#ffffff', 4, [8, 2.5, 1]);
  scene.children.at(-1).scale.set(0.2, 4, 1.6);
  // Back rim, high behind the product.
  add('#dce9ff', 6, [0, 4.5, -8]);
  scene.children.at(-1).scale.set(8, 1.2, 0.2);
  // Faint front fill so the faceplates never go fully black.
  add('#ffffff', 0.7, [0, 0.5, 9]);
  scene.children.at(-1).scale.set(9, 5, 0.2);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const target = pmrem.fromScene(scene, 0.035);
  pmrem.dispose();

  room.geometry.dispose();
  room.material.dispose();
  box.dispose();
  for (const mat of materials) mat.dispose();

  return target;
}

export function createLights(scene) {
  const key = new THREE.DirectionalLight('#ffffff', 1.6);
  key.position.set(3, 6, 5);
  const rim = new THREE.DirectionalLight('#b8d8ff', 1.4);
  rim.position.set(-5, 2.5, -4);
  scene.add(key, rim);
  return { key, rim };
}

/** Soft radial texture used for the contact shadow under the case. */
export function createShadowTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(0,0,0,0.85)');
  g.addColorStop(0.55, 'rgba(0,0,0,0.35)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

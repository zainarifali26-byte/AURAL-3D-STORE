// Scene effects driven by the story state: sound rings, incoming "noise"
// rings for the noise-cancellation scene, and water droplets on the lid.
// Everything here is hidden (and skipped) while its strength is zero.
import * as THREE from 'three';
import { superPoint, superNormal } from './model.js';

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function ringMaterial(color) {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
}

export function createWaves() {
  const group = new THREE.Group();
  const geo = new THREE.RingGeometry(0.988, 1, 96);
  const sound = [];
  const noise = [];

  for (let c = 0; c < 2; c++) {
    for (let i = 0; i < 4; i++) {
      const mesh = new THREE.Mesh(geo, ringMaterial('#b8d8ff'));
      mesh.visible = false;
      group.add(mesh);
      sound.push({ mesh, centre: c, offset: i / 4 });
    }
  }
  for (let i = 0; i < 5; i++) {
    const mesh = new THREE.Mesh(geo, ringMaterial('#c9ced6'));
    mesh.visible = false;
    group.add(mesh);
    noise.push({ mesh, offset: i / 5 });
  }
  const shield = new THREE.Mesh(geo, ringMaterial('#b8d8ff'));
  shield.visible = false;
  group.add(shield);
  // Voice: rings that close in on the microphone.
  const voice = [];
  for (let i = 0; i < 4; i++) {
    const mesh = new THREE.Mesh(geo, ringMaterial('#d9c08f'));
    mesh.visible = false;
    group.add(mesh);
    voice.push({ mesh, offset: i / 4 });
  }

  /**
   * @param time seconds
   * @param S story state (waves, anc, calm)
   * @param centres two Vector3 in the group's parent space
   * @param camera used to billboard the rings
   */
  const update = (time, S, centres, camera) => {
    group.quaternion.copy(camera.quaternion);
    const inv = group.quaternion.clone().invert();

    const showSound = S.waves > 0.002;
    for (const r of sound) {
      r.mesh.visible = showSound;
      if (!showSound) continue;
      const phase = (time * 0.22 + r.offset) % 1;
      const radius = 0.48 + phase * 1.6;
      r.mesh.position.copy(centres[r.centre]).applyQuaternion(inv);
      r.mesh.scale.setScalar(radius);
      r.mesh.material.opacity = S.waves * Math.pow(1 - phase, 1.8) * 0.38 * smooth(0, 0.12, phase);
    }

    const showNoise = S.anc > 0.002;
    const mid = centres[0].clone().add(centres[1]).multiplyScalar(0.5).applyQuaternion(inv);
    const boundary = 1.4 + S.calm * 2.4;
    for (const r of noise) {
      r.mesh.visible = showNoise && S.calm < 0.995;
      if (!r.mesh.visible) continue;
      const phase = (time * 0.17 + r.offset) % 1;
      const radius = 3.7 - phase * 2.3;
      const wobble = 1 + Math.sin(time * 3.1 + r.offset * 20) * 0.035 * (1 - S.calm);
      r.mesh.position.copy(mid);
      r.mesh.scale.set(radius * wobble, radius / wobble, 1);
      r.mesh.material.opacity =
        S.anc * (1 - S.calm) * Math.sin(Math.PI * phase) * 0.36 * smooth(boundary, boundary + 0.7, radius + 0.7);
    }
    const showVoice = S.voice > 0.002 && centres[2];
    for (const r of voice) {
      r.mesh.visible = Boolean(showVoice);
      if (!showVoice) continue;
      const phase = (time * 0.35 + r.offset) % 1;
      r.mesh.position.copy(centres[2]).applyQuaternion(inv);
      r.mesh.scale.setScalar(0.06 + (1 - phase) * 0.55);
      r.mesh.material.opacity = S.voice * Math.sin(Math.PI * phase) * 0.6;
    }

    shield.visible = showNoise;
    if (showNoise) {
      shield.position.copy(mid);
      shield.scale.setScalar(1.4 + Math.sin(time * 1.2) * 0.015);
      shield.material.opacity = S.anc * (0.08 + S.calm * 0.22);
    }
  };

  const dispose = () => {
    geo.dispose();
    for (const child of group.children) child.material.dispose();
  };

  return { group, update, dispose };
}

export function createDroplets(dims, count = 44) {
  const { a, bLid, c, n } = dims;
  const geo = new THREE.SphereGeometry(1, 14, 10);
  // Dark, almost mirror-smooth beads: they read as water through their
  // reflections rather than as white dots.
  const mat = new THREE.MeshStandardMaterial({
    color: '#202a38',
    roughness: 0.02,
    metalness: 0.1,
    transparent: true,
    opacity: 0.9,
    envMapIntensity: 4,
    depthWrite: false,
  });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.visible = false;
  mesh.frustumCulled = false;

  // Deterministic pseudo-random layout so every visit looks the same.
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const drops = Array.from({ length: count }, (_, i) => ({
    u: rand() * Math.PI * 2,
    v: 0.12 + rand() * 1.15,
    size: 0.016 + rand() * rand() * 0.045,
    speed: i % 4 === 0 ? 0.05 + rand() * 0.08 : 0,
    delay: rand() * 0.6,
  }));

  const dir = new THREE.Vector3();
  const p = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const quat = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  const matrix = new THREE.Matrix4();

  const update = (time, strength) => {
    mesh.visible = strength > 0.002;
    if (!mesh.visible) return;
    for (let i = 0; i < count; i++) {
      const d = drops[i];
      let v = d.v;
      let fade = 1;
      if (d.speed > 0) {
        const span = 1.5 - d.v;
        const travel = (time * d.speed) % span;
        v = d.v + travel;
        fade = 1 - smooth(span * 0.7, span, travel);
      }
      dir.set(Math.sin(v) * Math.cos(d.u), Math.cos(v), Math.sin(v) * Math.sin(d.u));
      superPoint(dir, n, p);
      superNormal(p, n, a, bLid, c, normal);
      p.set(p.x * a, p.y * bLid, p.z * c);
      quat.setFromUnitVectors(up, normal);
      const s = d.size * smooth(d.delay, d.delay + 0.4, strength) * fade;
      scale.set(s, s * 0.62, s);
      matrix.compose(p, quat, scale);
      mesh.setMatrixAt(i, matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  };

  const dispose = () => {
    geo.dispose();
    mat.dispose();
  };

  return { mesh, update, dispose };
}

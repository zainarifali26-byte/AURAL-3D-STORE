// Procedural over-ear headphones: an original, generic concept shape built
// from three.js geometry. Used for the product renders of the over-ear models.
import * as THREE from 'three';

const DEFAULT_FINISH = { body: '#cfe6ee', accent: '#e8eef2', cushion: '#9fb3d9', band: '#cfe6ee' };

function latheX(points, segments = 64) {
  const curve = new THREE.SplineCurve(points.map(([r, y]) => new THREE.Vector2(r, y)));
  const geo = new THREE.LatheGeometry(curve.getPoints(32), segments);
  geo.rotateZ(-Math.PI / 2); // lathe axis Y -> X
  return geo;
}

/** Tube along a curve, flattened so it reads as a band rather than a pipe. */
function bandGeometry(curve, radius, widthScale) {
  const geo = new THREE.TubeGeometry(curve, 96, radius, 14, false);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setZ(i, pos.getZ(i) * widthScale);
  geo.computeVertexNormals();
  return geo;
}

export function createHeadphones({ finish = DEFAULT_FINISH, model = {} } = {}) {
  const f = { ...DEFAULT_FINISH, ...finish };
  const m = { roughness: 0.45, metalness: 0.1, cushionRoughness: 0.95, cupScale: 1, ...model };
  const geometries = new Set();
  const track = (g) => {
    geometries.add(g);
    return g;
  };

  const mats = {
    body: new THREE.MeshStandardMaterial({ color: f.body, roughness: m.roughness, metalness: m.metalness }),
    band: new THREE.MeshStandardMaterial({ color: f.band, roughness: m.roughness, metalness: m.metalness }),
    cushion: new THREE.MeshStandardMaterial({ color: f.cushion, roughness: m.cushionRoughness, metalness: 0 }),
    accent: new THREE.MeshStandardMaterial({ color: f.accent, roughness: 0.22, metalness: 1 }),
    fabric: new THREE.MeshStandardMaterial({ color: '#15181c', roughness: 1, metalness: 0 }),
  };
  mats.body.side = THREE.DoubleSide;

  const root = new THREE.Group();
  const W = 1.02;

  // Headband: outer shell and an inner cushion.
  const arc = (rx, ry, y0) =>
    new THREE.CatmullRomCurve3(
      Array.from({ length: 25 }, (_, i) => {
        const t = Math.PI * (i / 24);
        return new THREE.Vector3(-Math.cos(t) * rx, y0 + Math.sin(t) * ry, 0);
      }),
    );
  const band = new THREE.Mesh(track(bandGeometry(arc(W + 0.02, 1.15, 0.78), 0.055, 2.7)), mats.band);
  root.add(band);
  const pad = new THREE.Mesh(track(bandGeometry(arc(W - 0.16, 1.02, 0.84), 0.06, 2.2)), mats.cushion);
  pad.scale.set(0.82, 1, 1);
  pad.position.y = 0.05;
  root.add(pad);

  for (const side of [-1, 1]) {
    const cup = new THREE.Group();
    cup.position.set(side * W, 0, 0);
    root.add(cup);

    // Slider and yoke.
    const slider = new THREE.Mesh(track(new THREE.CylinderGeometry(0.022, 0.022, 0.42, 12)), mats.accent);
    slider.position.set(0, 0.62, 0);
    cup.add(slider);
    const yoke = new THREE.Mesh(track(new THREE.TorusGeometry(0.56, 0.035, 10, 48, Math.PI)), mats.body);
    yoke.rotation.y = Math.PI / 2;
    yoke.scale.set(1, 1.2, 1);
    cup.add(yoke);

    // Ear cup: a rounded shell, opening toward the head.
    const shellGeo = track(
      latheX([
        [0.001, 0.2],
        [0.36, 0.19],
        [0.47, 0.13],
        [0.5, 0.03],
        [0.49, -0.06],
      ]),
    );
    const shell = new THREE.Mesh(shellGeo, mats.body);
    shell.scale.set(side, 1.2 * m.cupScale, 1 * m.cupScale);
    cup.add(shell);

    const plateRing = new THREE.Mesh(track(new THREE.TorusGeometry(0.33, 0.012, 8, 64)), mats.accent);
    plateRing.rotation.y = Math.PI / 2;
    plateRing.position.x = side * 0.195;
    plateRing.scale.set(1, 1.2 * m.cupScale, m.cupScale);
    cup.add(plateRing);

    const cushion = new THREE.Mesh(track(new THREE.TorusGeometry(0.4, 0.13, 18, 64)), mats.cushion);
    cushion.rotation.y = Math.PI / 2;
    cushion.position.x = side * -0.12;
    cushion.scale.set(1.0, 1.2 * m.cupScale, 0.75 * m.cupScale);
    cup.add(cushion);

    const fabric = new THREE.Mesh(track(new THREE.CircleGeometry(0.36, 48)), mats.fabric);
    fabric.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
    fabric.position.x = side * -0.1;
    fabric.scale.set(1, 1.2 * m.cupScale, 1);
    cup.add(fabric);

    // Small control buttons on the right cup.
    if (side > 0) {
      for (let i = 0; i < 3; i++) {
        const btn = new THREE.Mesh(track(new THREE.CylinderGeometry(0.022, 0.022, 0.02, 12)), mats.accent);
        btn.rotation.z = Math.PI / 2;
        btn.position.set(0.12, -0.32 - i * 0.07, 0.42);
        cup.add(btn);
      }
    }
  }

  const dispose = () => {
    for (const g of geometries) g.dispose();
    for (const mat of Object.values(mats)) mat.dispose();
  };

  return { root, mats, dispose };
}

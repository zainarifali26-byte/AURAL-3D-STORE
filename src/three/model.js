// Procedural, generic wireless earbuds + charging case.
//
// This is an original concept shape built from three.js geometry. It is not a
// scan or copy of any real product. The public surface is deliberately small
// so a GLB could replace it later: createEarbudSet() returns
//   { root, caseGroup, lidPivot, lid, buds: [{ group, parts, setExplode }], led, dims, dispose }
// and the experience only talks to those handles.
import * as THREE from 'three';

const TAU = Math.PI * 2;

const DEFAULT_MODEL = {
  caseN: 3.2,
  case: [1.3, 0.78, 0.46, 0.86], // half width, base depth, lid height, half depth
  bud: 1,
  ring: 1,
  hook: false,
  roughness: 0.36,
  metalness: 0.2,
};

const DEFAULT_FINISH = { body: '#1d2129', accent: '#b8d8ff', tip: '#0d0f13' };

/** Point on a unit superellipsoid along `dir` (radial projection). */
export function superPoint(dir, n, out = new THREE.Vector3()) {
  const k = Math.pow(
    Math.pow(Math.abs(dir.x), n) + Math.pow(Math.abs(dir.y), n) + Math.pow(Math.abs(dir.z), n),
    -1 / n,
  );
  return out.copy(dir).multiplyScalar(k);
}

/** Outward normal of the scaled superellipsoid at unit-space point p. */
export function superNormal(p, n, a, b, c, out = new THREE.Vector3()) {
  const g = (v, s) => (Math.sign(v) * Math.pow(Math.abs(v), n - 1)) / s;
  return out.set(g(p.x, a), g(p.y, b), g(p.z, c)).normalize();
}

/** Half of a superellipsoid (top or bottom) with analytic normals. */
function superHalfGeometry(a, b, c, n, top) {
  const geo = new THREE.SphereGeometry(1, 72, 26, 0, TAU, top ? 0 : Math.PI / 2, Math.PI / 2);
  const pos = geo.attributes.position;
  const nor = geo.attributes.normal;
  const p = new THREE.Vector3();
  const q = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i).normalize();
    superPoint(p, n, p);
    superNormal(p, n, a, b, c, q);
    pos.setXYZ(i, p.x * a, p.y * b, p.z * c);
    nor.setXYZ(i, q.x, q.y, q.z);
  }
  geo.computeBoundingSphere();
  return geo;
}

/** Flat superellipse plate that closes a case half. */
function capGeometry(a, c, n, faceUp) {
  const shape = new THREE.Shape();
  const steps = 96;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * TAU;
    const cx = Math.cos(t);
    const cy = Math.sin(t);
    const k = Math.pow(Math.pow(Math.abs(cx), n) + Math.pow(Math.abs(cy), n), -1 / n);
    if (i === 0) shape.moveTo(cx * k * a, cy * k * c);
    else shape.lineTo(cx * k * a, cy * k * c);
  }
  const geo = new THREE.ShapeGeometry(shape, 1);
  geo.rotateX(faceUp ? -Math.PI / 2 : Math.PI / 2);
  return geo;
}

function latheZ(points, segments = 56) {
  const curve = new THREE.SplineCurve(points.map(([r, y]) => new THREE.Vector2(r, y)));
  const geo = new THREE.LatheGeometry(curve.getPoints(28), segments);
  geo.rotateX(Math.PI / 2); // lathe axis Y -> bud axis Z
  return geo;
}

function buildCase(m, mats, track) {
  const [a, bBase, bLid, c] = m.case;
  const n = m.caseN;
  const caseGroup = new THREE.Group();

  const base = new THREE.Mesh(track(superHalfGeometry(a, bBase, c, n, false)), mats.bodyDouble);
  caseGroup.add(base);

  const baseCap = new THREE.Mesh(track(capGeometry(a * 0.993, c * 0.99, n, true)), mats.inner);
  baseCap.position.y = -0.035;
  caseGroup.add(baseCap);

  // Wells the earbuds sit in.
  const wellGeo = track(new THREE.RingGeometry(0.36 * m.bud, 0.47 * m.bud, 48));
  wellGeo.rotateX(-Math.PI / 2);
  const dockX = a * 0.43;
  for (const side of [-1, 1]) {
    const well = new THREE.Mesh(wellGeo, mats.well);
    well.position.set(side * dockX, -0.03, 0);
    caseGroup.add(well);
  }

  // Status light on the front face.
  const ledDir = new THREE.Vector3(0, -0.32, 1).normalize();
  const ledPos = superPoint(ledDir, n).multiply(new THREE.Vector3(a, bBase, c));
  const led = new THREE.Mesh(track(new THREE.SphereGeometry(0.028, 12, 8)), mats.led);
  led.position.copy(ledPos);
  caseGroup.add(led);

  // Hinge barrel.
  const hinge = new THREE.Mesh(track(new THREE.CylinderGeometry(0.035, 0.035, a * 0.7, 16)), mats.accent);
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(0, 0, -c * 0.985);
  caseGroup.add(hinge);

  const lidPivot = new THREE.Group();
  lidPivot.position.set(0, 0.004, -c * 0.97);
  caseGroup.add(lidPivot);

  const lid = new THREE.Group();
  lid.position.set(0, 0, c * 0.97);
  lidPivot.add(lid);

  const lidShell = new THREE.Mesh(track(superHalfGeometry(a, bLid, c, n, true)), mats.bodyDouble);
  lid.add(lidShell);
  const lidCap = new THREE.Mesh(track(capGeometry(a * 0.993, c * 0.99, n, false)), mats.inner);
  lidCap.position.y = 0.03;
  lid.add(lidCap);

  return { caseGroup, lidPivot, lid, led, dockX };
}

function buildBud(m, mats, track, { internals, side }) {
  const group = new THREE.Group();
  const s = m.bud;
  const R = 0.36;
  const parts = {};

  const addPart = (key, label, explode) => {
    const part = new THREE.Group();
    part.userData = { label, base: new THREE.Vector3(), explode: new THREE.Vector3(...explode) };
    group.add(part);
    parts[key] = part;
    return part;
  };

  // Outer shell: the touch faceplate dome.
  const shell = addPart('shell', 'Outer shell', [0, 0, 0.95]);
  const dome = [];
  for (let i = 0; i <= 12; i++) {
    const t = (i / 12) * (Math.PI / 2);
    dome.push([R * Math.pow(Math.cos(t), 0.85), 0.21 * Math.sin(t)]);
  }
  dome[dome.length - 1][0] = 0.0001;
  const shellMesh = new THREE.Mesh(track(latheZ(dome)), mats.bodyDouble);
  shellMesh.scale.x = 1.12;
  shell.add(shellMesh);

  const ringR = 0.19 * Math.min(m.ring, 1.25);
  const ring = new THREE.Mesh(track(new THREE.TorusGeometry(ringR, 0.011 * m.ring, 10, 56)), mats.accent);
  ring.position.z = 0.21 * Math.sin(Math.acos(Math.min(ringR / R, 1))) + 0.004;
  ring.scale.x = 1.12;
  shell.add(ring);

  // Inner housing that tapers into the nozzle.
  const housing = addPart('housing', 'Acoustic housing', [0, 0, -0.62]);
  const housingMesh = new THREE.Mesh(
    track(
      latheZ([
        [R, 0],
        [R * 0.985, -0.06],
        [0.31, -0.16],
        [0.215, -0.26],
        [0.135, -0.32],
        [0.108, -0.38],
        [0.105, -0.45],
      ]),
    ),
    mats.bodyDouble,
  );
  housingMesh.scale.x = 1.12;
  housing.add(housingMesh);
  const seam = new THREE.Mesh(track(new THREE.TorusGeometry(R, 0.008, 8, 64)), mats.accent);
  seam.scale.x = 1.12;
  housing.add(seam);

  if (m.hook) {
    const fin = new THREE.Mesh(track(new THREE.TorusGeometry(0.27, 0.034, 10, 40, Math.PI * 1.15)), mats.tip);
    fin.position.set(side * 0.04, 0.2, -0.1);
    fin.rotation.z = -0.3 * side;
    housing.add(fin);
  }

  // Silicone ear tip.
  const tip = addPart('tip', 'Ear tip', [0, 0, -1.08]);
  const tipMesh = new THREE.Mesh(
    track(
      latheZ(
        [
          [0.085, -0.4],
          [0.19, -0.43],
          [0.232, -0.5],
          [0.215, -0.58],
          [0.15, -0.65],
          [0.085, -0.675],
        ],
        40,
      ),
    ),
    mats.tip,
  );
  tip.add(tipMesh);

  if (internals) {
    // Illustrative internals only. They are a visual concept, not a teardown.
    const pcb = addPart('pcb', 'Control board', [0, 0, 0.5]);
    const board = new THREE.Mesh(track(new THREE.CylinderGeometry(0.29, 0.29, 0.016, 40)), mats.pcb);
    board.rotation.x = Math.PI / 2;
    pcb.add(board);
    const chipGeo = track(new THREE.BoxGeometry(0.1, 0.1, 0.022));
    for (const [x, y, sc] of [
      [0.02, 0.03, 1.2],
      [-0.14, -0.1, 0.7],
      [0.13, -0.12, 0.6],
      [-0.1, 0.15, 0.5],
    ]) {
      const chip = new THREE.Mesh(chipGeo, mats.chip);
      chip.position.set(x, y, 0.018);
      chip.scale.set(sc, sc, 1);
      pcb.add(chip);
    }
    pcb.userData.base.set(0, 0, 0.04);

    const mic = addPart('mic', 'Microphone', [0, 0.32, 0.5]);
    const micMesh = new THREE.Mesh(track(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 16)), mats.gold);
    micMesh.rotation.x = Math.PI / 2;
    mic.add(micMesh);
    mic.userData.base.set(0, 0.2, 0.065);

    const battery = addPart('battery', 'Battery cell', [0, 0, 0.1]);
    const cell = new THREE.Mesh(track(new THREE.CylinderGeometry(0.235, 0.235, 0.1, 40)), mats.steel);
    cell.rotation.x = Math.PI / 2;
    battery.add(cell);
    const band = new THREE.Mesh(track(new THREE.CylinderGeometry(0.238, 0.238, 0.03, 40, 1, true)), mats.accent);
    band.rotation.x = Math.PI / 2;
    battery.add(band);
    battery.userData.base.set(0, 0, -0.05);

    const driver = addPart('driver', 'Acoustic driver', [0, 0, -0.26]);
    const frame = new THREE.Mesh(track(new THREE.CylinderGeometry(0.2, 0.17, 0.05, 40)), mats.steel);
    frame.rotation.x = Math.PI / 2;
    driver.add(frame);
    const cone = new THREE.Mesh(
      track(new THREE.SphereGeometry(0.16, 32, 12, 0, TAU, 0, Math.PI / 2.6)),
      mats.copper,
    );
    cone.rotation.x = -Math.PI / 2;
    cone.position.z = 0.1;
    cone.scale.set(1, 0.5, 1);
    driver.add(cone);
    driver.userData.base.set(0, 0, -0.17);
  }

  for (const part of Object.values(parts)) part.position.copy(part.userData.base);
  group.scale.setScalar(s);

  const setExplode = (t) => {
    for (const part of Object.values(parts)) {
      part.position.copy(part.userData.base).addScaledVector(part.userData.explode, t);
    }
  };

  return { group, parts, setExplode };
}

export function createMaterials(finish = DEFAULT_FINISH, model = DEFAULT_MODEL) {
  const body = new THREE.MeshStandardMaterial({
    color: finish.body,
    roughness: model.roughness,
    metalness: model.metalness,
  });
  const bodyDouble = body.clone();
  bodyDouble.side = THREE.DoubleSide;
  const inner = new THREE.MeshStandardMaterial({ color: '#0a0c10', roughness: 0.75, metalness: 0.1 });
  inner.color.lerp(new THREE.Color(finish.body), 0.18);
  return {
    body,
    bodyDouble,
    inner,
    well: new THREE.MeshStandardMaterial({ color: '#050608', roughness: 0.5, metalness: 0.4 }),
    accent: new THREE.MeshStandardMaterial({ color: finish.accent, roughness: 0.22, metalness: 1 }),
    tip: new THREE.MeshStandardMaterial({ color: finish.tip, roughness: 0.85, metalness: 0, side: THREE.DoubleSide }),
    led: new THREE.MeshBasicMaterial({ color: '#b8d8ff' }),
    pcb: new THREE.MeshStandardMaterial({ color: '#12352f', roughness: 0.6, metalness: 0.3 }),
    chip: new THREE.MeshStandardMaterial({ color: '#15171c', roughness: 0.35, metalness: 0.6 }),
    gold: new THREE.MeshStandardMaterial({ color: '#d9b36a', roughness: 0.3, metalness: 1 }),
    steel: new THREE.MeshStandardMaterial({ color: '#aeb6c2', roughness: 0.28, metalness: 1 }),
    copper: new THREE.MeshStandardMaterial({ color: '#c98a5e', roughness: 0.35, metalness: 1 }),
  };
}

export function createEarbudSet({ model = {}, finish = DEFAULT_FINISH, internals = true } = {}) {
  const m = { ...DEFAULT_MODEL, ...model };
  const geometries = new Set();
  const track = (geo) => {
    geometries.add(geo);
    return geo;
  };
  const mats = createMaterials(finish, m);

  const root = new THREE.Group();
  const { caseGroup, lidPivot, lid, led, dockX } = buildCase(m, mats, track);
  root.add(caseGroup);

  const buds = [
    buildBud(m, mats, track, { internals, side: -1 }),
    buildBud(m, mats, track, { internals: false, side: 1 }),
  ];
  for (const bud of buds) root.add(bud.group);

  const dispose = () => {
    for (const geo of geometries) geo.dispose();
    for (const mat of Object.values(mats)) mat.dispose();
  };

  return {
    root,
    caseGroup,
    lidPivot,
    lid,
    led,
    buds,
    mats,
    dims: { a: m.case[0], bBase: m.case[1], bLid: m.case[2], c: m.case[3], n: m.caseN, dockX, budScale: m.bud },
    dispose,
  };
}

// The 3D stage for the scroll story.
//
// It owns the renderer, camera, model and effects, and reads a plain state
// object `S` (see src/story/timeline.js) every frame. GSAP writes to `S`; this
// file never knows about scroll. It renders only when `S` changed or an
// ambient effect is running, pauses when off-screen or in a background tab,
// caps the pixel ratio and lowers it further if frames get slow.
import * as THREE from 'three';
import { createEarbudSet } from './model.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createLights, createShadowTexture } from './studio.js';
import { createWaves, createDroplets } from './effects.js';

/**
 * Image-based lighting from three.js' RoomEnvironment: a softly lit studio
 * interior that gives plastics and metals believable reflections.
 */
export function createRoomEnvironment(renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const target = pmrem.fromScene(room, 0.03);
  room.traverse((o) => {
    o.geometry?.dispose();
    o.material?.dispose?.();
  });
  pmrem.dispose();
  return target;
}

/** Enable soft real-time shadows from the key light onto a transparent floor. */
export function enableSoftShadows(renderer, key) {
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  const cam = key.shadow.camera;
  cam.left = -3;
  cam.right = 3;
  cam.top = 3;
  cam.bottom = -3;
  cam.near = 0.5;
  cam.far = 20;
  key.shadow.radius = 5; // blur the PCF edge for a soft studio shadow
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
}

const FOV = 30;
const LID_OPEN = 1.95; // radians
// Where each exploded-view label sits: side 1 = above, -1 = below; level
// staggers neighbours so labels never collide on narrow screens.
const LABELS = {
  bean: {
    side: { shell: 1, pcb: -1, mic: 1, battery: -1, driver: 1, housing: -1, tip: 1 },
    level: { shell: 1, pcb: 1, mic: 1.6, battery: 1.6, driver: 1.6, housing: 1, tip: 1 },
  },
  // Stem earbuds: the stem and microphone hang below, everything else above.
  stem: {
    side: { shell: 1, pcb: 1, battery: 1, driver: 1, tip: 1, housing: -1, stem: -1, mic: -1 },
    level: { shell: 1, pcb: 1.6, battery: 1, driver: 1.6, tip: 1, housing: 1, stem: 0.7, mic: 0.9 },
  },
};

function baseDistance(aspect) {
  const t = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
  const width = aspect < 1 ? 3.7 : 6.2;
  return Math.max(width / (2 * t * aspect), 4.3 / (2 * t));
}

export function isPortrait(width, height) {
  return width / height < 0.9;
}

export function createExperience({
  container,
  state: S,
  labelsEl = null,
  bgEl = null,
  model,
  finish,
  maxDpr = 1.5,
  preserveDrawingBuffer = false,
  onFirstFrame,
  onContextLost,
}) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
    preserveDrawingBuffer,
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  const envTarget = createRoomEnvironment(renderer);
  scene.environment = envTarget.texture;
  const lights = createLights(scene);
  lights.key.intensity = 2.6;
  lights.key.position.set(1.2, 8, 3); // high softbox: shadows fall under the product
  lights.rim.intensity = 2.2;
  lights.rim.color.set('#ffffff');
  enableSoftShadows(renderer, lights.key);

  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
  const rig = new THREE.Group();
  scene.add(rig);

  const set = createEarbudSet({ model, finish, internals: true });
  rig.add(set.root);
  set.root.traverse((o) => {
    if (o.isMesh) o.castShadow = true;
  });
  const { dims } = set;

  // Transparent floor that only shows the soft shadow under the case.
  const floorGeo = new THREE.PlaneGeometry(14, 14);
  const floorMat = new THREE.ShadowMaterial({ opacity: 0.18 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -dims.bBase - 0.012;
  floor.receiveShadow = true;
  set.caseGroup.add(floor);

  const shadowTex = createShadowTexture();
  const shadowGeo = new THREE.PlaneGeometry(1, 1);
  const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.45 });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -dims.bBase - 0.015;
  shadow.scale.set(dims.a * 2.7, dims.c * 3, 1);
  set.caseGroup.add(shadow);

  const waves = createWaves();
  scene.add(waves.group);
  const drops = createDroplets(dims);
  set.lid.add(drops.mesh);

  // ---- Exploded-view labels (DOM + SVG leader lines) ----
  const labels = [];
  const labelSet = set.buds[0].parts.stem ? LABELS.stem : LABELS.bean;
  let svg = null;
  if (labelsEl) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'part-lines');
    labelsEl.appendChild(svg);
    set.root.updateMatrixWorld(true);
    for (const [key, part] of Object.entries(set.buds[0].parts)) {
      const box = new THREE.Box3().setFromObject(part);
      const anchor = part.worldToLocal(box.getCenter(new THREE.Vector3()));
      const el = document.createElement('div');
      el.className = 'part-label';
      el.textContent = part.userData.label;
      labelsEl.appendChild(el);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      svg.appendChild(line);
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('r', '2.5');
      svg.appendChild(dot);
      labels.push({ key, part, anchor, el, line, dot });
    }
  }

  // ---- Sizing and quality ----
  let width = 1;
  let height = 1;
  let dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  let sizeDirty = true;

  const resize = () => {
    const rect = container.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    sizeDirty = true;
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  const applySize = () => {
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    sizeDirty = false;
  };

  // ---- Visibility ----
  let onScreen = true;
  const io = new IntersectionObserver((entries) => {
    onScreen = entries[0].isIntersecting;
    if (onScreen) start();
  });
  io.observe(container);
  const onVisibility = () => {
    if (!document.hidden) start();
  };
  document.addEventListener('visibilitychange', onVisibility);

  const onLost = (event) => {
    event.preventDefault();
    stop();
    onContextLost?.();
  };
  canvas.addEventListener('webglcontextlost', onLost);

  // ---- Per-frame state application ----
  const v = new THREE.Vector3();
  const centres = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  const micPart = set.buds[0].parts.mic ?? set.buds[0].parts.shell;
  const ledBase = new THREE.Color('#fff1dc');
  // Internal parts only show while the earbud is taken apart.
  const internals = ['pcb', 'battery', 'driver', 'mic'].map((k) => set.buds[0].parts[k]).filter(Boolean);
  let lastGlow = -1;
  let lastTone = -1;

  const applyState = (time) => {
    const portrait = isPortrait(width, height);
    const intro = S.intro;

    rig.rotation.y = S.rig.ry - (1 - intro) * 0.7;
    rig.position.y = S.rig.y + Math.sin(time * 1.1) * 0.045 * S.float - (1 - intro) * 0.35;

    const c = S.case;
    set.caseGroup.position.set(c.x, c.y, c.z);
    set.caseGroup.scale.setScalar(c.s);
    set.lidPivot.rotation.x = -S.lid * LID_OPEN;

    const budStates = [S.b0, S.b1];
    set.buds.forEach((bud, i) => {
      const b = budStates[i];
      bud.group.position.set(b.x, b.y, b.z);
      bud.group.rotation.set(b.rx, b.ry, b.rz, 'YXZ');
    });
    set.buds[0].setExplode(S.explode * (portrait ? 0.6 : 1));
    const showInternals = S.explode > 0.02;
    for (const part of internals) part.visible = showInternals;

    if (S.led > 0.001) {
      const pulse = 0.55 + 0.45 * Math.sin(time * 2.6);
      set.mats.led.color.copy(ledBase).multiplyScalar(0.25 + S.led * pulse * 1.6);
    } else {
      set.mats.led.color.copy(ledBase).multiplyScalar(0.25);
    }

    // RoomEnvironment is bright and even; scale it down so the key and rim
    // lights shape the product with real contrast.
    scene.environmentIntensity = S.env * 0.42;
    renderer.toneMappingExposure = S.exposure;

    // Camera on a sphere around its target, plus a framing offset so the
    // product can sit beside (desktop) or above (portrait) the copy.
    const cam = S.cam;
    const r = baseDistance(camera.aspect) * cam.dist;
    camera.position.set(
      cam.tx + r * Math.cos(cam.el) * Math.sin(cam.az),
      cam.ty + r * Math.sin(cam.el),
      cam.tz + r * Math.cos(cam.el) * Math.cos(cam.az),
    );
    camera.lookAt(cam.tx, cam.ty, cam.tz);
    const shiftX = portrait ? 0 : cam.side * 0.19;
    const shiftY = portrait ? cam.lift * 0.19 : Math.min(cam.lift, 0) * 0.12;
    camera.setViewOffset(width, height, -shiftX * width, shiftY * height, width, height);
    camera.updateProjectionMatrix();

    rig.updateMatrixWorld(true);

    set.buds[0].group.getWorldPosition(centres[0]);
    set.buds[1].group.getWorldPosition(centres[1]);
    micPart.getWorldPosition(centres[2]);
    waves.update(time, S, centres, camera);
    drops.update(time, S.drops);

    if (bgEl) {
      const glow = Math.round(S.glow * 1000) / 1000;
      if (glow !== lastGlow) {
        bgEl.style.setProperty('--glow', glow);
        lastGlow = glow;
      }
      const tone = Math.round(S.tone * 1000) / 1000;
      if (tone !== lastTone) {
        bgEl.style.setProperty('--tone', tone);
        lastTone = tone;
      }
    }
  };

  const updateLabels = (portrait) => {
    if (!labelsEl) return;
    const show = S.labels > 0.01;
    labelsEl.style.opacity = show ? S.labels.toFixed(3) : '0';
    labelsEl.style.visibility = show ? 'visible' : 'hidden';
    if (!show) return;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    const offset = Math.min(height * (portrait ? 0.09 : 0.13), 120);
    // On the narrowest phones two inner-part labels would collide; the copy
    // below the stage still names every part.
    const narrow = width < 400;
    for (const l of labels) {
      const hidden = narrow && (l.key === 'pcb' || l.key === 'battery');
      l.el.style.display = hidden ? 'none' : '';
      l.line.style.display = hidden ? 'none' : '';
      l.dot.style.display = hidden ? 'none' : '';
      if (hidden) continue;
      v.copy(l.anchor);
      l.part.localToWorld(v);
      v.project(camera);
      const x = (v.x * 0.5 + 0.5) * width;
      const y = (-v.y * 0.5 + 0.5) * height;
      const side = labelSet.side[l.key] ?? 1;
      // Keep labels clear of the navigation bar and the bottom edge.
      const level = labelSet.level[l.key] ?? 1;
      // When clamped at the top, low-level labels sit one row lower so neighbours stay apart.
      const minY = (portrait ? 140 : 96) + (side > 0 && level < 1.3 ? 30 : 0);
      const ly = Math.min(Math.max(y - side * offset * level, minY), height - 40);
      l.el.style.transform = `translate(${x.toFixed(1)}px, ${ly.toFixed(1)}px) translate(-50%, ${side > 0 ? '-100%' : '0'})`;
      l.line.setAttribute('x1', x.toFixed(1));
      l.line.setAttribute('y1', y.toFixed(1));
      l.line.setAttribute('x2', x.toFixed(1));
      l.line.setAttribute('y2', (ly + side * 6).toFixed(1));
      l.dot.setAttribute('cx', x.toFixed(1));
      l.dot.setAttribute('cy', y.toFixed(1));
    }
  };

  const draw = (time) => {
    if (sizeDirty) applySize();
    applyState(time);
    renderer.render(scene, camera);
    updateLabels(isPortrait(width, height));
  };

  // ---- Loop ----
  let raf = 0;
  let lastVersion = -1;
  let lastDraw = 0;
  let firstFrame = true;
  let slowFrames = 0;
  let lastTick = 0;

  const ambient = () =>
    S.float > 0.002 || S.waves > 0.002 || S.voice > 0.002 || S.anc > 0.002 || S.drops > 0.002 || S.led > 0.002;

  const tick = (now) => {
    raf = 0;
    if (!onScreen || document.hidden) return;
    raf = requestAnimationFrame(tick);

    const changed = S.version !== lastVersion || sizeDirty;
    // Ambient-only motion is capped at ~30 fps; scroll-driven changes draw every frame.
    if (!changed && !(ambient() && now - lastDraw > 32)) {
      lastTick = now;
      return;
    }

    // Adaptive quality: if consecutive drawn frames are slow, lower the pixel ratio.
    if (lastTick && now - lastTick > 30 && now - lastTick < 200) slowFrames++;
    else slowFrames = Math.max(0, slowFrames - 1);
    lastTick = now;
    if (slowFrames > 24 && dpr > 1) {
      dpr = Math.max(1, dpr - 0.25);
      sizeDirty = true;
      slowFrames = 0;
    }

    lastVersion = S.version;
    lastDraw = now;
    draw(now / 1000);
    if (firstFrame) {
      firstFrame = false;
      onFirstFrame?.();
    }
  };

  function start() {
    if (!raf && onScreen && !document.hidden) raf = requestAnimationFrame(tick);
  }
  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }
  start();

  return {
    /** Draw one frame synchronously (used by the offline renderer). */
    renderNow(time = 0) {
      resize();
      draw(time);
      return canvas;
    },
    canvas,
    dims,
    dispose() {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onLost);
      set.dispose();
      waves.dispose();
      drops.dispose();
      shadowGeo.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      shadowMat.dispose();
      shadowTex.dispose();
      envTarget.dispose();
      renderer.dispose();
      canvas.remove();
      if (labelsEl) labelsEl.replaceChildren();
    },
  };
}

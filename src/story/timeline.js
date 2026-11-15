// The product story as data: one state object `S` and one GSAP timeline that
// tweens it. Time units are arbitrary "beats"; ScrollTrigger maps the whole
// timeline onto the story section's scroll distance.
import { gsap } from 'gsap';

const DOCK = 0.56;
const TAU = Math.PI * 2;
const DOWN = -Math.PI / 2; // nozzle down, faceplate up (resting in the case)

export const SCENES = [
  { key: 'reveal', time: 0 },
  { key: 'rotate', time: 2.4 },
  { key: 'explode', time: 4.8 },
  { key: 'sound', time: 8.2 },
  { key: 'anc', time: 10.4 },
  { key: 'battery', time: 12.6 },
  { key: 'water', time: 15 },
  { key: 'final', time: 17.2 },
];
export const TOTAL = 19.2;

// The moment in each scene where its copy is fully on screen. Used for nav
// anchors, the progress rail and the offline scene renders.
export const SCENE_FOCUS = {
  hero: 0,
  reveal: 1.7,
  rotate: 3.7,
  explode: 6.7,
  sound: 9.6,
  anc: 11.9,
  battery: 14.6,
  water: 16.6,
  final: 18.9,
};

export function createStoryState() {
  return {
    version: 0,
    intro: 1,
    float: 1,
    cam: { az: 0, el: 0.3, dist: 1.05, tx: 0, ty: 0.1, tz: 0, side: 0, lift: -0.9 },
    rig: { ry: -0.55, y: 0 },
    case: { x: 0, y: 0, z: 0, s: 1 },
    lid: 0,
    b0: { x: -DOCK, y: 0.02, z: 0, rx: DOWN, ry: 0, rz: 0 },
    b1: { x: DOCK, y: 0.02, z: 0, rx: DOWN, ry: 0, rz: 0 },
    explode: 0,
    labels: 0,
    waves: 0,
    anc: 0,
    calm: 0,
    led: 0,
    drops: 0,
    glow: 0.35,
    env: 0.85,
    exposure: 1,
  };
}

export function buildSceneTimeline(S) {
  const tl = gsap.timeline({
    paused: true,
    defaults: { ease: 'power2.inOut' },
    onUpdate: () => {
      S.version++;
    },
  });
  for (const scene of SCENES) tl.addLabel(scene.key, scene.time);

  // 1 â€” Reveal: camera moves in, lid opens, earbuds rise.
  tl.to(S, { float: 0, duration: 0.8 }, 0)
    .to(S.cam, { dist: 0.9, el: 0.22, ty: 0.55, duration: 2.2 }, 0)
    .to(S.cam, { side: 1, lift: 1, duration: 1 }, 0.4)
    .to(S.rig, { ry: 0.25, duration: 2.4 }, 0)
    .to(S, { lid: 1, duration: 1 }, 0.1)
    .to(S.b0, { x: -0.7, y: 1.25, rx: -1.15, duration: 1.1 }, 0.6)
    .to(S.b1, { x: 0.7, y: 1.25, rx: -1.15, duration: 1.1 }, 0.6)
    .to(S, { env: 1.1, glow: 0.55, duration: 2 }, 0.2);

  // 2 â€” Form: case drops away, earbuds turn a full revolution with the scroll.
  tl.to(S.case, { y: -3.4, s: 0.8, duration: 1.2 }, 2.4)
    .to(S.rig, { ry: 0, duration: 1 }, 2.4)
    .to(S.b0, { x: -0.62, y: 1.0, rx: -0.35, duration: 1.2 }, 2.4)
    .to(S.b1, { x: 0.62, y: 1.0, rx: -0.35, duration: 1.2 }, 2.4)
    .to([S.b0, S.b1], { ry: TAU, duration: 2.4, ease: 'power1.inOut' }, 2.4)
    .to(S.cam, { az: 0.5, el: 0.06, ty: 0.85, dist: 0.62, duration: 1.2 }, 2.4)
    .to(S.cam, { az: -0.25, duration: 1.2 }, 3.6)
    .to(S.cam, { side: -1, duration: 0.8 }, 2.0)
    .to(S, { env: 1.45, exposure: 1.08, duration: 1.2 }, 2.4)
    .to(S, { exposure: 1, duration: 1.2 }, 3.6);

  // 3 â€” Inside: one earbud centres and separates into layers, then rebuilds.
  tl.to(S.case, { y: -3.6, duration: 1 }, 4.8)
    .to(S.b1, { x: 6, y: 1.5, z: -3, duration: 1 }, 4.8)
    // x offset: the exploded stack extends further on the ear-tip side.
    .to(S.b0, { x: 0.3, y: 1.0, rx: 0.12, ry: TAU + Math.PI / 2 - 0.3, duration: 1 }, 4.8)
    .to(S.cam, { az: 0, el: 0.1, ty: 1.0, dist: 0.66, duration: 1 }, 4.8)
    .to(S.cam, { side: 0.3, duration: 0.8 }, 4.4)
    .to(S, { explode: 1, duration: 1 }, 5.6)
    .to(S, { labels: 1, duration: 0.4, ease: 'power1.out' }, 6.3)
    .to(S, { labels: 0, duration: 0.3, ease: 'power1.in' }, 7.3)
    .to(S, { explode: 0, duration: 0.8 }, 7.4)
    .to(S, { env: 1, glow: 0.25, duration: 1 }, 4.8);

  // 4 â€” Sound: both earbuds face you, rings of sound expand from them.
  tl.to(S.b0, { x: -0.8, y: 1.0, z: 0, rx: 0.3, ry: TAU + 0.8, duration: 1 }, 8.2)
    .to(S.b1, { x: 0.8, y: 1.0, z: 0, rx: 0.3, ry: TAU - 0.8, duration: 1 }, 8.2)
    .to(S.cam, { dist: 0.72, duration: 1 }, 8.2)
    .to(S.cam, { side: 1, duration: 0.8 }, 7.9)
    .to(S, { waves: 1, duration: 0.6 }, 8.9)
    .to(S, { glow: 0.75, duration: 0.8 }, 8.9);

  // 5 â€” Silence: outside noise moves in and fades at the boundary.
  tl.to(S, { waves: 0, duration: 0.5 }, 10.2)
    .to(S, { anc: 1, duration: 0.5 }, 10.5)
    .to(S, { calm: 1, duration: 0.9 }, 11.2)
    .to(S.b0, { x: -0.62, duration: 0.8 }, 10.4)
    .to(S.b1, { x: 0.62, duration: 0.8 }, 10.4)
    .to(S.cam, { side: -1, duration: 0.8 }, 10.1)
    .to(S, { glow: 0.08, exposure: 0.92, duration: 0.9 }, 11.2);

  // 6 â€” Power: earbuds return, lid closes, the case turns and charges.
  tl.to(S, { anc: 0, duration: 0.4 }, 12.5)
    .set(S, { calm: 0 }, 12.95)
    .to(S.case, { y: 0, s: 1, duration: 1 }, 12.6)
    .to(S.b0, { x: -DOCK, y: 1.0, rx: DOWN, ry: TAU, duration: 0.6 }, 12.8)
    .to(S.b1, { x: DOCK, y: 1.0, rx: DOWN, ry: TAU, duration: 0.6 }, 12.8)
    .to([S.b0, S.b1], { y: 0.02, duration: 0.5, ease: 'power2.in' }, 13.4)
    .to(S, { lid: 0, duration: 0.5 }, 13.9)
    .to(S.cam, { ty: 0.1, dist: 0.82, el: 0.22, duration: 1.2 }, 12.6)
    .to(S.cam, { side: 1, duration: 0.8 }, 12.4)
    .to(S.rig, { ry: 0.45, duration: 1.2 }, 12.6)
    .to(S.rig, { ry: -0.5, duration: 1 }, 13.9)
    .to(S, { led: 1, duration: 0.3 }, 13.9)
    .to(S, { glow: 0.4, exposure: 1, duration: 1 }, 12.6);

  // 7 â€” Durability: closer, from above, water beads on the lid.
  tl.to(S, { led: 0, duration: 0.3 }, 15)
    .to(S.cam, { el: 0.5, dist: 0.8, ty: 0.1, az: 0.35, duration: 1 }, 15)
    .to(S.cam, { side: -1, duration: 0.8 }, 14.8)
    .to(S.rig, { ry: -0.95, duration: 2 }, 15)
    .to(S, { drops: 1, duration: 0.9 }, 15.4)
    .to(S, { env: 1.55, duration: 1 }, 15);

  // 8 â€” Final: everything together, camera pulls back for the hero shot.
  tl.to(S, { drops: 0, duration: 0.5 }, 17.1)
    .to(S, { lid: 1, duration: 0.8 }, 17.4)
    .to(S.b0, { x: -0.66, y: 0.95, rx: -1.0, ry: TAU + 0.25, duration: 0.9 }, 17.8)
    .to(S.b1, { x: 0.66, y: 0.95, rx: -1.0, ry: TAU - 0.25, duration: 0.9 }, 17.8)
    .to(S.cam, { el: 0.18, dist: 1.08, az: 0, ty: 0.45, duration: 1.4 }, 17.2)
    .to(S.cam, { side: 0, lift: -0.7, duration: 0.8 }, 17.0)
    .to(S.rig, { ry: -0.35, duration: 1.4 }, 17.2)
    .to(S, { env: 1.15, glow: 0.5, exposure: 1.05, duration: 1.4 }, 17.2);

  // Hold the final frame for the last stretch of scroll.
  tl.set({}, {}, TOTAL);
  return tl;
}

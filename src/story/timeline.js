// The product story as data: one state object `S` and one GSAP timeline that
// tweens it. Time units are "beats"; ScrollTrigger maps the whole timeline
// onto the story section's scroll distance (shorter per beat on phones).
import { gsap } from 'gsap';
import { dockPose } from '../three/pose.js';

const TAU = Math.PI * 2;

// `tone`: background of the stage while the scene's copy is shown.
export const SCENES = [
  { key: 'intro', time: 0, tone: 'light' },
  { key: 'open', time: 2.2, tone: 'dark' },
  { key: 'separate', time: 4.2, tone: 'dark' },
  { key: 'rotate', time: 6.4, tone: 'dark' },
  { key: 'acoustic', time: 8.6, tone: 'dark' },
  { key: 'mic', time: 11.6, tone: 'dark' },
  { key: 'anc', time: 13.6, tone: 'dark' },
  { key: 'battery', time: 15.8, tone: 'dark' },
  { key: 'water', time: 18.2, tone: 'dark' },
  { key: 'final', time: 20.4, tone: 'light' },
];
export const TOTAL = 22.8;

// The moment in each scene where its copy is fully on screen. Used for nav
// anchors, the chapter rail and the offline scene renders.
export const SCENE_FOCUS = {
  hero: 0,
  intro: 1.6,
  open: 3.7,
  separate: 5.8,
  rotate: 7.8,
  acoustic: 10.7,
  mic: 13.0,
  anc: 15.2,
  battery: 17.7,
  water: 19.8,
  final: 22.4,
};

export function createStoryState(model) {
  return {
    version: 0,
    intro: 1,
    float: 1,
    tone: 0,
    cam: { az: 0, el: 0.28, dist: 1.05, tx: 0, ty: 0.15, tz: 0, side: 0.85, lift: -1.2 },
    rig: { ry: -0.55, y: 0 },
    case: { x: 0, y: 0, z: 0, s: 1 },
    lid: 0,
    b0: { ...dockPose(model, -1) },
    b1: { ...dockPose(model, 1) },
    explode: 0,
    labels: 0,
    waves: 0,
    voice: 0,
    anc: 0,
    calm: 0,
    led: 0,
    drops: 0,
    glow: 0.3,
    env: 1,
    exposure: 1,
  };
}

export function buildSceneTimeline(S, model) {
  const stem = model.budStyle === 'stem';
  const d0 = dockPose(model, -1);
  const d1 = dockPose(model, 1);
  // A floating, slightly forward-tilted pose that suits the bud style.
  const floatRx = stem ? 0.1 : -0.35;

  const tl = gsap.timeline({
    paused: true,
    defaults: { ease: 'power2.inOut' },
    onUpdate: () => {
      S.version++;
    },
  });
  for (const scene of SCENES) tl.addLabel(scene.key, scene.time);

  // 1 — Intro (light): the set turns to show its metal lid.
  tl.to(S, { float: 0.4, duration: 1 }, 0)
    .to(S.rig, { ry: 0.5, duration: 2 }, 0)
    .to(S.cam, { dist: 0.92, el: 0.24, ty: 0.1, duration: 2 }, 0)
    .to(S.cam, { side: 1, lift: 0.85, duration: 1.1 }, 0.2)
    .to(S, { env: 1.15, duration: 2 }, 0);

  // 2 — Open (to dark): the stage dims, the lid opens.
  tl.to(S, { tone: 1, float: 0, glow: 0.5, duration: 1.2 }, 2.0)
    .to(S, { lid: 1, duration: 1.1 }, 2.6)
    .to(S.rig, { ry: 0.15, duration: 2 }, 2.2)
    .to(S.cam, { dist: 0.94, el: 0.3, ty: 0.3, duration: 2 }, 2.2)
    .to(S.cam, { side: -1, duration: 0.9 }, 2.0);

  // 3 — Separate: the earbuds lift out and part.
  tl.to(S.b0, { x: -0.72, y: 1.3, z: 0.1, rx: floatRx, ry: 0.55, duration: 1.4 }, 4.3)
    .to(S.b1, { x: 0.72, y: 1.2, z: 0.1, rx: floatRx, ry: -0.55, duration: 1.4 }, 4.3)
    .to(S.cam, { ty: 0.62, el: 0.16, dist: 0.95, duration: 1.6 }, 4.2)
    .to(S.cam, { side: 1, duration: 0.9 }, 4.0)
    .to(S, { waves: 0.55, duration: 0.6 }, 5.2)
    .to(S, { waves: 0, duration: 0.5 }, 6.1);

  // 4 — Rotate: the case drops away, the earbuds turn a full revolution.
  tl.to(S.case, { y: -3.6, s: 0.8, duration: 1.2 }, 6.4)
    .to(S.rig, { ry: 0, duration: 1 }, 6.4)
    .to(S.b0, { x: -0.55, y: 1.05, duration: 1.2 }, 6.4)
    .to(S.b1, { x: 0.55, y: 1.05, duration: 1.2 }, 6.4)
    .to(S.b0, { ry: 0.55 + TAU, duration: 2.2, ease: 'power1.inOut' }, 6.4)
    .to(S.b1, { ry: -0.55 + TAU, duration: 2.2, ease: 'power1.inOut' }, 6.4)
    .to(S.cam, { az: 0.45, el: 0.06, ty: 0.8, dist: 0.74, duration: 1.1 }, 6.4)
    .to(S.cam, { az: -0.2, duration: 1.1 }, 7.5)
    .to(S.cam, { side: -1, duration: 0.9 }, 6.1)
    .to(S, { env: 1.45, exposure: 1.06, duration: 1.1 }, 6.4)
    .to(S, { exposure: 1, duration: 1.1 }, 7.5);

  // 5 — Acoustic design: one earbud separates into layers, then rebuilds.
  tl.to(S.b1, { x: 6, y: 1.5, z: -3, duration: 1 }, 8.6)
    .to(S.b0, { x: 0.3, y: 1.05, rx: 0.12, ry: TAU + Math.PI / 2 - 0.3, duration: 1 }, 8.6)
    .to(S.cam, { az: 0, el: 0.1, ty: 0.9, dist: 0.72, duration: 1 }, 8.6)
    .to(S.cam, { side: 0.3, duration: 0.9 }, 8.3)
    .to(S, { explode: 1, duration: 1 }, 9.4)
    .to(S, { labels: 1, duration: 0.4, ease: 'power1.out' }, 10.1)
    .to(S, { labels: 0, duration: 0.3, ease: 'power1.in' }, 11.1)
    .to(S, { explode: 0, duration: 0.7 }, 11.2)
    .to(S, { env: 1, glow: 0.25, duration: 1 }, 8.6);

  // 6 — Microphone: close on the earbud, voice waves arrive at the mic.
  tl.to(S.b0, { x: 0, y: 1.05, rx: 0.05, ry: TAU + 0.75, duration: 0.9 }, 11.8)
    .to(S.cam, { dist: 0.42, ty: stem ? 0.72 : 1.0, el: 0.05, az: 0.1, duration: 1 }, 11.8)
    .to(S.cam, { side: 1, duration: 0.9 }, 11.6)
    .to(S, { voice: 1, duration: 0.5 }, 12.4)
    .to(S, { voice: 0, duration: 0.4 }, 13.4)
    .to(S, { glow: 0.45, duration: 0.8 }, 12.2);

  // 7 — Silence: both earbuds return, outside noise fades at the boundary.
  tl.to(S.b0, { x: -0.62, y: 1.0, z: 0, rx: floatRx, ry: TAU + 0.55, duration: 1 }, 13.6)
    .to(S.b1, { x: 0.62, y: 1.0, z: 0, rx: floatRx, ry: TAU - 0.55, duration: 1 }, 13.6)
    .to(S.cam, { dist: 0.74, ty: 0.85, el: 0.08, az: 0, duration: 1 }, 13.6)
    .to(S.cam, { side: -1, duration: 0.9 }, 13.4)
    .to(S, { anc: 1, duration: 0.5 }, 14.2)
    .to(S, { calm: 1, duration: 0.9 }, 14.8)
    .to(S, { glow: 0.06, exposure: 0.93, duration: 0.9 }, 14.8);

  // 8 — Power: the earbuds go home, the lid closes, the case turns and charges.
  tl.to(S, { anc: 0, duration: 0.4 }, 15.7)
    .set(S, { calm: 0 }, 16.15)
    .to(S.case, { y: 0, s: 1, duration: 1 }, 15.8)
    .to(S.b0, { x: d0.x, y: 1.2, z: d0.z, rx: d0.rx, ry: TAU, rz: 0, duration: 0.6 }, 16.0)
    .to(S.b1, { x: d1.x, y: 1.2, z: d1.z, rx: d1.rx, ry: TAU, rz: 0, duration: 0.6 }, 16.0)
    .to(S.b0, { y: d0.y, duration: 0.5, ease: 'power2.in' }, 16.6)
    .to(S.b1, { y: d1.y, duration: 0.5, ease: 'power2.in' }, 16.6)
    .to(S, { lid: 0, duration: 0.5 }, 17.1)
    .to(S.cam, { ty: 0.1, dist: 0.82, el: 0.24, duration: 1.2 }, 15.8)
    .to(S.cam, { side: 1, duration: 0.9 }, 15.6)
    .to(S.rig, { ry: 0.45, duration: 1.2 }, 15.8)
    .to(S.rig, { ry: -0.5, duration: 1 }, 17.1)
    .to(S, { led: 1, duration: 0.3 }, 17.1)
    .to(S, { glow: 0.4, exposure: 1, duration: 1 }, 15.8);

  // 9 — Durability: closer, from above, water beads on the lid.
  tl.to(S, { led: 0, duration: 0.3 }, 18.2)
    .to(S.cam, { el: 0.5, dist: 0.8, ty: 0.1, az: 0.35, duration: 1 }, 18.2)
    .to(S.cam, { side: -1, duration: 0.9 }, 18.0)
    .to(S.rig, { ry: -0.95, duration: 2 }, 18.2)
    .to(S, { drops: 1, duration: 0.9 }, 18.6)
    .to(S, { env: 1.55, duration: 1 }, 18.2);

  // 10 — Final (back to light): everything together, camera pulls back.
  tl.to(S, { drops: 0, duration: 0.5 }, 20.3)
    .to(S, { tone: 0, glow: 0.3, duration: 1.2 }, 20.4)
    .to(S, { lid: 1, duration: 0.8 }, 20.6)
    .to(S.b0, { x: -0.62, y: stem ? 1.25 : 0.95, z: 0.1, rx: floatRx, ry: TAU + 0.5, duration: 0.9 }, 21.0)
    .to(S.b1, { x: 0.62, y: stem ? 1.15 : 0.95, z: 0.1, rx: floatRx, ry: TAU - 0.5, duration: 0.9 }, 21.0)
    .to(S.cam, { el: 0.2, dist: 1.42, az: 0, ty: 0.55, duration: 1.4 }, 20.4)
    .to(S.cam, { side: 0, lift: -0.85, duration: 0.9 }, 20.2)
    .to(S.rig, { ry: -0.4, duration: 1.4 }, 20.4)
    .to(S, { env: 1.15, exposure: 1.03, duration: 1.4 }, 20.4);

  tl.set({}, {}, TOTAL);
  return tl;
}

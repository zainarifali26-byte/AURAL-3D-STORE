// Offline renderer (dev only). Exposes window.__aural so the render script
// can export product images and story stills from the same 3D engine the site
// uses. Not included in the production build.
import { createExperience } from '../three/experience.js';
import { createStoryState, buildSceneTimeline, SCENE_FOCUS } from '../story/timeline.js';
import { getProduct, getColour } from '../data/products.js';

const stage = document.getElementById('stage');

function setSize(w, h) {
  stage.style.width = `${w}px`;
  stage.style.height = `${h}px`;
}

function capture(experience, time) {
  experience.renderNow(time);
  const url = experience.canvas.toDataURL('image/webp', 0.86);
  experience.dispose();
  return url;
}

function poseProduct(S, view, dockX) {
  S.intro = 1;
  S.float = 0;
  S.glow = 0;
  S.cam.side = 0;
  S.cam.lift = 0;
  S.cam.az = 0;
  if (view === 'set') {
    Object.assign(S.cam, { el: 0.2, dist: 0.72, ty: 0.42 });
    S.rig.ry = -0.42;
    S.lid = 1;
    Object.assign(S.b0, { x: -0.66, y: 0.95, rx: -1.0, ry: 0.25 });
    Object.assign(S.b1, { x: 0.66, y: 0.95, rx: -1.0, ry: -0.25 });
    S.env = 1.15;
  } else if (view === 'buds') {
    Object.assign(S.cam, { el: 0.16, dist: 0.47, ty: 0 });
    S.rig.ry = 0;
    S.case.y = -8;
    Object.assign(S.b0, { x: -0.62, y: 0.05, z: 0, rx: 0.15, ry: 1.05 });
    Object.assign(S.b1, { x: 0.62, y: -0.05, z: 0, rx: 0.15, ry: -1.05 });
    S.env = 1.3;
  } else {
    Object.assign(S.cam, { el: 0.3, dist: 0.56, ty: 0 });
    S.rig.ry = -0.6;
    S.lid = 0;
    Object.assign(S.b0, { x: -dockX, y: 0.02 });
    Object.assign(S.b1, { x: dockX, y: 0.02 });
    S.led = 0.7;
    S.env = 1.2;
  }
  S.version++;
}

window.__aural = {
  product(productId, colourId, view, w = 1000, h = 800) {
    setSize(w, h);
    const product = getProduct(productId);
    const colour = getColour(product, colourId);
    const S = createStoryState();
    const experience = createExperience({
      container: stage,
      state: S,
      model: product.model,
      finish: colour.finish,
      maxDpr: 1,
      preserveDrawingBuffer: true,
    });
    poseProduct(S, view, experience.dims.dockX);
    return capture(experience, 0.6);
  },

  scene(key, w = 1400, h = 1000) {
    setSize(w, h);
    const product = getProduct('pro');
    const S = createStoryState();
    const tl = buildSceneTimeline(S);
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
    const url = capture(experience, 1.35);
    tl.kill();
    return url;
  },
};

window.__auralReady = true;

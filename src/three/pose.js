// Pose helpers shared by the 3D model and the story timeline. This file has
// no three.js import, so the timeline can use it without pulling three.js
// into the main bundle.

export function dockX(model) {
  return model.case[0] * (model.budStyle === 'stem' ? 0.42 : 0.43);
}

/** Resting pose of one earbud inside its case. side: -1 left, 1 right. */
export function dockPose(model, side) {
  if (model.budStyle === 'stem') {
    // Stem down, head up, faceplate to the front.
    return { x: side * dockX(model), y: 0.1, z: -0.06, rx: 0, ry: 0, rz: 0 };
  }
  // Nozzle down, faceplate up.
  return { x: side * dockX(model), y: 0.02, z: 0, rx: -Math.PI / 2, ry: 0, rz: 0 };
}

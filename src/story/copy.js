// Story copy, one entry per scene. `side` is where the copy sits on wide
// screens (the product takes the other side). On portrait screens all copy
// sits below the product.
//
// Wording rule: AURAL is a concept. Anything that sounds like a spec is
// labelled as the demo specification, and nothing claims a certification.
export const heroCopy = {
  eyebrow: 'Wireless earbuds concept',
};

export const sceneCopy = {
  reveal: {
    side: 'left',
    eyebrow: '01 / Reveal',
    title: 'Opens like it was made to.',
    body: 'A soft-close lid, a magnetic cradle and two earbuds that lift out ready to play. Every surface was drawn before a single spec was written.',
  },
  rotate: {
    side: 'right',
    eyebrow: '02 / Form',
    title: 'Shaped from every angle.',
    body: 'A satin shell, a machined accent ring and a contour drawn to sit flush in the ear. Turn it any way you like. There is no back side.',
  },
  explode: {
    side: 'center',
    eyebrow: '03 / Inside',
    title: 'Engineered in layers.',
    body: 'Shell, control board, microphone, battery cell, acoustic driver, housing and ear tip. Seven parts, each with one job.',
    note: 'Illustrative concept visualisation. Not a teardown of real hardware.',
  },
  sound: {
    side: 'left',
    eyebrow: '04 / Sound',
    title: 'Every Detail. Every Frequency.',
    body: 'A dynamic driver concept tuned for clarity over loudness, so the quiet parts of a recording stay in the room with you.',
  },
  anc: {
    side: 'right',
    eyebrow: '05 / Silence',
    title: 'Find Your Own Silence.',
    body: 'Outside noise moves in and fades at the edge. Adaptive noise cancellation is part of the AURAL Pro and Studio demo specification.',
    note: 'AURAL Air has no noise cancellation. AURAL Sport has an ambient mode only.',
  },
  battery: {
    side: 'left',
    eyebrow: '06 / Power',
    title: 'A full day, then some.',
    body: 'Drop them in and close the lid. The AURAL Pro demo specification lists up to 8 hours per charge and 32 hours with the case.',
    note: 'Demo specification. Charging shown for illustration.',
  },
  water: {
    side: 'right',
    eyebrow: '07 / Durability',
    title: 'Made for weather, not just rooms.',
    body: 'A sealed seam and a satin finish that lets water bead and roll away. The demo specification describes splash resistance.',
    note: 'Concept only. No IP rating is claimed.',
  },
  final: {
    side: 'center',
    eyebrow: '08 / AURAL',
    title: 'Your World. Your Sound.',
    body: 'Four concepts, one idea of what earbuds should feel like.',
  },
};

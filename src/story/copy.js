// Story copy, one entry per scene. `side` is where the copy sits on wide
// screens (the product takes the other side); on portrait screens all copy
// sits below the product. Scene tone (light/dark) comes from timeline.js.
//
// Wording rule: AURAL is a concept. Anything that sounds like a spec is
// labelled as demo, and nothing claims a certification or a measurement.
export const heroCopy = {
  eyebrow: 'AURAL Pro X · Wireless earbuds concept',
};

export const sceneCopy = {
  intro: {
    side: 'left',
    eyebrow: 'Meet Pro X',
    title: 'Black, gold and very quiet.',
    body: 'The flagship AURAL concept: gloss stem earbuds, adaptive noise cancellation and a charging case with a polished champagne-gold lid.',
  },
  open: {
    side: 'right',
    eyebrow: '01 / Open',
    title: 'Opens like it was made to.',
    body: 'A soft-close lid on a metal hinge, a magnetic cradle and a gentle click when it settles. Every surface was drawn before a single spec was written.',
  },
  separate: {
    side: 'left',
    eyebrow: '02 / Lift',
    title: 'Ready when you are.',
    body: 'Two earbuds lift out of the cradle, each balanced to sit close to the ear, with a short stem that keeps the weight low.',
  },
  rotate: {
    side: 'right',
    eyebrow: '03 / Form',
    title: 'Shaped from every angle.',
    body: 'A gloss shell, a fine accent ring and a contour drawn to sit flush in the ear. Turn it any way you like. There is no back side.',
  },
  acoustic: {
    side: 'center',
    eyebrow: '04 / Acoustics',
    title: 'Engineered in layers.',
    body: 'Shell, control board, battery cell, acoustic driver, housing, stem and ear tip. The driver sits close to the ear canal, with space behind it to breathe.',
    note: 'Illustrative concept visualisation, not a teardown of real hardware.',
  },
  mic: {
    side: 'left',
    eyebrow: '05 / Voice',
    title: 'Heard clearly on every call.',
    body: 'A microphone at the tip of each stem sits closer to your mouth, so your voice arrives first and the street around it second.',
    note: 'Demo feature. Call quality is not measured or verified.',
  },
  anc: {
    side: 'right',
    eyebrow: '06 / Silence',
    title: 'Find your own silence.',
    body: 'Outside noise moves in and fades at the edge. Adaptive noise cancellation is part of the Pro X, Elite and Studio demo specifications.',
    note: 'Air, Neo, Sport and One do not have active noise cancellation.',
  },
  battery: {
    side: 'left',
    eyebrow: '07 / Power',
    title: 'A full day, then some.',
    body: 'Drop them in and close the lid. The Pro X demo specification describes long battery life, with more in the case.',
    note: 'Demo specification. Charging shown for illustration.',
  },
  water: {
    side: 'right',
    eyebrow: '08 / Durability',
    title: 'Made for weather, not just rooms.',
    body: 'A sealed seam and a gloss finish that lets water bead and roll away. The demo specification describes splash resistance.',
    note: 'Concept only. No IP rating is claimed.',
  },
  final: {
    side: 'center',
    eyebrow: 'AURAL Pro X',
    title: 'Your World. Your Sound.',
    body: 'Eight concepts, one idea of what listening should feel like.',
  },
};

// Technology feature categories shown on the home page. "models" is derived
// from the product catalogue, so these tiles can never disagree with the
// product pages. All descriptions refer to demo concepts, not measured specs.
import { products } from './products.js';

const has = (test) => products.filter(test).map((p) => p.name.replace('AURAL ', ''));

export const features = [
  {
    id: 'anc',
    icon: 'anc',
    title: 'Active noise cancellation',
    body: 'Microphones listen to the room and the earbuds play the opposite, so engines and air-conditioning fade into the background.',
    models: has((p) => /ANC/.test(p.specs.anc)),
    size: 'xl',
  },
  {
    id: 'transparency',
    icon: 'ear',
    title: 'Transparency mode',
    body: 'Lets the world back in for a station announcement or a quick chat, without taking an earbud out.',
    models: has((p) => p.features.some((f) => /Transparency|Ambient/.test(f))),
  },
  {
    id: 'audio',
    icon: 'wave',
    title: 'High-quality audio',
    body: 'Drivers tuned for clarity first, so detail and voices stay clear at a sensible volume.',
    models: has(() => true),
  },
  {
    id: 'bass',
    icon: 'bass',
    title: 'Deep bass',
    body: 'A good seal does most of the work. Every in-ear model ships with several ear-tip sizes in the concept.',
    models: has((p) => p.kind === 'earbuds' || p.id === 'studio'),
  },
  {
    id: 'latency',
    icon: 'latency',
    title: 'Low latency',
    body: 'A dedicated mode keeps sound and picture in step for games and video.',
    models: has((p) => /Low-latency|Game/.test(p.specs.latency)),
  },
  {
    id: 'mic',
    icon: 'mic',
    title: 'Microphone quality',
    body: 'Microphones placed toward your mouth pick up your voice ahead of the street around you.',
    models: has((p) => p.features.some((f) => /microphone|call/i.test(f))),
  },
  {
    id: 'battery',
    icon: 'battery',
    title: 'Battery life',
    body: 'From a full working day in the earbuds to several days in the over-ear models, depending on the concept.',
    models: has((p) => /Long|Extended/.test(p.specs.battery)),
    size: 'wide',
  },
  {
    id: 'charging',
    icon: 'bolt',
    title: 'Fast charging',
    body: 'A short top-up in the case gets you through a commute. Several concepts also charge wirelessly.',
    models: has((p) => /fast|wireless/i.test(p.specs.chargingCase) || p.features.some((f) => /Fast charging/.test(f))),
  },
  {
    id: 'bluetooth',
    icon: 'bluetooth',
    title: 'Bluetooth connectivity',
    body: 'Current Bluetooth on every model, with multipoint on the flagship concepts to switch between phone and laptop.',
    models: has(() => true),
  },
  {
    id: 'water',
    icon: 'drop',
    title: 'Water resistance',
    body: 'Sealed seams for sweat and splashes on the in-ear concepts. No IP rating is claimed for any model.',
    models: has((p) => /resistant/i.test(p.specs.durability)),
  },
];

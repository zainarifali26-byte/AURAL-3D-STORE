import { useSyncExternalStore } from 'react';

function subscribeTo(query) {
  return (callback) => {
    const mql = window.matchMedia(query);
    mql.addEventListener('change', callback);
    return () => mql.removeEventListener('change', callback);
  };
}

const subscribers = new Map();

export function useMedia(query) {
  if (!subscribers.has(query)) subscribers.set(query, subscribeTo(query));
  return useSyncExternalStore(
    subscribers.get(query),
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export function useReducedMotion() {
  return useMedia('(prefers-reduced-motion: reduce)');
}

export function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

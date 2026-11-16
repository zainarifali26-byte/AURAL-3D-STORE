// The AURAL "studio pearl" backdrop, shared by the photo processor and the
// render pipeline so every product image sits on exactly the same set.
// Runs in a browser canvas context.
export function paintBackdrop(ctx, w, h) {
  const g = ctx.createRadialGradient(w * 0.5, h * 0.42, 0, w * 0.5, h * 0.48, Math.max(w, h) * 0.78);
  g.addColorStop(0, '#f8f6f2');
  g.addColorStop(0.55, '#efebe5');
  g.addColorStop(1, '#e2ddd5');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

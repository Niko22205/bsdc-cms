/**
 * PERCEPTION RESOLVER
 *
 * Single rule: opacity = 1 − clamp(distance / FAR_DIST, 0, 1)
 * Scale:       lerp(0.92, 1.0, same t) — depth illusion without blur
 *
 * No blur. No y-offset. No arrival pulse. No FX.
 * Camera distance determines everything. Rendering logic determines nothing.
 */

export interface NodePerception {
  opacity: number
  scale:   number
}

const FAR_DIST = 0.22  // beyond this, node is fully transparent

function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function computeNodePerception(progress: number, nodeAt: number): NodePerception {
  const dist = Math.abs(progress - nodeAt)
  const t    = clamp(dist / FAR_DIST, 0, 1)  // 0 = camera on node, 1 = camera far away

  return {
    opacity: 1 - t,               // 1.0 when active, 0.0 when far
    scale:   lerp(1.0, 0.92, t),  // 1.0 when active, 0.92 when far (depth illusion)
  }
}

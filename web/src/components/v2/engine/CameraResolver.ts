/**
 * Continuous camera — single cubic bezier through world space.
 *
 * t ∈ [0,1] → (cx, cy, scale).
 * No anchors. No segments. No named zones.
 * The curve passes near content objects; content is not what defines the curve.
 */

export interface CameraState {
  tx:    number
  ty:    number
  scale: number
}

// Cubic bezier control points for camera center path
// P0 = start (near hero), P3 = end (near contact)
// P1, P2 = internal shaping points — not sections, just curve shape
const P = [
  [700,  700],   // P0 — start
  [2500, 1650],  // P1 — pulls path down through about/certificates
  [5500,  550],  // P2 — pulls path up through services/projects
  [7300, 1300],  // P3 — end near contact/footer
] as const

function bezier(t: number): [number, number] {
  const mt = 1 - t, mt2 = mt * mt, mt3 = mt2 * mt
  const t2  = t * t,  t3  = t2 * t
  return [
    mt3*P[0][0] + 3*mt2*t*P[1][0] + 3*mt*t2*P[2][0] + t3*P[3][0],
    mt3*P[0][1] + 3*mt2*t*P[1][1] + 3*mt*t2*P[2][1] + t3*P[3][1],
  ]
}

// Scale: gentle variation — slightly wider in mid-journey, never dramatic
const SCALE_NEAR = 0.60   // at start/end
const SCALE_FAR  = 0.50   // at journey midpoint

export function computeCamera(t: number, vpW: number, vpH: number): CameraState {
  const [cx, cy] = bezier(t)
  const scale = SCALE_NEAR - Math.sin(t * Math.PI) * (SCALE_NEAR - SCALE_FAR)
  return {
    tx:    vpW / 2 - cx * scale,
    ty:    vpH / 2 - cy * scale,
    scale,
  }
}

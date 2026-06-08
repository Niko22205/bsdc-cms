'use client'

import { useRef, useImperativeHandle, forwardRef } from 'react'
import { NODE_MAP, PATH_LENGTH } from '../engine/NodeRegistry'

// ── Catmull-Rom spline through waypoints ──────────────────────────────────────

function catmullRom(pts: [number, number][]): string {
  if (pts.length < 2) return ''
  let d = `M ${pts[0][0]} ${pts[0][1]}`
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[Math.max(0, i - 2)]
    const p1 = pts[i - 1]
    const p2 = pts[i]
    const p3 = pts[Math.min(pts.length - 1, i + 1)]
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2[0]},${p2[1]}`
  }
  return d
}

const WAYPOINTS = NODE_MAP.map(n => n.waypoint)
const PATH_D    = catmullRom(WAYPOINTS)

// ── Public handle for imperative progress updates ─────────────────────────────

export interface ExpeditionPathHandle {
  /** Called on every scroll tick. progress = 0..1 */
  setProgress(progress: number): void
}

// ── Component ─────────────────────────────────────────────────────────────────

export const ExpeditionPath = forwardRef<ExpeditionPathHandle>(
  function ExpeditionPath(_props, ref) {
    const drawPathRef = useRef<SVGPathElement>(null)

    useImperativeHandle(ref, () => ({
      setProgress(progress: number) {
        const el = drawPathRef.current
        if (!el) return
        // Animate strokeDashoffset: 1000 (hidden) → 0 (fully drawn)
        el.style.strokeDashoffset = String(PATH_LENGTH * (1 - progress))
      },
    }))

    return (
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <filter id="v2-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Static ghost path — always visible at low opacity */}
        <path
          d={PATH_D}
          fill="none"
          stroke="#4A5343"
          strokeWidth="0.3"
          strokeDasharray="2 1.8"
          opacity="0.18"
        />

        {/* Progressive draw path — driven imperatively via setProgress() */}
        <path
          ref={drawPathRef}
          d={PATH_D}
          fill="none"
          stroke="#4A5343"
          strokeWidth="0.5"
          strokeLinecap="round"
          pathLength={PATH_LENGTH}
          strokeDasharray={PATH_LENGTH}
          strokeDashoffset={PATH_LENGTH}
          opacity="0.75"
          filter="url(#v2-glow)"
        />

        {/* Node markers — one per registered node */}
        {NODE_MAP.map((node, i) => {
          const [cx, cy] = node.waypoint
          const isFirst  = i === 0
          return (
            <g key={node.id} opacity="0.5">
              {/* Halo ring */}
              <circle cx={cx} cy={cy} r={isFirst ? 3.5 : 2.5}
                fill="none" stroke="#4A5343" strokeWidth="0.2" />
              {/* Dot */}
              <circle cx={cx} cy={cy} r={isFirst ? 1.8 : 1.2}
                fill="#4A5343" />
            </g>
          )
        })}
      </svg>
    )
  }
)

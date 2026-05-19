"use client"

export interface TimelineItem {
  year: string | null
  label: string
  desc: string
}

// Waypoints as % of viewBox (0-100 × 0-100) — snake from bottom-left to upper area
const ALL_WAYPOINTS: [number, number][] = [
  [14, 84],
  [50, 70],
  [82, 56],
  [24, 43],
  [72, 30],
  [42, 18],
  [80,  9],
  [56,  4],
]

function catmullRomPath(pts: [number, number][]): string {
  if (pts.length < 2) return pts.length ? `M ${pts[0][0]} ${pts[0][1]}` : ""
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

export default function TreasureMap({ items }: { items: TimelineItem[] }) {
  const n = Math.min(items.length, ALL_WAYPOINTS.length)
  const pts = ALL_WAYPOINTS.slice(0, n)
  const pathD = catmullRomPath(pts)
  if (!pathD) return null

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        <filter id="expedition-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Copper dashed expedition path */}
      <path
        className="about-map-path"
        d={pathD}
        fill="none"
        stroke="#B87333"
        strokeWidth="0.45"
        strokeLinecap="round"
        strokeDasharray="2 1.6"
        pathLength="1000"
        strokeDashoffset={1000}
        filter="url(#expedition-glow)"
        opacity="0.9"
      />

      {/* Markers + labels per item */}
      {pts.map(([cx, cy], i) => {
        const item = items[i]
        const isFirst = i === 0
        const labelRight = cx < 52
        const lx = labelRight ? cx + 3.2 : cx - 3.2
        const anchor = labelRight ? "start" : "end"
        const labelText = item.label.length > 22 ? item.label.slice(0, 21) + "…" : item.label

        return (
          <g key={i} className="about-map-marker" opacity="0">
            {/* Outer halo ring */}
            <circle
              cx={cx} cy={cy}
              r={isFirst ? 3.8 : 2.8}
              fill="none"
              stroke="#B87333"
              strokeWidth="0.25"
              opacity="0.35"
            />

            {isFirst ? (
              // ✕ mark for founding year
              <g filter="url(#expedition-glow)">
                <circle cx={cx} cy={cy} r="2.2" fill="none" stroke="#B87333" strokeWidth="0.5" />
                <line x1={cx-1.6} y1={cy-1.6} x2={cx+1.6} y2={cy+1.6} stroke="#B87333" strokeWidth="0.65" strokeLinecap="round" />
                <line x1={cx+1.6} y1={cy-1.6} x2={cx-1.6} y2={cy+1.6} stroke="#B87333" strokeWidth="0.65" strokeLinecap="round" />
              </g>
            ) : (
              // Regular filled dot
              <g filter="url(#expedition-glow)">
                <circle cx={cx} cy={cy} r="1.8" fill="#B87333" opacity="0.92" />
                <circle cx={cx} cy={cy} r="0.75" fill="#07111f" />
              </g>
            )}

            {/* Year */}
            {item.year && (
              <text
                x={lx} y={cy - 2.2}
                fontSize="1.75"
                fontFamily="'Courier New', monospace"
                fontWeight="700"
                fill="#B87333"
                textAnchor={anchor}
                letterSpacing="0.08"
              >
                {item.year}
              </text>
            )}

            {/* Milestone label */}
            <text
              x={lx} y={cy + 2.4}
              fontSize="1.45"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight="600"
              fill="white"
              textAnchor={anchor}
              opacity="0.88"
            >
              {labelText}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

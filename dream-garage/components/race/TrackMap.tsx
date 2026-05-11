import { Stage, TrackSection } from '@/lib/raceEngine'

type Point = [number, number]

function computeWaypoints(sections: TrackSection[]): Point[] {
  let x = 0, y = 0, heading = 0 // 0° = east (+x)
  const pts: Point[] = [[x, y]]
  for (const s of sections) {
    const rad = (heading * Math.PI) / 180
    x += Math.cos(rad) * s.distance
    y += Math.sin(rad) * s.distance
    heading += s.turnDegrees
    pts.push([x, y])
  }
  return pts
}

function normalise(pts: Point[], w: number, h: number, pad: number): Point[] {
  const xs = pts.map(p => p[0])
  const ys = pts.map(p => p[1])
  const minX = Math.min(...xs), maxX = Math.max(...xs)
  const minY = Math.min(...ys), maxY = Math.max(...ys)
  const rX = maxX - minX || 1
  const rY = maxY - minY || 1
  const scale = Math.min((w - pad * 2) / rX, (h - pad * 2) / rY)
  const offX = pad + ((w - pad * 2) - rX * scale) / 2
  const offY = pad + ((h - pad * 2) - rY * scale) / 2
  return pts.map(([px, py]) => [
    (px - minX) * scale + offX,
    (py - minY) * scale + offY,
  ])
}

type Props = {
  stage: Stage
  currentSectionIdx?: number
  width?: number
  height?: number
  accent?: string
}

export function TrackMap({ stage, currentSectionIdx, width = 220, height = 150, accent = '#FF70A6' }: Props) {
  const pad = 14
  const raw = computeWaypoints(stage.sections)
  const pts = normalise(raw, width, height, pad)

  const isDrag = stage.sections.length === 1

  if (isDrag) {
    const [x1, y1] = pts[0]
    const [x2, y2] = pts[1]
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.18)" strokeWidth={10} strokeLinecap="round" />
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.6)" strokeWidth={2} strokeLinecap="round" strokeDasharray="6 4" />
        <circle cx={x1} cy={y1} r={4} fill={accent} />
        <circle cx={x2} cy={y2} r={4} fill="rgba(255,255,255,0.5)" />
        <polygon
          points={`${mx},${my - 6} ${mx - 4},${my + 4} ${mx + 4},${my + 4}`}
          fill={accent}
          opacity={0.8}
        />
      </svg>
    )
  }

  const polyPts = pts.map(p => p.join(',')).join(' ')

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* Track body */}
      <polyline
        points={polyPts}
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth={8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Track edge */}
      <polyline
        points={polyPts}
        fill="none"
        stroke="rgba(255,255,255,0.65)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Section colouring when live */}
      {currentSectionIdx !== undefined && pts.slice(0, -1).map((_, i) => {
        const done = i < currentSectionIdx
        const active = i === currentSectionIdx
        if (!done && !active) return null
        return (
          <line
            key={i}
            x1={pts[i][0]} y1={pts[i][1]}
            x2={pts[i + 1][0]} y2={pts[i + 1][1]}
            stroke={active ? accent : 'rgba(255,255,255,0.65)'}
            strokeWidth={active ? 3 : 1.5}
            strokeLinecap="round"
          />
        )
      })}

      {/* Start/finish dot */}
      <circle cx={pts[0][0]} cy={pts[0][1]} r={4} fill={accent} />
      <circle cx={pts[0][0]} cy={pts[0][1]} r={7} fill="none" stroke={accent} strokeWidth={1.5} opacity={0.5} />
    </svg>
  )
}

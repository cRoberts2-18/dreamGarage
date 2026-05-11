import { card } from '@/app/_cards/repo'

export type SectionType =
  | 'straight_long'
  | 'straight_medium'
  | 'straight_short'
  | 'hairpin_left'
  | 'hairpin_right'
  | 'corner_left'
  | 'corner_right'
  | 'sweeper_left'
  | 'sweeper_right'

export type TrackSection = {
  type: SectionType
  distance: number
  turnDegrees: number
  label: string
  arrow: string
}

export type Stage = {
  sections: TrackSection[]
  surface: 'tarmac' | 'dirt'
  name: string
}

export type RaceResult = {
  playerSectionTimes: number[]
  opponentSectionTimes: number[]
  playerTotal: number
  opponentTotal: number
  cumulativeLeadAfterSection: number[]
}

const S: Record<SectionType, Pick<TrackSection, 'label' | 'arrow'>> = {
  straight_long:   { label: 'Long Straight',     arrow: '↑' },
  straight_medium: { label: 'Straight',           arrow: '↑' },
  straight_short:  { label: 'Short Straight',     arrow: '↑' },
  hairpin_left:    { label: 'Left Hairpin',        arrow: '↲' },
  hairpin_right:   { label: 'Right Hairpin',       arrow: '↳' },
  corner_left:     { label: 'Left Turn',           arrow: '↖' },
  corner_right:    { label: 'Right Turn',          arrow: '↗' },
  sweeper_left:    { label: 'Left Sweeper',        arrow: '↰' },
  sweeper_right:   { label: 'Right Sweeper',       arrow: '↱' },
}

function sec(type: SectionType, distance: number, turnDegrees: number): TrackSection {
  return { type, distance, turnDegrees, ...S[type] }
}

// Seven preset circuits — turns in each sum to 360°
const CIRCUITS: { name: string; sections: TrackSection[] }[] = [
  {
    name: 'Oval Circuit',
    sections: [
      sec('straight_long',   800, 0),
      sec('sweeper_right',   200, 90),
      sec('straight_medium', 300, 0),
      sec('sweeper_right',   200, 90),
      sec('straight_long',   800, 0),
      sec('sweeper_right',   200, 90),
      sec('straight_medium', 300, 0),
      sec('sweeper_right',   200, 90),
      // 4 × 90° = 360°
    ],
  },
  {
    name: 'Technical Circuit',
    sections: [
      sec('straight_medium', 500, 0),
      sec('corner_right',    150, 90),
      sec('straight_short',  200, 0),
      sec('hairpin_left',    100, -45),
      sec('straight_short',  150, 0),
      sec('corner_right',    150, 135),
      sec('straight_medium', 400, 0),
      sec('corner_right',    150, 90),
      sec('straight_short',  200, 0),
      sec('hairpin_left',    100, -45),
      sec('straight_short',  150, 0),
      sec('corner_right',    150, 135),
      // 90−45+135+90−45+135 = 360°
    ],
  },
  {
    name: 'High Speed Circuit',
    sections: [
      sec('straight_long',   1000, 0),
      sec('sweeper_right',    200, 90),
      sec('straight_medium',  400, 0),
      sec('corner_right',     150, 90),
      sec('straight_long',   1000, 0),
      sec('sweeper_right',    200, 90),
      sec('straight_medium',  400, 0),
      sec('corner_right',     150, 90),
      // 4 × 90° = 360°
    ],
  },
  {
    // Tight city streets — handling-dominant, punishes top speed
    name: 'Street Circuit',
    sections: [
      sec('straight_short',  180, 0),
      sec('hairpin_right',    80, 90),
      sec('straight_short',  120, 0),
      sec('corner_left',     100, -45),
      sec('straight_short',  180, 0),
      sec('corner_right',    120, 90),
      sec('straight_short',   80, 0),
      sec('hairpin_left',     80, -45),
      sec('straight_short',  120, 0),
      sec('corner_right',    120, 135),
      sec('straight_short',  180, 0),
      sec('hairpin_right',    80, 90),
      sec('straight_short',  120, 0),
      sec('corner_left',     100, -45),
      sec('straight_short',  150, 0),
      sec('corner_right',    120, 90),
      // 90−45+90−45+135+90−45+90 = 360°
    ],
  },
  {
    // Minimal corners, pure top-speed battle
    name: 'Power Circuit',
    sections: [
      sec('straight_long',   1400, 0),
      sec('corner_right',     150, 90),
      sec('straight_long',   1000, 0),
      sec('sweeper_right',    200, 45),
      sec('straight_long',   1200, 0),
      sec('corner_right',     150, 90),
      sec('straight_long',    900, 0),
      sec('corner_right',     150, 90),
      sec('straight_long',    800, 0),
      sec('sweeper_right',    200, 45),
      // 90+45+90+90+45 = 360°
    ],
  },
  {
    // Fast flowing sweepers with a tight infield section
    name: 'Flowing Parkland Circuit',
    sections: [
      sec('straight_long',   900, 0),
      sec('sweeper_right',   250, 45),
      sec('straight_long',   700, 0),
      sec('sweeper_right',   250, 90),
      sec('straight_medium', 500, 0),
      sec('corner_right',    200, 90),
      sec('straight_medium', 400, 0),
      sec('sweeper_left',    200, -45),
      sec('straight_long',   800, 0),
      sec('sweeper_right',   250, 90),
      sec('straight_medium', 400, 0),
      sec('sweeper_right',   250, 45),
      sec('straight_medium', 400, 0),
      sec('sweeper_left',    200, -45),
      sec('straight_medium', 400, 0),
      sec('sweeper_right',   250, 90),
      // 45+90+90−45+90+45−45+90 = 360°
    ],
  },
  {
    // Multiple direction changes — rewards balanced all-rounders
    name: 'Stadium Circuit',
    sections: [
      sec('straight_medium', 400, 0),
      sec('corner_right',    150, 90),
      sec('straight_short',  200, 0),
      sec('corner_left',     100, -45),
      sec('straight_short',  150, 0),
      sec('corner_right',    150, 135),
      sec('straight_medium', 350, 0),
      sec('corner_right',    150, 90),
      sec('straight_short',  200, 0),
      sec('hairpin_left',    100, -45),
      sec('straight_medium', 350, 0),
      sec('corner_right',    150, 90),
      sec('straight_short',  200, 0),
      sec('corner_left',     100, -45),
      sec('straight_medium', 300, 0),
      sec('corner_right',    150, 90),
      // 90−45+135+90−45+90−45+90 = 360°
    ],
  },
]

const RALLY_POOL: TrackSection[] = [
  sec('straight_long',   2400, 0),
  sec('straight_long',   1800, 0),
  sec('straight_medium', 1200, 0),
  sec('straight_medium',  900, 0),
  sec('straight_short',   600, 0),
  sec('straight_short',   450, 0),
  sec('corner_left',      360, -60),
  sec('corner_right',     360, 60),
  sec('hairpin_left',     240, -90),
  sec('hairpin_right',    240, 90),
  sec('sweeper_left',     540, -45),
  sec('sweeper_right',    540, 45),
]

export function generateStage(type: 'drag' | 'circuit' | 'rally', surface?: 'tarmac' | 'dirt'): Stage {
  if (type === 'drag') {
    return {
      sections: [sec('straight_long', 400, 0)],
      surface: 'tarmac',
      name: 'Drag Strip',
    }
  }

  if (type === 'circuit') {
    const template = CIRCUITS[Math.floor(Math.random() * CIRCUITS.length)]
    return { sections: template.sections, surface: 'tarmac', name: template.name }
  }

  // rally
  const stageSurface = surface ?? (Math.random() < 0.5 ? 'dirt' : 'tarmac')
  const count = 6 + Math.floor(Math.random() * 4) // 6–9 sections
  const sections: TrackSection[] = []
  for (let i = 0; i < count; i++) {
    sections.push(RALLY_POOL[Math.floor(Math.random() * RALLY_POOL.length)])
  }
  return {
    sections,
    surface: stageSurface,
    name: stageSurface === 'dirt' ? 'Dirt Stage' : 'Tarmac Stage',
  }
}

function effectiveSpeed(section: TrackSection, car: card, surface: 'tarmac' | 'dirt'): number {
  const ts = car.topSpeed
  const hp = car.horsepower / 10
  const h = car.handling * (surface === 'dirt' ? 0.65 : 1.0)

  switch (section.type) {
    case 'straight_long':
      return ts * 0.65 + hp * 0.35
    case 'straight_medium':
      return ts * 0.55 + hp * 0.45
    case 'straight_short':
      return ts * 0.40 + hp * 0.60
    case 'hairpin_left':
    case 'hairpin_right':
      return h * 15 + hp * 0.2
    case 'corner_left':
    case 'corner_right':
      return h * 20 + ts * 0.3 + hp * 0.1
    case 'sweeper_left':
    case 'sweeper_right':
      return ts * 0.5 + h * 12
  }
}

// Calibrated so a typical B-class car (155 mph, 300 hp) runs the quarter mile in ~12s,
// a circuit lap in ~90–105s, and a rally stage in ~3–4 minutes.
const TIME_SCALE = 3.34

function sectionTime(section: TrackSection, car: card, surface: 'tarmac' | 'dirt'): number {
  const speed = effectiveSpeed(section, car, surface)
  const variance = Math.random() * 0.16 - 0.08
  return (section.distance / speed) * (1 + variance) * TIME_SCALE
}

const RACE_BASE_REWARD: Record<string, number> = {
  drag: 100,
  circuit: 250,
  rally: 500,
}

export function rewardRange(type: string): [number, number] {
  const base = RACE_BASE_REWARD[type] ?? 100
  return [base, base * 5]
}

export function calculateReward(type: string, difficulty: number): number {
  return (RACE_BASE_REWARD[type] ?? 100) * difficulty
}

export function simulateRace(stage: Stage, playerCar: card, opponentCar: card): RaceResult {
  const playerSectionTimes: number[] = []
  const opponentSectionTimes: number[] = []
  const cumulativeLeadAfterSection: number[] = []
  let cumulativeLead = 0

  for (const section of stage.sections) {
    const pt = sectionTime(section, playerCar, stage.surface)
    const ot = sectionTime(section, opponentCar, stage.surface)
    playerSectionTimes.push(pt)
    opponentSectionTimes.push(ot)
    // positive = player is behind (slower), negative = player is ahead (faster)
    cumulativeLead += pt - ot
    cumulativeLeadAfterSection.push(cumulativeLead)
  }

  return {
    playerSectionTimes,
    opponentSectionTimes,
    playerTotal: playerSectionTimes.reduce((a, b) => a + b, 0),
    opponentTotal: opponentSectionTimes.reduce((a, b) => a + b, 0),
    cumulativeLeadAfterSection,
  }
}

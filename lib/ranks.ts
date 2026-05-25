export type RankKey = 'sprout' | 'sapling' | 'tree' | 'forest' | 'ecosystem'

export interface Rank {
  key: RankKey
  label: string
  emoji: string
  minPoints: number
  color: string      // tailwind text color class
  bg: string         // tailwind bg color class
}

export const RANKS: Rank[] = [
  { key: 'ecosystem', label: 'Ecosystem', emoji: '🌍', minPoints: 10000, color: 'text-blue-400',    bg: 'bg-blue-500/15' },
  { key: 'forest',    label: 'Forest',    emoji: '🌲', minPoints: 2000,  color: 'text-cyan-400',    bg: 'bg-cyan-500/15' },
  { key: 'tree',      label: 'Tree',      emoji: '🌳', minPoints: 500,   color: 'text-teal-400',    bg: 'bg-teal-500/15' },
  { key: 'sapling',   label: 'Sapling',   emoji: '🌿', minPoints: 100,   color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  { key: 'sprout',    label: 'Sprout',    emoji: '🌱', minPoints: 0,     color: 'text-green-400',   bg: 'bg-green-500/15' },
]

export function getRank(totalPoints: number): Rank {
  return RANKS.find((r) => totalPoints >= r.minPoints) ?? RANKS[RANKS.length - 1]
}

export function getNextRank(currentRankKey: RankKey): Rank | null {
  const idx = RANKS.findIndex((r) => r.key === currentRankKey)
  if (idx <= 0) return null
  return RANKS[idx - 1]
}

export function getRankProgress(totalPoints: number): { current: Rank; next: Rank | null; progress: number } {
  const current = getRank(totalPoints)
  const next = getNextRank(current.key)
  if (!next) return { current, next: null, progress: 100 }
  const range = next.minPoints - current.minPoints
  const earned = totalPoints - current.minPoints
  return { current, next, progress: Math.min(100, Math.round((earned / range) * 100)) }
}

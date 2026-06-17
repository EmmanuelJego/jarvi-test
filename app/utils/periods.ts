/**
 * Gestion des périodes du filtre Statistiques.
 *
 * Une `Period` est un intervalle [from, to[ exprimé en timestamps ISO (UTC),
 * directement utilisable comme variables `timestamptz` côté Hasura.
 * La période précédente a toujours la même durée et se termine au début de
 * la période courante (comparaison « période sur période »).
 */
export interface Period {
  from: string
  to: string
}

export interface Periods {
  current: Period
  previous: Period
}

export type PeriodPreset = '7d' | '30d' | 'custom'

export type PeriodSelection
  = | { preset: '7d' }
    | { preset: '30d' }
    | { preset: 'custom', from: Date, to: Date }

const DAY_MS = 24 * 60 * 60 * 1000

const PRESET_DAYS: Record<Exclude<PeriodPreset, 'custom'>, number> = {
  '7d': 7,
  '30d': 30
}

export const PERIOD_PRESET_OPTIONS = [
  { value: '7d', label: '7 derniers jours' },
  { value: '30d', label: '30 derniers jours' },
  { value: 'custom', label: 'Personnalisé' }
] as const

/** Début du jour (00:00, heure locale) pour la date donnée. */
function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

/** Construit la période précédente : même durée, juste avant `current`. */
function withPrevious(current: Period): Periods {
  const from = new Date(current.from)
  const to = new Date(current.to)
  const duration = to.getTime() - from.getTime()
  return {
    current,
    previous: {
      from: new Date(from.getTime() - duration).toISOString(),
      to: current.from
    }
  }
}

/** Résout une sélection en périodes courante + précédente (timestamps ISO). */
export function resolvePeriods(selection: PeriodSelection, now: Date = new Date()): Periods {
  if (selection.preset === 'custom') {
    // Intervalle inclusif sur les jours sélectionnés → borne haute exclusive au lendemain.
    const from = startOfDay(selection.from)
    const to = new Date(startOfDay(selection.to).getTime() + DAY_MS)
    return withPrevious({ from: from.toISOString(), to: to.toISOString() })
  }

  const days = PRESET_DAYS[selection.preset]
  const from = new Date(now.getTime() - days * DAY_MS)
  return withPrevious({ from: from.toISOString(), to: now.toISOString() })
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric'
})

/** Libellé lisible d'une période, ex. « 17 mai 2026 – 16 juin 2026 ». */
export function formatPeriodLabel(period: Period): string {
  const from = new Date(period.from)
  // Borne haute exclusive → on affiche le dernier jour inclus.
  const to = new Date(new Date(period.to).getTime() - DAY_MS)
  return `${dateFormatter.format(from)} – ${dateFormatter.format(to)}`
}

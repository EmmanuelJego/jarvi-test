import type { Periods } from '~/utils/periods'
import { CHANNELS } from '~/utils/channels'
import { BAPTISTE_USER_ID } from '~/utils/constants'

/** Ligne de données prête pour le graphique (une par canal). */
export interface ChannelRow {
  channel: string
  currentRate: number
  previousRate: number
  currentReplied: number
  currentTotal: number
  previousReplied: number
  previousTotal: number
}

interface AggregateResult {
  aggregate: { count: number } | null
}

type PeriodKey = 'current' | 'previous'

/** Taux de réponse en %, arrondi à 0,1, 0 si aucun message. */
function toRate(replied: number, total: number): number {
  return total > 0 ? Math.round((replied / total) * 1000) / 10 : 0
}

/**
 * Construit une requête unique avec des agrégats aliasés :
 * pour chaque canal et chaque période, un compte `total` et un compte `replied`.
 * Les colonnes Hasura sont en camelCase (`userId`, `createdAt`, `triggerHasBeenRepliedTo`).
 */
function buildQuery(): string {
  const periodVars: Record<PeriodKey, { from: string, to: string }> = {
    current: { from: '$curFrom', to: '$curTo' },
    previous: { from: '$prevFrom', to: '$prevTo' }
  }

  const selections: string[] = []
  for (const channel of CHANNELS) {
    for (const period of ['current', 'previous'] as PeriodKey[]) {
      const { from, to } = periodVars[period]
      const base = `userId: { _eq: $userId }, type: { _eq: "${channel.type}" }, createdAt: { _gte: ${from}, _lt: ${to} }`
      selections.push(
        `${channel.key}_${period}_total: historyentries_aggregate(where: { ${base}, triggerHasBeenRepliedTo: { _is_null: false } }) { aggregate { count } }`,
        `${channel.key}_${period}_replied: historyentries_aggregate(where: { ${base}, triggerHasBeenRepliedTo: { _eq: true } }) { aggregate { count } }`
      )
    }
  }

  return `query ResponseRates($userId: uuid!, $curFrom: timestamptz!, $curTo: timestamptz!, $prevFrom: timestamptz!, $prevTo: timestamptz!) {
${selections.join('\n')}
}`
}

/**
 * Récupère le taux de réponse par canal (période courante + précédente) via le
 * client nhost, et re-fetch automatiquement quand la période change.
 */
export function useResponseRates() {
  const { $nhost } = useNuxtApp()
  const query = buildQuery()

  const rows = ref<ChannelRow[]>([])
  const pending = ref(false)
  const error = ref<string | null>(null)

  async function refresh(periods: Periods) {
    pending.value = true
    error.value = null
    try {
      const { current, previous } = periods
      const { body } = await $nhost.graphql.request<Record<string, AggregateResult>>({
        query,
        variables: {
          userId: BAPTISTE_USER_ID,
          curFrom: current.from,
          curTo: current.to,
          prevFrom: previous.from,
          prevTo: previous.to
        }
      })

      if (body.errors?.length) {
        throw new Error(body.errors[0]?.message ?? 'Erreur GraphQL')
      }

      const data = body.data ?? {}
      const count = (alias: string) => data[alias]?.aggregate?.count ?? 0

      rows.value = CHANNELS.map((channel) => {
        const currentTotal = count(`${channel.key}_current_total`)
        const currentReplied = count(`${channel.key}_current_replied`)
        const previousTotal = count(`${channel.key}_previous_total`)
        const previousReplied = count(`${channel.key}_previous_replied`)
        return {
          channel: channel.label,
          currentRate: toRate(currentReplied, currentTotal),
          previousRate: toRate(previousReplied, previousTotal),
          currentReplied,
          currentTotal,
          previousReplied,
          previousTotal
        }
      })
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Erreur inconnue lors du chargement des statistiques'
      rows.value = []
    } finally {
      pending.value = false
    }
  }

  return { rows, pending, error, refresh }
}

<template>
  <div class="min-h-80">
    <div
      v-if="error"
      class="flex h-80 flex-col items-center justify-center gap-2 text-center"
    >
      <UIcon
        name="i-hugeicons-alert-02"
        class="size-8 text-error"
      />
      <p class="text-sm text-muted">
        Impossible de charger les statistiques.
      </p>
      <p class="text-xs text-dimmed">
        {{ error }}
      </p>
    </div>

    <USkeleton
      v-else-if="pending"
      class="h-80 w-full"
    />

    <div
      v-else-if="!hasData"
      class="flex h-80 items-center justify-center text-sm text-muted"
    >
      Aucune donnée sur cette période.
    </div>

    <div v-else>
      <VisXYContainer
        :height="320"
        :y-domain="yDomain"
        :padding="{ top: 8, right: 8, bottom: 8, left: 8 }"
      >
        <VisGroupedBar
          :data="bars"
          :x="barX"
          :y="barY"
          :color="barColorAccessor"
          :rounded-corners="4"
          :bar-padding="0.1"
          :group-padding="0.1"
        />
        <VisXYLabels
          :data="labelData"
          :x="labelX"
          :y="labelY"
          :label="labelText"
          :color="labelColor"
          :label-font-size="11"
          background-color="transparent"
          :clustering="false"
        />
        <VisXYLabels
          :data="evolutionData"
          :x="evolutionX"
          :y="evolutionY"
          :label="evolutionGlyph"
          :color="evolutionColor"
          :label-font-size="16"
          background-color="transparent"
          :clustering="false"
        />
        <VisAxis
          type="x"
          :tick-values="tickValues"
          :tick-format="channelTick"
          :grid-line="false"
          :domain-line="false"
        />
        <VisAxis
          type="y"
          :tick-format="percentFormatter"
          :grid-line="true"
          :domain-line="false"
        />
        <VisTooltip :triggers="tooltipTriggers" />
      </VisXYContainer>

      <div class="mt-3 flex items-center justify-center gap-5 text-xs text-muted">
        <span class="flex items-center gap-1.5">
          <span class="size-2.5 rounded-full bg-neutral-500" />
          Période actuelle
        </span>
        <span class="flex items-center gap-1.5">
          <span class="size-2.5 rounded-full bg-neutral-500/40" />
          Période précédente
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VisXYContainer, VisGroupedBar, VisAxis, VisTooltip, VisXYLabels } from '@unovis/vue'
import { GroupedBar } from '@unovis/ts'
import { CHANNELS } from '~/utils/channels'

const props = defineProps<{
  periods: Periods
}>()

const { rows, pending, error, refresh } = useResponseRates()

watch(() => props.periods, () => refresh(props.periods), { immediate: true, deep: true })

const hasData = computed(() => rows.value.some(row => row.currentTotal > 0 || row.previousTotal > 0))

const channelColors: Record<string, string> = Object.fromEntries(
  CHANNELS.map(channel => [channel.label, channel.color])
)

/** Convertit `#rrggbb` en `rgba(r, g, b, a)`. */
function getColorWithAlpha(hex: string, alpha: number): string {
  const value = hex.replace('#', '')
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// Espacement (en unités de l'axe X) : 1 entre les 2 barres d'un canal, 3 entre canaux.
const PAIR_GAP = 1
const CHANNEL_GAP = 3

interface Bar {
  x: number
  value: number
  color: string
  channel: string
  period: string
  replied: number
  total: number
}

/**
 * Une entrée par barre, positionnée explicitement sur l'axe X. En série unique,
 * le centre d'une barre vaut exactement xScale(x) — les libellés (même x) s'alignent donc parfaitement.
 */
const bars = computed<Bar[]>(() =>
  rows.value.flatMap((row, index) => {
    const base = channelColors[row.channel] ?? '#3f51b6'
    const start = index * CHANNEL_GAP
    return [
      { x: start, value: row.currentRate, color: base, channel: row.channel, period: 'Période actuelle', replied: row.currentReplied, total: row.currentTotal },
      { x: start + PAIR_GAP, value: row.previousRate, color: getColorWithAlpha(base, 0.4), channel: row.channel, period: 'Période précédente', replied: row.previousReplied, total: row.previousTotal }
    ]
  })
)

const barX = (bar: Bar) => bar.x
const barY = [(bar: Bar) => bar.value]
const barColorAccessor = (bar: Bar) => bar.color

const maxRate = computed(() =>
  Math.max(0, ...rows.value.flatMap(row => [row.currentRate, row.previousRate]))
)

// Domaine Y avec une marge en haut pour loger les libellés et l'indicateur d'évolution.
const yDomain = computed<[number, number]>(() => [0, maxRate.value > 0 ? maxRate.value * 1.28 : 1])

// Graduations X centrées entre les 2 barres de chaque canal.
const tickValues = computed(() => rows.value.map((_, index) => index * CHANNEL_GAP + PAIR_GAP / 2))
const channelTick = (tick: number | Date) => {
  const index = Math.round((Number(tick) - PAIR_GAP / 2) / CHANNEL_GAP)
  return rows.value[index]?.channel ?? ''
}
const percentFormatter = (value: number | Date) => `${value}%`

interface BarLabel {
  x: number
  y: number
  value: number
}

// Un libellé par barre, au même x que la barre, juste au-dessus de son sommet.
const labelData = computed<BarLabel[]>(() => {
  const lift = maxRate.value * 0.05
  return bars.value.map(bar => ({ x: bar.x, y: bar.value + lift, value: bar.value }))
})

const labelX = (label: BarLabel) => label.x
const labelY = (label: BarLabel) => label.y
const labelText = (label: BarLabel) => `${label.value}%`
const labelColor = () => '#4b5563'

interface Evolution {
  x: number
  y: number
  glyph: string
  color: string
}

// Indicateur d'évolution par canal : ▲ vert (hausse) / ▼ rouge (baisse) / — gris (stable),
// centré au-dessus du groupe (même x que la graduation), au-dessus des libellés de valeur.
const evolutionData = computed<Evolution[]>(() => {
  const lift = maxRate.value * 0.05
  return rows.value.map((row, index) => {
    const x = index * CHANNEL_GAP + PAIR_GAP / 2
    const y = Math.max(row.currentRate, row.previousRate) + lift * 2.4
    if (row.currentRate > row.previousRate) return { x, y, glyph: '▲', color: '#16a34a' }
    if (row.currentRate < row.previousRate) return { x, y, glyph: '▼', color: '#dc2626' }
    return { x, y, glyph: '—', color: '#9ca3af' }
  })
})

const evolutionX = (item: Evolution) => item.x
const evolutionY = (item: Evolution) => item.y
const evolutionGlyph = (item: Evolution) => item.glyph
const evolutionColor = (item: Evolution) => item.color

/** Contenu HTML du tooltip de la barre survolée (injecté par Unovis). */
function tooltipHtml(bar: Bar): string {
  const noReply = bar.total - bar.replied
  return `<div style="min-width:200px">
    <div style="font-size:13px;font-weight:600;color:#111827">${bar.channel}</div>
    <div style="margin-top:6px;display:flex;align-items:center;justify-content:space-between;gap:16px">
      <span style="display:flex;align-items:center;gap:6px;font-size:12px;color:#6b7280">
        <span style="width:8px;height:8px;border-radius:9999px;background:${bar.color}"></span>${bar.period}
      </span>
      <span style="font-size:12px;font-weight:600;color:#111827">${bar.value}%</span>
    </div>
    <div style="padding-left:14px;font-size:11px;color:#9ca3af">${bar.replied} avec réponse · ${noReply} sans réponse</div>
  </div>`
}

const tooltipTriggers = {
  [GroupedBar.selectors.bar]: (bar: Bar) => tooltipHtml(bar)
}
</script>

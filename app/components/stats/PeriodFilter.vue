<template>
  <div class="flex items-center gap-2">
    <USelect
      :model-value="preset"
      :items="[...PERIOD_PRESET_OPTIONS]"
      value-key="value"
      class="w-48"
      icon="i-hugeicons-calendar-03"
      @update:model-value="onPresetChange"
    />

    <UPopover
      v-if="preset === 'custom'"
      v-model:open="open"
    >
      <UButton
        :label="customLabel"
        color="neutral"
        variant="outline"
        icon="i-hugeicons-calendar-03"
      />
      <template #content>
        <UCalendar
          v-model="range"
          range
          class="p-2"
        />
      </template>
    </UPopover>
  </div>
</template>

<script setup lang="ts">
import { CalendarDate, getLocalTimeZone, type DateValue } from '@internationalized/date'
import { PERIOD_PRESET_OPTIONS, type PeriodPreset, type PeriodSelection } from '~/utils/periods'

interface DateRange {
  start: DateValue | undefined
  end: DateValue | undefined
}

const model = defineModel<PeriodSelection>({ required: true })

const preset = ref<PeriodPreset>(model.value.preset)
const open = ref(false)

function toCalendarDate(date: Date): DateValue {
  return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

const range = shallowRef<DateRange>(
  model.value.preset === 'custom'
    ? { start: toCalendarDate(model.value.from), end: toCalendarDate(model.value.to) }
    : { start: undefined, end: undefined }
)

const rangeFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })

const customLabel = computed(() => {
  const { start, end } = range.value
  if (!start || !end) return 'Choisir une plage'
  const tz = getLocalTimeZone()
  return `${rangeFormatter.format(start.toDate(tz))} – ${rangeFormatter.format(end.toDate(tz))}`
})

function emitCustom() {
  const { start, end } = range.value
  if (!start || !end) return
  const tz = getLocalTimeZone()
  model.value = { preset: 'custom', from: start.toDate(tz), to: end.toDate(tz) }
}

async function onPresetChange(value: PeriodPreset) {
  preset.value = value
  if (value === 'custom') {
    setTimeout(() => open.value = true, 200)
    emitCustom()
  } else {
    model.value = { preset: value }
  }
}

watch(range, () => {
  if (preset.value !== 'custom') return
  emitCustom()
  if (range.value.start && range.value.end) open.value = false
})
</script>

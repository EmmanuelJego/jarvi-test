<template>
  <div class="p-6">
    <h1 class="text-2xl font-semibold text-highlighted">
      Statistiques
    </h1>

    <UCard class="mt-6">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-base font-semibold text-highlighted">
              Taux de réponse par canal
            </h2>
            <p class="text-sm text-muted">
              %age de réponses réçues pour les messages envoyés sur la période sélectionnée.
            </p>
          </div>
          <StatsPeriodFilter v-model="selection" />
        </div>
      </template>

      <StatsResponseRateChart :periods />
    </UCard>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Statistiques · Jarvi' })

const selection = ref<PeriodSelection>({ preset: '30d' })
const periods = computed(() => resolvePeriods(selection.value))
</script>

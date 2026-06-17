<template>
  <aside class="h-screen w-20 p-2">
    <div class="h-full rounded-md flex shrink-0 flex-col items-center gap-3 bg-primary py-4">
      <!-- Logo -->
      <NuxtLink to="/" aria-label="Accueil" class="mb-3">
        <AppLogo class="size-9" />
      </NuxtLink>

      <!-- Top section -->
      <div class="flex flex-col items-center gap-1">
        <SidebarButton
          v-for="item in topItems"
          :key="item.icon"
          v-bind="item"
        />
      </div>

      <!-- Middle section -->
      <div class="flex flex-1 flex-col items-center justify-center gap-5">
        <div class="flex flex-col items-center gap-1">
          <span class="text-[10px] font-semibold uppercase tracking-wide text-white/50">CRM</span>
          <SidebarButton
            v-for="item in crmItems"
            :key="item.icon"
            v-bind="item"
          />
        </div>

        <div class="flex flex-col items-center gap-1">
          <span class="text-[10px] font-semibold uppercase tracking-wide text-white/50">ATS</span>
          <SidebarButton
            v-for="item in atsItems"
            :key="item.icon"
            v-bind="item"
          />
        </div>
      </div>

      <!-- Bottom section -->
      <div class="flex flex-col items-center gap-1">
        <SidebarButton
          v-for="item in bottomItems"
          :key="item.icon"
          v-bind="item"
        />
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
interface RailItem {
  icon: string
  to?: string
  label?: string
}

const topItems: RailItem[] = [
  { icon: 'i-hugeicons-ai-search-02' },
  { icon: 'i-hugeicons-home-01' }
]

const crmItems: RailItem[] = [
  { icon: 'i-hugeicons-building-03' },
  { icon: 'i-hugeicons-target-02' },
  { icon: 'i-hugeicons-user-account' }
]

const atsItems: RailItem[] = [
  { icon: 'i-hugeicons-briefcase-05' },
  { icon: 'i-hugeicons-user-search-01' }
]

const bottomItems: RailItem[] = [
  { icon: 'i-hugeicons-chart-up', to: '/', label: 'Statistiques' },
  { icon: 'i-hugeicons-cloud-saving-done-02' },
  { icon: 'i-hugeicons-settings-01' }
]
</script>

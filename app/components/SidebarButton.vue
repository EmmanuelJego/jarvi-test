<template>
  <UButton
    :icon="icon"
    :to="to"
    :disabled="!to"
    :aria-label="label"
    color="neutral"
    variant="ghost"
    size="lg"
    square
    :class="[
      'text-white/70 hover:bg-primary-700 hover:text-white disabled:opacity-100',
      isActive && 'bg-primary-700 text-white hover:bg-primary-700'
    ]"
  />
</template>

<script setup lang="ts">
const props = defineProps<{
  icon: string
  to?: string
  label?: string
}>()

const route = useRoute()
const isActive = computed(() => !!props.to && route.path === props.to)
</script>

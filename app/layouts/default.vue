<template>
  <div class="flex h-screen bg-default">
    <AppSidebar />
    <main class="flex-1 overflow-auto max-w-300 mx-auto">
      <slot />
    </main>
  </div>
</template>

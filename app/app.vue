<template>
  <div class="app-layout">
    <NuxtPage />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => console.log('ServiceWorker registered with scope:', reg.scope))
        .catch((err) => console.warn('ServiceWorker registration failed:', err))
    })
  }
})
</script>

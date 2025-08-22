<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from 'stores/auth.store'

const authStore = useAuthStore()

onMounted( () => {
  // Auth initialization is now handled by the router guard
  // No need to call initialize() here
  console.log('App mounted - Auth store initialized:', authStore.isInitialized)
})
</script>

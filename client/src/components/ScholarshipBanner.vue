<template>
  <div v-if="props.name" class="scholarship-banner">
    <q-icon name="school" size="16px" class="banner-icon" />
    Current Scholarship: <span class="banner-text">{{ props.name }}</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  name: string
}>()
</script>

<style scoped>
.scholarship-banner {
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #000000;
  box-shadow: none;
}

.banner-icon {
  color: #000000;
}

.banner-text {
  color: #000000;
}
</style> 
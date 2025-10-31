<template>
  <q-input
    v-model="inputValue"
    :label="label"
    type="date"
    dense
    filled
    clearable
    @clear="handleClear"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: Date | string | null
  label?: string
}>(), {
  modelValue: null,
  label: ''
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: Date | null): void
}>()

const toDateString = (value: Date | string | null): string => {
  if (!value) return ''

  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

const inputValue = computed<string | null>({
  get: () => toDateString(props.modelValue),
  set: value => {
    if (!value) {
      emit('update:modelValue', null)
      return
    }

    const date = new Date(value)
    emit('update:modelValue', Number.isNaN(date.getTime()) ? null : date)
  }
})

const handleClear = () => {
  inputValue.value = ''
}
</script>


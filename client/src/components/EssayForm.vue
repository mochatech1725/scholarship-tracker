<template>
  <q-card class="q-pa-sm" style="background-color: white;">
    <q-card-section class="q-pa-sm">
      <ScholarshipBanner :name="scholarshipName" />
      <q-form @submit="onSubmit" class="q-gutter-sm">
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-h6">{{ props.essay ? 'Editing' : 'Adding' }} Essay</div>
          <div class="row items-center">
            <div v-if="isFormDirty" class="text-caption text-orange q-mr-md">
              <q-icon name="warning" size="sm" class="q-mr-xs" />
              Unsaved changes
            </div>
            <q-btn
              label="Cancel"
              color="grey-6"
              flat
              @click="handleCancel"
              class="q-mr-sm"
              size="sm"
            />
            <q-btn
              :label="props.essay ? 'Update' : 'Create'"
              type="submit"
              :style="{ backgroundColor: 'var(--q-button-primary)', color: 'white' }"
              size="sm"
            />
          </div>
        </div>

        <div class="row q-col-gutter-sm">
          <div class="col-12 col-md-6">
            <div class="form-label">Theme</div>
            <q-input
              v-model="form.theme"
              :rules="[val => !!val || 'Theme is required']"
              flat
              dense
              hide-bottom-space
              class="q-mb-xs"
            />
          </div>
          <div class="col-12 col-md-6">
            <div class="form-label">Units</div>
            <q-select
              v-model="form.units"
              :options="unitOptions"
              flat
              dense
              class="q-mb-xs"
            />
          </div>
          <div class="col-12">
            <div class="form-label">Essay Link</div>
            <q-input
              v-model="form.essay_link"
              :rules="[val => !!val || 'Essay link is required']"
              flat
              dense
              hide-bottom-space
              class="q-mb-xs"
            />
          </div>
          <div class="col-12">
            <div class="form-label">Count</div>
            <q-input
              v-model.number="form.word_count"
              type="number"
              :rules="[val => !!val || 'Count is required']"
              flat
              dense
              hide-bottom-space
              class="q-mb-xs"
            />
          </div>
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import type { Essay, Application } from 'src/shared-types'
import ScholarshipBanner from 'components/ScholarshipBanner.vue'

const $q = useQuasar()

const props = defineProps<{
  application?: Application | null
  essay?: Essay | null
}>()

const emit = defineEmits<{
  (e: 'submit', form: Essay): void
  (e: 'cancel'): void
}>()

const scholarshipName = computed(() => {
  return props.application?.scholarship_name || ''
})

const unitOptions = ['words', 'characters', 'pages', 'sentences']

const form = ref<Essay>({
  application_id: props.application?.application_id || 0,
  essay_link: '',
  word_count: 0,
  units: 'words',
  theme: ''
})

const originalFormData = ref<Essay | null>(null)
const isInitialized = ref(false)

// Track if form is dirty (has been modified)
const isFormDirty = computed(() => {
  if (!originalFormData.value || !isInitialized.value) return false
  
  // Deep comparison of form data
  const current = JSON.stringify(form.value)
  const original = JSON.stringify(originalFormData.value)
  return current !== original
})

const getDefaultFormData = (): Omit<Essay, 'essay_id'> => {
  return {
    application_id: props.application?.application_id || 0,
    theme: '',
    units: '',
    essay_link: '',
    word_count: 0,
    created_at: new Date(),
    updated_at: new Date()
  }
}

const initializeForm = (essayData?: Essay) => {
  if (essayData) {
    originalFormData.value = { ...essayData }
    form.value = essayData
  } else {
    const defaultData = getDefaultFormData()
    originalFormData.value = { ...defaultData }
    form.value = defaultData
  }
  isInitialized.value = true
}

const handleCancel = () => {
  if (isFormDirty.value) {
    $q.dialog({
      title: 'Unsaved Changes',
      message: 'You have unsaved changes. Are you sure you want to cancel?',
      cancel: true,
      persistent: true,
      ok: {
        label: 'Discard Changes',
        color: 'negative'
      }
    }).onOk(() => {
      emit('cancel')
    })
  } else {
    emit('cancel')
  }
}

const onSubmit = () => {
  // Reset dirty state after successful submission
  originalFormData.value = { ...form.value }
  emit('submit', form.value)
}

// Handle ESC key press
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    event.preventDefault()
    handleCancel()
  }
}

onMounted(() => {
  initializeForm()
  
  // Add ESC key listener
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  // Remove ESC key listener
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.q-form {
  max-width: 800px;
  margin: 0 auto;
}
</style> 
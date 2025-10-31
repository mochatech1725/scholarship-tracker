<template>
  <q-card class="q-pa-md" style="background-color: white;">
    <q-card-section>
      <ScholarshipBanner :name="scholarshipName" />
      <q-form @submit="onSubmit" class="q-gutter-md">
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6">{{ isEdit ? 'Editing' : 'Adding' }} Recommendation</div>
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
              size="md"
            />
            <q-btn
              label="Save"
              type="submit"
              :style="{ backgroundColor: 'var(--q-button-primary)', color: 'white' }"
              :loading="loading"
              size="md"
            />
          </div>
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-12">
            <div class="form-label">Recommender</div>
            <q-select
              v-model="selectedRecommenderId"
              :options="recommenderOptions"
              emit-value
              map-options
              option-label="label"
              option-value="value"
              flat
              dense
              class="q-mb-md"
              :rules="[val => !!val || 'Recommender is required']"
              :disable="isEdit"
              :readonly="isEdit"
              @update:model-value="handleRecommenderChange"
            >
              <template v-if="isEdit" v-slot:append>
                <q-icon name="lock" size="xs" color="grey-6" />
              </template>
            </q-select>
            <div v-if="isEdit" class="text-caption text-grey-6 q-mt-xs">
              Recommender cannot be changed after creation
            </div>
          </div>

          <div class="col-12 col-md-6">
            <div class="form-label">Status</div>
            <q-select
              v-model="form.status"
              :options="statusOptions"
              flat
              dense
              class="q-mb-sm"
              :rules="[val => !!val || 'Status is required']"
            />
          </div>

          <div class="col-12 col-md-6">
            <div class="form-label">Due Date</div>
            <q-input
              v-model="dueDateString"
              type="date"
              flat
              dense
              class="q-mb-sm"
            />
          </div>

          <div class="col-12 col-md-6">
            <div class="form-label">Submitted Date</div>
            <q-input
              v-model="submittedAtString"
              type="date"
              flat
              dense
              class="q-mb-sm"
            />
          </div>
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount, onUnmounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import type { Recommendation, Application, Recommender } from 'src/shared-types'
import ScholarshipBanner from 'components/ScholarshipBanner.vue'

const $q = useQuasar()

const props = defineProps<{
  isEdit: boolean
  loading?: boolean
  recommendation: Recommendation | null
  application?: Application | null
  recommenders: Recommender[]
}>()

const emit = defineEmits<{
  (e: 'submit', form: Recommendation): void
  (e: 'cancel'): void
}>()

const selectedRecommenderId = ref<string | null>(null)

const form = ref<Recommendation>({
  application_id: props.application?.application_id || 0,
  recommender_id: 0,
  due_date: null,
  status: 'Pending',
  submitted_at: new Date(),
  created_at: new Date(),
  updated_at: new Date()
})

const originalFormData = ref<Recommendation | null>(null)
const originalSelectedRecommenderId = ref<string | null>(null)
const isInitialized = ref(false)

// Computed property for due date string
const dueDateString = computed({
  get() {
    if (!form.value.due_date) return ''
    try {
      const dateObj = typeof form.value.due_date === 'string' 
        ? new Date(form.value.due_date) 
        : form.value.due_date
      return dateObj.toISOString().split('T')[0]
    } catch {
      return ''
    }
  },
  set(value: string) {
    form.value.due_date = value || null
  }
})

// Computed property for submitted at string
const submittedAtString = computed({
  get() {
    if (!form.value.submitted_at) return ''
    try {
      const dateObj = typeof form.value.submitted_at === 'string' 
        ? new Date(form.value.submitted_at) 
        : form.value.submitted_at
      return dateObj.toISOString().split('T')[0]
    } catch {
      return ''
    }
  },
  set(value: string) {
    form.value.submitted_at = value ? new Date(value) : null
  }
})

// Track if form is dirty (has been modified)
const isFormDirty = computed(() => {
  if (!originalFormData.value || !isInitialized.value) return false
  
  // Deep comparison of form data
  const current = JSON.stringify(form.value)
  const original = JSON.stringify(originalFormData.value)
  const currentSelected = selectedRecommenderId.value
  const originalSelected = originalSelectedRecommenderId.value
  
  return current !== original || currentSelected !== originalSelected
})

const recommenderOptions = computed(() => {
  return props.recommenders.map(recommender => ({
    label: `${recommender.first_name} ${recommender.last_name} (${recommender.email_address})`,
    value: `${recommender.first_name} ${recommender.last_name} (${recommender.email_address})`
  }))
})

const scholarshipName = computed(() => {
  return props.application?.scholarship_name || ''
})

const statusOptions = ['Pending', 'Approved', 'Rejected'] as const

const handleRecommenderChange = (selectedValue: string) => {
  // The selected value is the formatted label string (e.g., "John Smith (john@email.com)")
  const selectedRecommender = props.recommenders.find(r => 
    `${r.first_name} ${r.last_name} (${r.email_address})` === selectedValue
  )
  if (selectedRecommender) {
    form.value.recommender_id = selectedRecommender.recommender_id || 0
  }
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
  originalSelectedRecommenderId.value = selectedRecommenderId.value
  emit('submit', form.value)
}

// Handle ESC key press
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    event.preventDefault()
    handleCancel()
  }
}

const getDefaultFormData = (): Omit<Recommendation, 'recommendation_id'> => {
  return {
    application_id: props.application?.application_id || 0,
    recommender_id: 0,
    due_date: null,
    submitted_at: new Date(),
    status: 'Pending' as const,
    created_at: new Date(),
    updated_at: new Date()
  }
}

const initializeFormWithData = () => {
  if (props.recommendation) {
    const recommendationData = {
      application_id: props.application?.application_id || 0,
      recommender_id: props.recommendation.recommender_id,
      due_date: props.recommendation.due_date || null,
      submitted_at: props.recommendation.submitted_at || new Date(),
      status: props.recommendation.status,
      created_at: props.recommendation.created_at || new Date(),
      updated_at: props.recommendation.updated_at || new Date()
    }
    originalFormData.value = { ...recommendationData }
    form.value = recommendationData
    
    // Set the selected recommender for the dropdown
    const recommender = props.recommenders.find(r => r.recommender_id === props.recommendation?.recommender_id)
    if (recommender) {
      selectedRecommenderId.value = `${recommender.first_name} ${recommender.last_name} (${recommender.email_address})`
      originalSelectedRecommenderId.value = selectedRecommenderId.value
    }
  } else {
    const defaultData = getDefaultFormData()
    originalFormData.value = { ...defaultData }
    form.value = defaultData
    selectedRecommenderId.value = null
    originalSelectedRecommenderId.value = null
  }
}

// Watch for changes to the recommendation prop (when dialog opens with edit data)
watch(() => props.recommendation, () => {
  isInitialized.value = false
  initializeFormWithData()
  setTimeout(() => {
    isInitialized.value = true
  }, 100)
}, { immediate: false })

// Watch for changes to recommenders prop (in case they load after the form)
watch(() => props.recommenders, () => {
  if (props.recommendation && props.recommenders.length > 0) {
    // Re-set the selected recommender if we're editing and recommenders just loaded
    const recommender = props.recommenders.find(r => r.recommender_id === props.recommendation?.recommender_id)
    if (recommender) {
      selectedRecommenderId.value = `${recommender.first_name} ${recommender.last_name} (${recommender.email_address})`
    }
  }
}, { immediate: false })

onMounted(() => {
  initializeFormWithData()
  
  // Mark as initialized after a short delay to avoid false dirty state
  setTimeout(() => {
    isInitialized.value = true
  }, 100)
  
  // Add ESC key listener
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  // No scholarship context logic to clear
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
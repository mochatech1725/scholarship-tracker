<template>
  <q-form @submit="onSubmit" class="q-gutter-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">{{ isEdit ? 'Editing' : 'Adding' }} Recommender</div>
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
      <div class="col-12 col-md-6">
        <div class="form-label">First Name</div>
        <q-input
          v-model="form.first_name"
          :rules="rules.firstName"
          flat
          dense
          hide-bottom-space
          class="q-mb-sm"
        />
      </div>

      <div class="col-12 col-md-6">
        <div class="form-label">Last Name</div>
        <q-input
          v-model="form.last_name"
          :rules="rules.lastName"
          flat
          dense
          hide-bottom-space
          class="q-mb-sm"
        />
      </div>

      <div class="col-12 col-md-6">
        <div class="form-label">Email Address</div>
        <q-input
          v-model="form.email_address"
          :rules="rules.emailAddress"
          flat
          dense
          type="email"
          hide-bottom-space
          class="q-mb-sm"
        />
      </div>

      <div class="col-12 col-md-6">
        <div class="form-label">Phone Number</div>
        <q-input
          v-model="form.phone_number"
          flat
          dense
          mask="(###) ###-####"
          hide-bottom-space
          class="q-mb-sm"
        />
      </div>

      <div class="col-12 col-md-6">
        <div class="form-label">Relationship</div>
        <q-select
          v-model="form.relationship"
          :options="relationshipOptions"
          flat
          dense
          hide-bottom-space
          class="q-mb-sm"
        />
      </div>
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import type { Recommender, User } from 'src/shared-types'

const $q = useQuasar()

const props = defineProps<{
  isEdit?: boolean
  recommender: Recommender | null
  loading?: boolean
  user: User | null
}>()

const emit = defineEmits<{
  (e: 'submit', form: Omit<Recommender, 'recommender_id'>): void
  (e: 'cancel'): void
}>()

const relationshipOptions = ['Teacher', 'Counselor', 'Employer', 'Friend', 'Other']

const form = ref<Omit<Recommender, 'recommender_id'> & { email_address: string; phone_number: string }>({
  student_id: props.user?.user_id ||  0,
  first_name: '',
  last_name: '',
  relationship: '',
  email_address: '',
  phone_number: ''
})

const originalFormData = ref<Omit<Recommender, 'recommender_id'> & { email_address: string; phone_number: string } | null>(null)
const isInitialized = ref(false)

// Track if form is dirty (has been modified)
const isFormDirty = computed(() => {
  if (!originalFormData.value || !isInitialized.value) return false
  
  // Deep comparison of form data
  const current = JSON.stringify(form.value)
  const original = JSON.stringify(originalFormData.value)
  return current !== original
})

const rules = {
  firstName: [
    (val: string) => !!val || 'First name is required'
  ],
  lastName: [
    (val: string) => !!val || 'Last name is required'
  ],
  emailAddress: [
    (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Please enter a valid email address'
  ]
}

const getDefaultFormData = () => {
  return {
    student_id: props.user?.user_id || 0,
    first_name: '',
    last_name: '',
    relationship: '',
    email_address: '',
    phone_number: ''
  }
}

const initializeForm = () => {
  if (props.recommender) {
    const recommenderData = {
      student_id: props.recommender.student_id || 0,
      first_name: props.recommender.first_name,
      last_name: props.recommender.last_name,
      relationship: props.recommender.relationship || '',
      email_address: props.recommender.email_address,
      phone_number: props.recommender.phone_number || ''
    }
    originalFormData.value = { ...recommenderData }
    form.value = recommenderData
  } else {
    const defaultData = getDefaultFormData()
    originalFormData.value = { ...defaultData }
    form.value = defaultData
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
  void initializeForm()
  
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
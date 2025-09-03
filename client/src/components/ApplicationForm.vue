<template>
  <q-card class="q-pa-md" style="background-color: white;">
    <q-card-section>
      <ScholarshipBanner :name="scholarshipName" />
      <q-form @submit="onSubmit" class="q-gutter-md">
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6">{{ isEdit ? 'Edit' : 'Add' }} Application</div>
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
              type="submit"
              :style="{ backgroundColor: 'var(--q-button-primary)', color: 'white' }"
              :label="isEdit ? 'Update Application' : 'Create Application'"
              size="md"
            />
          </div>
        </div>

        <!-- General Information Section -->
        <q-expansion-item
          icon="info"
          label="General Information"
          header-class="text-primary"
          default-opened
        >
          <q-card class="q-pa-md" style="background-color: white;">
            <q-card-section>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <div class="form-label">Scholarship Name</div>
                  <q-input
                    v-model="form.scholarship_name"
                    :rules="rules.scholarship_name"
                    flat
                    dense
                    hide-bottom-space
                    class="q-mb-sm"
                  />
                </div>

                <div class="col-12 col-md-6">
                  <div class="form-label">Target Type</div>
                  <q-select
                    v-model="form.target_type"
                    :options="targetTypeOptions"
                    flat
                    dense
                    class="q-mb-sm"
                  />
                </div>

                <div class="col-12 col-md-6">
                  <div class="form-label">Organization</div>
                  <q-input
                    v-model="form.organization"
                    :rules="rules.organization"
                    flat
                    dense
                    hide-bottom-space
                    class="q-mb-sm"
                  />
                </div>

                <div class="col-12 col-md-6">
                  <div class="form-label">Organization Website</div>
                  <q-input
                    v-model="form.org_website"
                    :rules="rules.org_website"
                    flat
                    dense
                    placeholder="https://example.com"
                  />
                </div>

                <div class="col-12 col-md-6">
                  <div class="form-label">Document Info Link</div>
                  <q-input
                    v-model="form.document_info_link"
                    :rules="rules.document_info_link"
                    flat
                    dense
                    placeholder="https://example.com/documents"
                  />
                </div>

                <div class="col-12 col-md-6">
                  <div class="form-label">Platform</div>
                  <q-input
                    v-model="form.platform"
                    flat
                    dense
                    class="q-mb-sm"
                  />
                </div>

                <div class="col-12 col-md-6">
                  <div class="form-label">Application Link</div>
                  <q-input
                    v-model="form.application_link"
                    flat
                    dense
                    class="q-mb-sm"
                  />
                </div>

                <div class="col-12 col-md-6">
                  <div class="form-label">Minimum Award</div>
                  <q-input
                    v-model.number="form.min_award"
                    type="number"
                    flat
                    dense
                    class="q-mb-sm"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <div class="form-label">Maximum Award</div>
                  <q-input
                    v-model.number="form.max_award"
                    type="number"
                    flat
                    dense
                    class="q-mb-sm"
                  />
                </div>

                <div class="col-12 col-md-6">
                  <q-checkbox
                    v-model="form.renewable"
                    label="Renewable"
                    class="q-mb-sm"
                  />
                </div>

                <div class="col-12 col-md-6">
                  <div class="form-label">Renewable Terms</div>
                  <q-input
                    v-model="form.renewable_terms"
                    flat
                    dense
                    class="q-mb-sm"
                  />
                </div>

                <div class="col-12 col-md-6">
                  <div class="form-label">Theme</div>
                  <q-input
                    v-model="form.theme"
                    flat
                    dense
                    class="q-mb-sm"
                  />
                </div>
                
                <div class="col-12 col-md-6">
                  <div class="form-label">Requirements</div>
                  <q-input
                    v-model="form.requirements"
                    flat
                    dense
                    class="q-mb-sm"
                  />
                </div>

                <div class="col-12 col-md-6">
                  <div class="form-label">Current Action</div>
                  <q-input
                    v-model="form.current_action"
                    flat
                    dense
                    class="q-mb-sm"
                  />
                </div>

                <div class="col-12 col-md-6">
                  <div class="form-label">Status</div>
                  <q-select
                    v-model="form.status"
                    :options="applicationStatusOptions"
                    flat
                    dense
                    class="q-mb-sm"
                  />
                </div>

                <div class="col-12 col-md-6">
                  <div class="form-label">Submission Date</div>
                  <q-input
                    v-model="submissionDateString"
                    type="date"
                    flat
                    dense
                    class="q-mb-sm"
                  />
                </div>

                <div class="col-12 col-md-6">
                  <div class="form-label">Open Date</div>
                  <q-input
                    v-model="openDateString"
                    type="date"
                    flat
                    dense
                    class="q-mb-sm"
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
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>


        <!-- Recommendations Section -->
        <q-expansion-item
          icon="assignment"
          label="Recommendations"
          header-class="text-primary"
          class="q-mt-md"
        >
          <Recommendations 
            :application="application" 
            :recommenders="recommenders"
            @recommendations-updated="handleRecommendationsUpdated"
          />
        </q-expansion-item>
        
        <!-- Essays Section -->
        <q-expansion-item
          icon="description"
          label="Essays"
          header-class="text-primary"
          class="q-mt-md"
        >
          <Essays 
            :application="application"
            @essays-updated="handleEssaysUpdated"
          />
        </q-expansion-item>

      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { useApplicationStore } from 'stores/application.store'
import type { Application, Recommender, Essay, Recommendation } from 'src/shared-types'
import { targetTypeOptions, applicationStatusOptions } from 'src/shared-types'
import Essays from 'components/Essays.vue'
import Recommendations from 'components/Recommendations.vue'
import ScholarshipBanner from 'components/ScholarshipBanner.vue'
import { useRecommenderStore } from 'src/stores/recommender.store'
import { useUserStore } from 'src/stores/user.store'


const $q = useQuasar()
const applicationStore = useApplicationStore()
const loading = ref(false)
const userStore = useUserStore()

const props = defineProps<{
  isEdit: boolean
  application: Application | null
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'submit'): void
}>()
const recommenderStore = useRecommenderStore()
const recommenders = ref<Recommender[]>([])

// Single source of truth for default form data
const getDefaultFormData = (): Omit<Application, 'application_id'> => {
  return {
    user_id: userStore.user?.user_id || 0,
    scholarship_name: '',
    target_type: 'Merit' as const,
    organization: '',
    org_website: '',
    platform: '',
    application_link: '',
    theme: '',
    min_award: 0,
    max_award: 0,
    requirements: '',
    renewable: false,
    renewable_terms: '',
    document_info_link: '',
    current_action: '',
    status: 'Not Started' as const,
    submission_date: new Date(),
    open_date: new Date(),
    due_date: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
    essays: [],
    recommendations: []
  }
}

const form = ref<Application>(getDefaultFormData() as Application)
const originalFormData = ref<Application | null>(null)
const isInitialized = ref(false)

// Track if form is dirty (has been modified)
const isFormDirty = computed(() => {
  if (!originalFormData.value || !isInitialized.value) return false
  
  const currentMain = { ...form.value, essays: [], recommendations: [] }
  const originalMain = { ...originalFormData.value, essays: [], recommendations: [] }
  const currentMainStr = JSON.stringify(currentMain)
  const originalMainStr = JSON.stringify(originalMain)
  const mainFormDirty = currentMainStr !== originalMainStr
  
  const currentEssays = JSON.stringify(form.value.essays || [])
  const originalEssays = JSON.stringify(originalFormData.value.essays || [])
  const essaysDirty = currentEssays !== originalEssays
  
  const currentRecommendations = JSON.stringify(form.value.recommendations || [])
  const originalRecommendations = JSON.stringify(originalFormData.value.recommendations || [])
  const recommendationsDirty = currentRecommendations !== originalRecommendations
  
  return mainFormDirty || essaysDirty || recommendationsDirty
})

const rules = {
  scholarship_name: [
    (val: string) => !!val || 'Scholarship name is required'
  ],

  organization: [
    (val: string) => !!val || 'Organization name is required'
  ],
  org_website: [
    (val: string) => !!val || 'Organization website is required'
  ],
  document_info_link: [
    (val: string) => !!val || 'Document info link is required'
  ]
}

const initializeForm = () => {
  if (props.application) {
    const applicationData = { ...props.application }
    // Store original data first
    originalFormData.value = { ...applicationData }
    // Then set form data
    form.value = applicationData
  } else {
    const defaultData = getDefaultFormData()
    // Store original data first
    originalFormData.value = { ...defaultData } as Application
    // Then set form data
    form.value = defaultData as Application
  }
  isInitialized.value = true
}

// Watch for changes in props.application
watch(() => props.application, (newApplication) => {
  if (newApplication) {
    const { ...applicationData } = newApplication
    originalFormData.value = { ...applicationData }
    form.value = applicationData
    isInitialized.value = true
  }
}, { immediate: true, flush: 'post' })

const scholarshipName = computed(() => {
  return props.application?.scholarship_name || form.value.scholarship_name || ''
})

const onSubmit = async () => {
  try {
    loading.value = true
    if (props.isEdit && form.value.application_id) {
      await applicationStore.updateApplication(parseInt(form.value.application_id?.toString() || '0'), form.value)
      $q.notify({
        color: 'positive',
        message: 'Application updated successfully'
      })
    } else {
      // For new applications, let the server handle ID generation
      const newApplication: Omit<Application, 'application_id'> = {
        ...form.value
      };
      
      await applicationStore.createApplication(newApplication);
 
      $q.notify({
        color: 'positive',
        message: 'Application created successfully'
      })
    }
    
    // Reset dirty state after successful submission
    originalFormData.value = { ...form.value }
    
    emit('submit')
  } catch (error) {
    console.error('Error submitting application:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to submit application'
    })
  } finally {
    loading.value = false
  }
}


const loadRecommenders = async () => {
  try {
    const auth_user_id = userStore.user?.auth_user_id
    if (auth_user_id) {
      recommenders.value = await recommenderStore.getRecommendersByUserId(auth_user_id.toString())
    }
  } catch (error) {
    console.error('Failed to load recommenders:', error)
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

const handleRecommendationsUpdated = (updatedRecommendations: Recommendation[]) => {
  // Update the application form data with the new recommendations
  form.value.recommendations = updatedRecommendations
}

const handleEssaysUpdated = (updatedEssays: Essay[]) => {
  // Update the application form data with the new essays
  form.value.essays = updatedEssays
}

// Add computed properties for date conversions
const submissionDateString = computed({
  get: () => {
    if (!isComponentMounted.value || !form.value.submission_date) return ''
    try {
      const date = form.value.submission_date instanceof Date ? form.value.submission_date : new Date(form.value.submission_date)
      return date.toISOString().split('T')[0]
    } catch (error) {
      console.error('Error processing submission date:', error)
      return ''
    }
  },
  set: (value: string) => {
    if (isComponentMounted.value) {
      form.value.submission_date = value ? new Date(value) : new Date()
    }
  }
})

const openDateString = computed({
  get: () => {
    if (!isComponentMounted.value || !form.value.open_date) return ''
    try {
      const date = form.value.open_date instanceof Date ? form.value.open_date : new Date(form.value.open_date)
      return date.toISOString().split('T')[0]
    } catch (error) {
      console.error('Error processing open date:', error)
      return ''
    }
  },
  set: (value: string) => {
    if (isComponentMounted.value) {
      form.value.open_date = value ? new Date(value) : new Date()
    }
  }
})

const dueDateString = computed({
  get: () => {
    if (!isComponentMounted.value || !form.value.due_date) return ''
    try {
      const date = form.value.due_date instanceof Date ? form.value.due_date : new Date(form.value.due_date)
      return date.toISOString().split('T')[0]
    } catch (error) {
      console.error('Error processing due date:', error)
      return ''
    }
  },
  set: (value: string) => {
    if (isComponentMounted.value) {
      form.value.due_date = value ? new Date(value) : new Date()
    }
  }
})

// Handle ESC key press
const handleKeydown = (event: KeyboardEvent) => {
  if (isComponentMounted.value && event.key === 'Escape') {
    event.preventDefault()
    handleCancel()
  }
}

const isComponentMounted = ref(false)

onMounted(async () => {
  isComponentMounted.value = true
  await loadRecommenders()
  initializeForm()
  
  // Add ESC key listener
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  isComponentMounted.value = false
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
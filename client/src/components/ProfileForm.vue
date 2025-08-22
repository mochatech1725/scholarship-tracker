<template>
  <div class="profile-container">
    <!-- Personal Information Card (Read-only) -->
    <q-card class="q-pa-md q-mb-md" style="background-color: white;">
      <q-card-section>
        <div class="text-h6 q-mb-md">Personal Information</div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <div class="form-label">First Name</div>
            <div class="q-pa-sm">{{ user?.first_name || 'Not set' }}</div>
          </div>
          <div class="col-12 col-md-6">
            <div class="form-label">Last Name</div>
            <div class="q-pa-sm">{{ user?.last_name || 'Not set' }}</div>
          </div>
          <div class="col-12 col-md-6">
            <div class="form-label">Email</div>
            <div class="q-pa-sm">{{ user?.email_address || 'Not set' }}</div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Search Preferences Card (Editable) -->
    <q-card class="q-pa-md" style="background-color: white;">
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6">Profile</div>
          <q-btn
            v-if="!isEdit"
            label="Edit"
            color="primary"
            @click="$emit('edit')"
            dense
          />
        </div>

        <div v-if="isEdit">
          <q-form @submit="onSubmit" class="q-gutter-md">
            <div class="row items-center justify-between q-mb-md">
              <div class="text-h6">Search Preferences</div>
              <div class="row items-center">
                <div v-if="isFormDirty" class="text-caption text-orange q-mr-md">
                  <q-icon name="warning" size="sm" class="q-mr-xs" />
                  Unsaved changes
                </div>
                <q-btn
                  flat
                  round
                  dense
                  icon="close"
                  @click="handleCancel"
                  class="q-mr-sm close-btn"
                  size="sm"
                  color="grey-7"
                  style="background-color: #f5f5f5; transition: all 0.2s ease;"
                />
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
                  size="md"
                />
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <div class="form-label">Search Areas</div>
                <q-select
                  v-model="form.subject_areas"
                  :options="subjectAreasOptions"
                  multiple
                  flat
                  dense
                  outlined
                />
              </div>
              <div class="col-12 col-md-6">
                <div class="form-label">Academic Level</div>
                <q-select
                  v-model="form.academic_level"
                  :options="academicLevelOptions"
                  flat
                  dense
                  outlined
                />
              </div>
              <div class="col-12 col-md-6">
                <div class="form-label">Target Type</div>
                <q-select
                  v-model="form.target_type"
                  :options="targetTypeOptions"
                  flat
                  dense
                  outlined
                />
              </div>
              <div class="col-12">
                <div class="form-label">Areas of Interest</div>
                <q-select
                  v-model="form.subject_areas"
                  :options="subjectAreasOptions"
                  multiple
                  flat
                  dense
                  outlined
                />
              </div>
              <div class="col-12 col-md-6">
                <div class="form-label">Gender</div>
                <q-select
                  v-model="form.gender"
                  :options="genderOptions"
                  flat
                  dense
                  outlined
                />
              </div>
              <div class="col-12 col-md-6">
                <div class="form-label">Ethnicity</div>
                <q-select
                  v-model="form.ethnicity"
                  :options="ethnicityOptions"
                  flat
                  dense
                  outlined
                />
              </div>
              <div class="col-12 col-md-6">
                <q-checkbox
                  v-model="form.essay_required"
                  label="Essay Required"
                  class="q-mb-sm"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-checkbox
                  v-model="form.recommendations_required"
                  label="Recommendation Required"
                  class="q-mb-sm"
                />
              </div>
            </div>
          </q-form>
        </div>

        <div v-else>
          <div class="text-h6 q-mb-md">Search Preferences</div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <div class="form-label">Search Areas</div>
              <div class="q-pa-sm">{{ search_preferences?.subject_areas?.join(', ') || 'Not set' }}</div>
            </div>
            <div class="col-12 col-md-6">
              <div class="form-label">Academic Level</div>
              <div class="q-pa-sm">{{ search_preferences?.academic_level || 'Not set' }}</div>
            </div>
            <div class="col-12 col-md-6">
              <div class="form-label">Target Type</div>
              <div class="q-pa-sm">{{ 
                  search_preferences?.target_type || 'Not set' 
              }}</div>
            </div>
            <div class="col-12 col-md-6">
              <div class="form-label">Gender</div>
              <div class="q-pa-sm">{{ search_preferences?.gender || 'Not set' }}</div>
            </div>
            <div class="col-12 col-md-6">
              <div class="form-label">Ethnicity</div>
              <div class="q-pa-sm">{{ search_preferences?.ethnicity || 'Not set' }}</div>
            </div>
            <div class="col-12 col-md-6">
              <div class="form-label">Essay Required</div>
              <div class="q-pa-sm">{{ search_preferences?.essay_required ? 'Yes' : 'No' }}</div>
            </div>
            <div class="col-12 col-md-6">
              <div class="form-label">Recommendation Required</div>
              <div class="q-pa-sm">{{ search_preferences?.recommendations_required ? 'Yes' : 'No' }}</div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onUnmounted, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import type { UserSearchPreferences, User } from 'src/shared-types'
import { academicLevelOptions, targetTypeOptions, subjectAreasOptions, genderOptions, ethnicityOptions } from 'src/shared-types'

const $q = useQuasar()

const props = defineProps<{
  isEdit?: boolean;
  search_preferences?: UserSearchPreferences | null;
  user?: User | null;
}>()

const emit = defineEmits<{
  (e: 'submit', search_preferences: UserSearchPreferences): void;
  (e: 'cancel'): void;
  (e: 'edit'): void;
}>()

const form = ref<UserSearchPreferences>({
  student_id: 0, // Will be set by the backend
  subject_areas: [],
  academic_level: 'Undergraduate',
  target_type: 'Both',
  gender: 'Female',
  ethnicity: 'Black/African American',
  essay_required: false,
  recommendations_required: false
})

const originalFormData = ref<UserSearchPreferences | null>(null)
const isInitialized = ref(false)

// Track if form is dirty (has been modified)
const isFormDirty = computed(() => {
  if (!originalFormData.value || !isInitialized.value) return false
  
  // Deep comparison of form data
  const current = JSON.stringify(form.value)
  const original = JSON.stringify(originalFormData.value)
  return current !== original
})

watch(
  () => [!!props.search_preferences, props.search_preferences],
  ([hasProfile, newProfile]) => {
    if (hasProfile && newProfile) {
      // Deep clone to avoid reference issues
      originalFormData.value = JSON.parse(JSON.stringify(newProfile)) as UserSearchPreferences
      form.value = newProfile as UserSearchPreferences
    }
  },
  { immediate: true }
)

// Debug watch to see what props are being received
watch(
  () => [props.user, props.search_preferences],
  ([user, searchPreferences]) => {
    console.log('ProfileForm props changed:', {
      user: user,
      search_preferences: searchPreferences,
      hasUser: !!user,
      hasProfile: !!searchPreferences
    })
  },
  { immediate: true }
)

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

// Add ESC key listener when component is mounted
onMounted(() => {
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

.profile-container {
  max-width: 600px;
  margin: 0 auto;
}

.close-btn:hover {
  background-color: #e0e0e0 !important;
  transform: scale(1.1);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.close-btn:active {
  transform: scale(0.95);
}
</style> 
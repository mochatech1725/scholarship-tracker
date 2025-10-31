<template>
  <div class="filters-sidebar">
    <!-- Collapsed State -->
    <div v-if="!isExpanded" class="filters-collapsed" @click="isExpanded = true">
      <span class="filters-text">Search Filters</span>
      <span class="filters-count">{{ activeFiltersCount }}</span>
    </div>

    <!-- Expanded State -->
    <div v-else class="filters-expanded">
      <div class="filters-header">
        <div class="filters-title">Search Filters</div>
        <q-btn
          flat
          round
          dense
          icon="close"
          @click="isExpanded = false"
        />
      </div>

      <div class="filters-content">
        <!-- Populate from Profile Checkbox -->
        <div class="filter-section">
          <q-checkbox
            v-model="populateFromProfile"
            label="Populate from Profile"
            @update:model-value="handlePopulateFromProfile"
            color="primary"
          />
        </div>

        <!-- Clear All Button -->
        <div class="filter-section">
          <div class="row justify-end">
            <q-btn
              flat
              round
              dense
              icon="refresh"
              @click="clearAllFilters"
              size="sm"
              color="grey-6"
              class="reset-btn"
              title="Clear all filters"
            />
          </div>
        </div>

        <!-- Search Query Filter -->
        <div class="filter-section">
          <div class="filter-label">Keywords</div>
          <q-input
            v-model="localSearchCriteria.keywords"
            clearable
            outlined
            dense
            placeholder="Search scholarships..."
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <!-- Subject Areas Filter -->
        <div class="filter-section">
          <div class="filter-label">Subject Areas</div>
          <q-select
            v-model="localSearchCriteria.subjectAreas"
            :options="subjectAreasOptions"
            multiple
            outlined
            dense
            emit-value
            map-options
            placeholder="All Subject Areas"
          />
        </div>

        <!-- Academic Level Filter -->
        <div class="filter-section">
          <div class="filter-label">Academic Level</div>
          <q-select
            v-model="localSearchCriteria.academic_level"
            :options="academicLevelOptions"
            clearable
            outlined
            dense
            emit-value
            map-options
            placeholder="All Academic Levels"
          />
        </div>

        <!-- Target Type Filter -->
        <div class="filter-section">
          <div class="filter-label">Target Type</div>
          <q-select
            v-model="localSearchCriteria.target_type"
            :options="targetTypeOptions"
            clearable
            outlined
            dense
            emit-value
            map-options
            placeholder="All Types"
          />
        </div>

        <!-- Gender Filter -->
        <div class="filter-section">
          <div class="filter-label">Gender</div>
          <q-select
            v-model="localSearchCriteria.gender"
            :options="genderOptions"
            clearable
            outlined
            dense
            emit-value
            map-options
            placeholder="All Genders"
          />
        </div>

        <!-- Ethnicity Filter -->
        <div class="filter-section">
          <div class="filter-label">Ethnicity</div>
          <q-select
            v-model="localSearchCriteria.ethnicity"
            :options="ethnicityOptions"
            clearable
            outlined
            dense
            emit-value
            map-options
            placeholder="All Ethnicities"
          />
        </div>

        <!-- Geographic Restrictions Filter -->
        <div class="filter-section">
          <div class="filter-label">Geographic Restrictions</div>
          <q-select
            v-model="localSearchCriteria.geographic_restrictions"
            :options="stateOptions"
            clearable
            outlined
            dense
            emit-value
            map-options
            placeholder="All States"
          />
        </div>

        <!-- Essay Required Filter -->
        <div class="filter-section">
          <q-checkbox
            v-model="localSearchCriteria.essay_required"
            label="Essay Required"
            :true-value="true"
            :false-value="null"
            color="primary"
          />
        </div>

        <!-- Recommendation Required Filter -->
        <div class="filter-section">
          <q-checkbox
            v-model="localSearchCriteria.recommendation_required"
            label="Recommendation Required"
            :true-value="true"
            :false-value="null"
            color="primary"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useUserStore } from 'src/stores/user.store'
import { 
  academicLevelOptions, 
  targetTypeOptions, 
  genderOptions, 
  ethnicityOptions,
  subjectAreasOptions
} from 'src/shared-types'
import type { SearchCriteria } from 'src/shared-types'

// State options for the filter
const stateOptions = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
].map(state => ({ label: state, value: state }))

const isExpanded = ref(false)
const populateFromProfile = ref(false)
const userStore = useUserStore()

const props = defineProps<{
  searchCriteria: SearchCriteria
}>()

const emit = defineEmits<{
  'update:searchCriteria': [value: SearchCriteria]
}>()

const localSearchCriteria = ref<SearchCriteria>({ ...props.searchCriteria })

const activeFiltersCount = computed(() => {
  let count = 0
  if (localSearchCriteria.value.keywords) count++
  if (localSearchCriteria.value.subjectAreas && localSearchCriteria.value.subjectAreas.length > 0) count++
  if (localSearchCriteria.value.academic_level) count++
  if (localSearchCriteria.value.target_type) count++
  if (localSearchCriteria.value.gender) count++
  if (localSearchCriteria.value.ethnicity) count++
  if (localSearchCriteria.value.geographic_restrictions) count++
  if (localSearchCriteria.value.essay_required === true) count++
  if (localSearchCriteria.value.recommendation_required === true) count++
  
  return count
})

// Watch for changes in props
watch(() => props.searchCriteria, (newFilters) => {
  localSearchCriteria.value = { ...newFilters }
}, { deep: true, immediate: true })

// Watch for changes in local filters
watch(localSearchCriteria, (newValue) => {
  emit('update:searchCriteria', newValue)
}, { deep: true })

const handlePopulateFromProfile = (checked: boolean) => {
  if (checked && userStore.user?.search_preferences) {
    const profilePrefs = userStore.user.search_preferences

    // Populate filters from profile
    localSearchCriteria.value = {
      keywords: localSearchCriteria.value.keywords,
      subjectAreas: profilePrefs.subject_areas || [],
      academic_level: profilePrefs.academic_level || null,
      target_type: profilePrefs.target_type || null,
      gender: profilePrefs.gender || null,
      ethnicity: profilePrefs.ethnicity || null,
      geographic_restrictions: null, 
      essay_required: profilePrefs.essay_required || null,
      recommendation_required: profilePrefs.recommendation_required || null
    }
  } else if (!checked) {
    // Clear all filters when unchecked
    clearAllFilters()
  }
}

const clearAllFilters = () => {
  localSearchCriteria.value = {
    keywords: '',
    subjectAreas: [],
    academic_level: null,
    target_type: null,
    gender: null,
    ethnicity: null,
    geographic_restrictions: null,
    essay_required: null,
    recommendation_required: null
  }
  populateFromProfile.value = false
}

// Expose methods and computed properties to parent components
defineExpose({
  activeFiltersCount,
  getActiveFiltersCount: () => activeFiltersCount.value,
  localSearchCriteria,
  close: () => { isExpanded.value = false }
})
</script>

<style scoped>
.filters-sidebar {
  position: relative;
  display: flex;
  justify-content: flex-end;
}

.filters-collapsed {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.filters-collapsed:hover {
  background: #f5f5f5;
}

.filters-text {
  font-weight: 500;
  font-size: 0.875rem;
  color: #333;
}

.filters-count {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  color: white;
  border-radius: 50%;
  padding: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  min-width: 18px;
  height: 18px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 4px rgba(30, 64, 175, 0.3);
  transition: all 0.2s ease;
}

.filters-count:hover {
  transform: scale(1.1);
  box-shadow: 0 3px 6px rgba(30, 64, 175, 0.4);
  border-color: rgba(255, 255, 255, 0.5);
}

.filters-expanded {
  position: absolute;
  top: 0;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 280px;
  max-width: 320px;
  z-index: 1000;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.filters-title {
  font-weight: 600;
  font-size: 1rem;
  color: #333;
}

.filters-content {
  padding: 12px;
}

.filter-section {
  margin-bottom: 12px;
}

.filter-section:last-child {
  margin-bottom: 0;
}

.filter-label {
  font-weight: 500;
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 6px;
}

@media (max-width: 768px) {
  .filters-expanded {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
    max-width: 90vw;
    max-height: 80vh;
    overflow-y: auto;
  }
}

.reset-btn {
  background-color: #f5f5f5;
  transition: all 0.2s ease;
}

.reset-btn:hover {
  background-color: #e0e0e0;
  transform: scale(1.1);
  color: #666;
}

/* Make dropdowns more compact */
:deep(.q-select) {
  .q-field__control {
    min-height: 36px;
  }
  
  .q-field__control-container {
    padding-top: 4px;
    padding-bottom: 4px;
  }
}

:deep(.q-input) {
  .q-field__control {
    min-height: 36px;
  }
  
  .q-field__control-container {
    padding-top: 4px;
    padding-bottom: 4px;
  }
}
</style> 
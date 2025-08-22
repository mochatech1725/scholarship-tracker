<template>
  <q-page padding>
    <div class="text-h5 q-mb-lg">Search Scholarships</div>

    <div class="row justify-end items-center q-mb-lg q-gutter-md">
      <div class="col-auto">
        <ScholarshipSearchCriteria 
          ref="searchCriteriaRef"
          :search-criteria="defaultSearchCriteria"
        />
      </div>
      <div class="col-auto">
        <div class="row items-center q-gutter-sm">
          <div class="col-auto">
            <div class="max-results-label">Max Results:</div>
          </div>
          <div class="col-auto">
            <q-input
              v-model.number="maxSearchResults"
              type="number"
              :min="1"
              :max="50"
              :step="5"
              outlined
              dense
              style="width: 80px"
              class="max-results-input"
            />
          </div>
        </div>
      </div>
      <div class="col-auto">
        <q-btn
          label="Search"
          color="primary"
          size="md"
          @click="handleSearch"
          :loading="searching"
          :disable="!hasActiveSearchCriteria"
          icon="search"
        />
      </div>
    </div>

    <!-- Results Section -->
    <div v-if="hasSearched && !searching" class="row">
      <div class="col-12">
        <ScholarshipSearchResults :results="searchResults" />
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="searching" class="row">
      <div class="col-12">
        <q-card>
          <q-card-section class="text-center q-pa-xl">
            <q-spinner-dots size="60px" color="primary" class="q-mb-md" />
            <div class="text-h6 text-grey-7 q-mb-sm">Searching for scholarships...</div>
            <div class="text-caption text-grey-5">This might take a while</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="row">
      <div class="col-12">
        <q-card>
          <q-card-section class="text-center q-pa-xl">
            <q-icon name="search" size="48px" color="grey-4" class="q-mb-md" />
            <div class="text-h6 text-grey-6">No search performed yet</div>
            <div class="text-caption text-grey-5 q-mt-sm">
              Use the filters above and click "Search" to find scholarships
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ScholarshipSearchCriteria from 'components/ScholarshipSearchCriteria.vue'
import ScholarshipSearchResults from 'components/ScholarshipSearchResults.vue'
import { apiService } from 'src/services/api.service'
import type { SearchCriteria } from 'src/shared-types'

/**
 * Validates and trims a SearchCriteria object.
 * Returns an object with cleaned criteria and any validation errors.
 */
function validateAndCleanSearchCriteria(
  criteria: SearchCriteria
): { cleaned: SearchCriteria; error?: string; invalidFields?: string[] } {
  // Helper to trim or return null
  const trimOrNull = (val: string | null) =>
    typeof val === 'string' ? val.trim() : val;

  // Cleaned object
  const cleaned: SearchCriteria = {
    ...criteria,
    keywords: trimOrNull(criteria.keywords) || '',
    subjectAreas: Array.isArray(criteria.subjectAreas)
      ? criteria.subjectAreas.map((s: string) => (typeof s === 'string' ? s.trim() : s))
      : [],
    academic_level: trimOrNull(criteria.academic_level),
    target_type: trimOrNull(criteria.target_type),
    gender: trimOrNull(criteria.gender),
    ethnicity: trimOrNull(criteria.ethnicity),
    geographic_restrictions: trimOrNull(criteria.geographic_restrictions),
    ...(criteria.academic_gpa !== null && { academic_gpa: criteria.academic_gpa }),
    essay_required: criteria.essay_required,
    recommendations_required: criteria.recommendations_required,
    ...(criteria.deadlineRange && {
      deadlineRange: {
        ...(criteria.deadlineRange.startDate && { startDate: criteria.deadlineRange.startDate }),
        ...(criteria.deadlineRange.endDate && { endDate: criteria.deadlineRange.endDate })
      }
    })
  };

  // Validate dates if present
  const invalidFields: string[] = [];
  let error: string | undefined;
  if (cleaned.deadlineRange) {
    const { startDate, endDate } = cleaned.deadlineRange;
    let start: Date | undefined, end: Date | undefined;
    if (startDate) {
      start = new Date(startDate);
      if (isNaN(start.getTime())) {
        error = 'Invalid start date format.';
        invalidFields.push('deadlineRange.startDate');
      }
    }
    if (endDate) {
      end = new Date(endDate);
      if (isNaN(end.getTime())) {
        error = error ? error + ' Invalid end date format.' : 'Invalid end date format.';
        invalidFields.push('deadlineRange.endDate');
      }
    }
    if (start && end && end <= start) {
      error = 'End date must be after start date.';
      invalidFields.push('deadlineRange.endDate', 'deadlineRange.startDate');
    }
  }
  if (error) {
    return { cleaned, error, invalidFields };
  }
  return { cleaned };
}

const searchCriteriaRef = ref()
const searching = ref(false)
const hasSearched = ref(false)
const maxSearchResults = ref(25)
const searchResults = ref([])

const defaultSearchCriteria: SearchCriteria = {
  keywords: '',
  subjectAreas: [],
  academic_level: null,
  target_type: null,
  gender: null,
  ethnicity: null,
  geographic_restrictions: null,
  essay_required: null,
  recommendations_required: null
}

const hasActiveSearchCriteria = computed(() => {
  return searchCriteriaRef.value?.getActiveFiltersCount() > 0
})

const handleSearch = async () => {
  try {
    searching.value = true
    
    // Validate and clean search criteria
    const { cleaned, error, invalidFields } = validateAndCleanSearchCriteria(searchCriteriaRef.value?.localSearchCriteria || defaultSearchCriteria)
    
    if (error) {
      const fieldNames = invalidFields?.map(field => {
        // Convert field names to user-friendly format
        return field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      }).join(', ')
      
      alert(`Invalid search criteria: ${error} Please check: ${fieldNames}`) // Replace with better UI notification if desired
      return
    }

    const results = await apiService.findScholarships(cleaned, maxSearchResults.value)
    searchResults.value = results || []
    
    if (results && results.length > 0) {
      alert(`Found ${results.length} scholarships`) // Replace with better UI notification if desired
    } else {
      alert('No scholarships found matching your criteria') // Replace with better UI notification if desired
    }
  } catch (error) {
    console.error('Search failed:', error)
    // Handle error - could show notification here
  } finally {
    searching.value = false
  }
}
</script>

<style lang="scss" scoped>
.scholarship-card {
  height: 100%;
  display: flex;
  flex-direction: column;

  .q-card-section {
    flex: 1;
  }
}

.max-results-label {
  font-weight: 500;
  font-size: 0.875rem;
  color: #333;
}
</style> 
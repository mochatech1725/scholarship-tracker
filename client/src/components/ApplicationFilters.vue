<template>
  <div class="filters-sidebar">
    <!-- Collapsed State -->
    <div v-if="!isExpanded" class="filters-collapsed" @click="isExpanded = true">
      <span class="filters-text">Filters</span>
      <span class="filters-count">{{ activeFiltersCount }}</span>
    </div>

    <!-- Expanded State -->
    <div v-else class="filters-expanded">
      <div class="filters-header">
        <div class="filters-title">Filters</div>
        <q-btn
          flat
          round
          dense
          icon="close"
          @click="isExpanded = false"
        />
      </div>

      <div class="filters-content">
        <!-- Status Filter -->
        <div class="filter-section">
          <div class="filter-label">Status</div>
          <q-select
            v-model="localFilters.status"
            :options="applicationStatusOptions"
            clearable
            outlined
            dense
            emit-value
            map-options
            placeholder="All Statuses"
          />
        </div>

        <!-- Type Filter -->
        <div class="filter-section">
          <div class="filter-label">Type</div>
          <q-select
            v-model="localFilters.targetType"
            :options="targetTypeOptions"
            clearable
            outlined
            dense
            emit-value
            map-options
            placeholder="All Types"
          />
        </div>

        <!-- Current Action Filter -->
        <div class="filter-section">
          <div class="filter-label">Current Action</div>
          <q-select
            v-model="localFilters.currentAction"
            :options="currentActionOptions"
            clearable
            outlined
            dense
            emit-value
            map-options
            placeholder="All Actions"
          />
        </div>

        <!-- Company Filter -->
        <div class="filter-section">
          <div class="filter-label">Company</div>
          <q-input
            v-model="localFilters.organization"
            clearable
            outlined
            dense
            placeholder="Search companies"
          />
        </div>

        <!-- Date Range Filter -->
        <div class="filter-section">
          <div class="filter-label">Due Date Range</div>
          <q-input
            :model-value="dateRangeDisplay"
            outlined
            dense
            readonly
            placeholder="Select date range"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date
                    v-model="dateRange"
                    range
                    mask="MM/DD/YYYY"
                    today-btn
                    @update:model-value="onDateRangeChange"
                  />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <!-- Clear All Button -->
        <div class="filter-section">
          <q-btn
            label="Clear All Filters"
            color="grey-6"
            outline
            dense
            full-width
            @click="clearAllFilters"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { formatDate } from 'src/utils/helper'
import { targetTypeOptions, applicationStatusOptions, currentActionOptions } from 'src/shared-types'

const isExpanded = ref(false)

const props = defineProps<{
  filters: {
    status: string | null
    targetType: string | null
    currentAction: string | null
    organization: string
    dueDateFrom: string | null
    dueDateTo: string | null
  }
}>()

const emit = defineEmits<{
  'update:filters': [value: typeof props.filters]
}>()

const localFilters = ref({ ...props.filters })

// Date range picker
const dateRange = ref<{ from: string; to: string } | null>(null)

const dateRangeDisplay = computed(() => {
  if (!dateRange.value?.from && !dateRange.value?.to) return ''
  
  if (dateRange.value?.from && dateRange.value?.to) {
    return `${formatDate(dateRange.value.from)} to ${formatDate(dateRange.value.to)}`
  }
  if (dateRange.value?.from) return `From ${formatDate(dateRange.value.from)}`
  if (dateRange.value?.to) return `To ${formatDate(dateRange.value.to)}`
  return ''
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (localFilters.value.status) count++
  if (localFilters.value.targetType) count++
  if (localFilters.value.currentAction) count++
  if (localFilters.value.organization) count++
  if (dateRange.value?.from || dateRange.value?.to) count++
  return count
})

const onDateRangeChange = (newRange: { from: string; to: string } | null) => {
  dateRange.value = newRange
  localFilters.value.dueDateFrom = newRange?.from || null
  localFilters.value.dueDateTo = newRange?.to || null
}

// Initialize date range from filters
watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
  if (newFilters.dueDateFrom || newFilters.dueDateTo) {
    dateRange.value = {
      from: newFilters.dueDateFrom || '',
      to: newFilters.dueDateTo || ''
    }
  } else {
    dateRange.value = null
  }
}, { deep: true, immediate: true })

watch(localFilters, (newValue) => {
  emit('update:filters', newValue)
}, { deep: true })

const clearAllFilters = () => {
  localFilters.value = {
    status: null,
    targetType: null,
    currentAction: null,
    organization: '',
    dueDateFrom: null,
    dueDateTo: null
  }
  dateRange.value = null
}
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
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.filters-title {
  font-weight: 600;
  font-size: 1rem;
  color: #333;
}

.filters-content {
  padding: 16px;
}

.filter-section {
  margin-bottom: 20px;
}

.filter-section:last-child {
  margin-bottom: 0;
}

.filter-label {
  font-weight: 500;
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 8px;
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
</style> 
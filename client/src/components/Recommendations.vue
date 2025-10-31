<template>
  <q-card class="q-pa-md">
    <q-card-section>
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6">Recommendations</div>
        <q-btn
          flat
          color="primary"
          icon="add"
          label="Add Recommendation"
          @click="showForm = true"
        />
      </div>

      <q-table
        :rows="recommendations"
        :columns="recommendationColumns"
        row-key="recommendation_id"
        flat
        bordered
        dense
      >
        <template v-slot:body-cell-recommender="props">
          <q-td :props="props">
            {{ getRecommenderDisplayName(props.row) }}
          </q-td>
        </template>
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-chip
              :color="getStatusColor(props.row.status)"
              text-color="white"
              dense
            >
              {{ props.row.status }}
            </q-chip>
          </q-td>
        </template>
        <template v-slot:body-cell-actions="props">
          <q-td :props="props" class="q-gutter-sm">
            <q-btn
              flat
              round
              color="primary"
              icon="edit"
              @click="editRecommendation(props.row)"
              dense
            />
            <q-btn
              flat
              round
              color="negative"
              icon="delete"
              @click="confirmDeleteRecommendation(props.row)"
              dense
            />
          </q-td>
        </template>
      </q-table>

      <!-- Recommendation Form Dialog -->
      <q-dialog v-model="showForm" persistent>
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="row items-center justify-between">
              <div class="text-h6">{{ editingRecommendation ? 'Edit' : 'Add' }} Recommendation</div>
              <q-btn
                flat
                round
                dense
                icon="close"
                @click="closeForm"
                size="sm"
                color="grey-7"
                class="close-btn"
                style="background-color: #f5f5f5; transition: all 0.2s ease;"
              />
            </div>
          </q-card-section>

          <q-card-section>
            <RecommendationForm
              :is-edit="!!editingRecommendation"
              :loading="loading"
              :recommendation="editingRecommendation"
              :application="application"
              :recommenders="recommenders"
              @submit="handleSubmit"
              @cancel="closeForm"
            />
          </q-card-section>
        </q-card>
      </q-dialog>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import type { Recommendation, Recommender, Application } from 'src/shared-types'
import { useGetStatusColor } from 'src/composables/useGetStatusColor'
import RecommendationForm from 'src/components/RecommendationForm.vue'
import { formatDate } from 'src/utils/helper'
import { apiService } from 'src/services/api.service'

const props = defineProps<{
  application: Application | null
  recommenders: Recommender[]
}>()

const emit = defineEmits<{
  (e: 'recommendations-updated', recommendations: Recommendation[]): void
}>()

const $q = useQuasar()
const recommendations = ref<Recommendation[]>([])
const showForm = ref(false)
const loading = ref(false)
const editingRecommendation = ref<Recommendation | null>(null)

const { getStatusColor } = useGetStatusColor()

const getRecommenderDisplayName = (recommendation: Recommendation) => {
  const recommender = props.recommenders.find(r => r.recommender_id === recommendation.recommender_id)
  if (!recommender) return 'Loading...'
  return `${recommender.first_name} ${recommender.last_name} (${recommender.email_address})`
}

const recommendationColumns = [
  { name: 'recommender', label: 'Recommender', 
  field: (row: Recommendation) => getRecommenderDisplayName(row), align: 'left' as const },
  { name: 'status', label: 'Status', field: 'status', align: 'left' as const },
  { name: 'due_date', label: 'Due Date', field: 'due_date', align: 'left' as const, format: (val: string | Date | null | undefined) => val ? formatDate(val) : '-' },
  { name: 'submitted_at', label: 'Submitted', field: 'submitted_at', align: 'left' as const, format: (val: Date | string | null | undefined) => val ? formatDate(val) : '-' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'right' as const }
]

const loadRecommendations = async () => {
  if (props.application?.application_id) {
    try {
      const fetched = await apiService.getRecommendationsByApplicationId(props.application.application_id)
      recommendations.value = Array.isArray(fetched) ? fetched : []
      emit('recommendations-updated', recommendations.value)
      return
    } catch (error) {
      console.error('Failed to load recommendations:', error)
    }
  }

  recommendations.value = props.application?.recommendations || []
}

const toUpdatePayload = (recommendation: Recommendation): Partial<Recommendation> => {
  const payload: Partial<Recommendation> = {
    recommender_id: recommendation.recommender_id,
    status: recommendation.status
  }

  if ('application_id' in recommendation) {
    payload.application_id = recommendation.application_id
  }

  payload.due_date = recommendation.due_date ?? null
  payload.submitted_at = recommendation.submitted_at ?? null

  return payload
}

const toCreatePayload = (
  recommendation: Recommendation,
  applicationId: number
): Omit<Recommendation, 'recommendation_id' | 'created_at' | 'updated_at'> => ({
  application_id: applicationId,
  recommender_id: recommendation.recommender_id,
  status: recommendation.status,
  due_date: recommendation.due_date ?? null,
  submitted_at: recommendation.submitted_at ?? null
})

const editRecommendation = (recommendation: Recommendation) => {
  editingRecommendation.value = recommendation
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  editingRecommendation.value = null
}

const handleSubmit = async (form: Recommendation) => {
  try {
    loading.value = true
    if (editingRecommendation.value && editingRecommendation.value.recommendation_id) {
      const updated = await apiService.updateRecommendation(
        editingRecommendation.value.recommendation_id,
        toUpdatePayload(form)
      )

      recommendations.value = recommendations.value.map(rec =>
        rec.recommendation_id === updated.recommendation_id ? updated : rec
      )

      $q.notify({
        type: 'positive',
        message: 'Recommendation updated successfully'
      })
    } else if (props.application?.application_id) {
      const created = await apiService.createRecommendation(
        toCreatePayload(
          {
            ...form,
            application_id: props.application.application_id
          },
          props.application.application_id
        )
      )

      recommendations.value = [...recommendations.value, created]

      $q.notify({
        type: 'positive',
        message: 'Recommendation created successfully'
      })
    }

    emit('recommendations-updated', recommendations.value)
    closeForm()
  } catch (err) {
    console.error('Failed to save recommendation:', err)
    $q.notify({
      color: 'negative',
      message: 'Failed to save recommendation'
    })
  } finally {
    loading.value = false
  }
}

const confirmDeleteRecommendation = (recommendation: Recommendation) => {
  const recommendationId = recommendation.recommendation_id
  const applicationId = props.application?.application_id

  if (!recommendationId || !applicationId) {
    $q.notify({
      color: 'negative',
      message: 'Cannot delete recommendation: No recommendation ID or application found'
    })
    return
  }
  $q.dialog({
    title: 'Confirm',
    message: 'Are you sure you want to delete this recommendation?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    void (async () => {
      try {
        await apiService.deleteRecommendation(recommendationId)
        recommendations.value = recommendations.value.filter(
          rec => rec.recommendation_id !== recommendationId
        )
        $q.notify({
          color: 'positive',
          message: 'Recommendation deleted successfully'
        })
        emit('recommendations-updated', recommendations.value)
      } catch (err) {
        console.error('Failed to delete recommendation:', err)
        $q.notify({
          color: 'negative',
          message: 'Failed to delete recommendation'
        })
      }
    })()
  })
}

onMounted(() => {
  void loadRecommendations()
})

watch(
  () => props.application?.application_id,
  () => {
    void loadRecommendations()
  }
)
</script>

<style scoped>
.close-btn:hover {
  background-color: #e0e0e0 !important;
  transform: scale(1.1);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.close-btn:active {
  transform: scale(0.95);
}
</style> 
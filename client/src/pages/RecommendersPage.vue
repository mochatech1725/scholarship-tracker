<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h5">Recommenders</div>
      <q-btn
        :style="{ backgroundColor: 'var(--q-button-primary)', color: 'white' }"
        icon="add"
        label="Add Recommender"
        @click="showForm = true"
      />
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12">
        <q-table
          :rows="recommenders"
          :columns="columns"
          row-key="re_id"
          flat
          bordered
          dense
          :pagination="{ rowsPerPage: 0 }"
          :loading="loading"
        >
          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="q-gutter-xs">
              <q-btn
                flat
                round
                color="primary"
                icon="edit"
                @click="editRecommender(props.row)"
                dense
                size="sm"
              />
              <q-btn
                flat
                round
                color="negative"
                icon="delete"
                @click="confirmDelete(props.row)"
                dense
                size="sm"
              />
            </q-td>
          </template>
        </q-table>
      </div>
    </div>

    <!-- Recommender Form Dialog -->
    <q-dialog v-model="showForm" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="row items-center justify-between">
            <div class="text-h6">{{ editingRecommender ? 'Edit' : 'Add' }} Recommender</div>
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
          <RecommenderForm
            :is-edit="!!editingRecommender"
            :recommender="editingRecommender"
            :loading="loading"
            :user="user"
            @submit="handleSubmit"
            @cancel="closeForm"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">Are you sure you want to delete this recommender?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Delete" color="negative" @click="deleteRecommender" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import type { Recommender } from 'src/shared-types'
import { useRecommenderStore } from 'src/stores/recommender.store'
import { useUserStore } from 'src/stores/user.store'
import RecommenderForm from 'src/components/RecommenderForm.vue'

const $q = useQuasar()
const recommenderStore = useRecommenderStore()
const userStore = useUserStore()
const recommenders = ref<Recommender[]>([])
const loading = ref(false)
const showForm = ref(false)
const editingRecommender = ref<Recommender | null>(null)
const showDeleteDialog = ref(false)
const recommenderToDelete = ref<Recommender | null>(null)

const user = computed(() => userStore.user)

// Type for form data (excludes optional _id field)
type RecommenderFormData = Omit<Recommender, 'recommender_id'>

const columns = [
  { name: 'name', label: 'Name', field: (row: Recommender) => `${row.first_name} ${row.last_name}`, align: 'left' as const, style: 'width: 150px' },
  { name: 'email', label: 'Email', field: 'email_address', align: 'left' as const, style: 'width: 200px' },
  { name: 'phone', label: 'Phone', field: 'phone_number', align: 'left' as const, style: 'width: 120px' },
  { name: 'relationship', label: 'Relationship', field: 'relationship', align: 'left' as const, style: 'width: 150px' },
  { name: 'actions', label: '', field: 'actions', align: 'center' as const, style: 'width: 80px' }
]

const loadRecommenders = async () => {
  try {
    loading.value = true
    recommenders.value = await recommenderStore.getRecommendersByUserId(user?.value?.user_id || 0)
  } catch (err) {
    console.error('Failed to load recommenders:', err)
    $q.notify({
      type: 'negative',
      message: 'Failed to load recommenders'
    })
  } finally {
    loading.value = false
  }
}

const editRecommender = (recommender: Recommender) => {
  editingRecommender.value = recommender
  showForm.value = true
}

const handleSubmit = async (form: RecommenderFormData) => {
  try {
    loading.value = true
    if (editingRecommender.value && editingRecommender.value.recommender_id) {
      await recommenderStore.updateRecommender(editingRecommender.value.recommender_id, form)
      $q.notify({
        type: 'positive',
        message: 'Recommender updated successfully'
      })
    } else {
      await recommenderStore.createRecommender(form)
      $q.notify({
        type: 'positive',
        message: 'Recommender created successfully'
      })
    }
    closeForm()
    await loadRecommenders()
  } catch (err) {
    console.error('Failed to save recommender:', err)
    $q.notify({
      type: 'negative',
      message: 'Failed to save recommender'
    })
  } finally {
    loading.value = false
  }
}

const closeForm = () => {
  showForm.value = false
  editingRecommender.value = null
}

const confirmDelete = (recommender: Recommender) => {
  recommenderToDelete.value = recommender
  showDeleteDialog.value = true
}

const deleteRecommender = async () => {
  if (!recommenderToDelete.value?.recommender_id) return

  try {
    await recommenderStore.deleteRecommender(recommenderToDelete.value.recommender_id || 0)
    recommenders.value = recommenders.value.filter(r => r.recommender_id !== recommenderToDelete.value?.recommender_id)
    $q.notify({
      type: 'positive',
      message: 'Recommender deleted successfully'
    })
  } catch (err) {
    console.error('Failed to delete recommender:', err)
    $q.notify({
      type: 'negative',
      message: 'Failed to delete recommender'
    })
  }
}

onMounted(() => {
  void loadRecommenders()
})
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
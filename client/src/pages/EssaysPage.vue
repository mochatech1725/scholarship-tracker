<template>
  <q-page padding>
    <div class="row q-mb-md items-center justify-between">
      <div class="text-h5">Essays</div>
      <q-btn
        color="primary"
        icon="add"
        label="Add Essay"
        @click="handleEdit(null)"
      />
    </div>

    <div v-if="!hasApplication" class="q-mt-lg">
      <q-card flat bordered class="q-pa-lg text-center">
        <div class="text-subtitle1 q-mb-sm">Select an application to manage essays.</div>
        <div class="text-body2 text-grey-7">Return to Applications and open an application to view or edit its essays.</div>
      </q-card>
    </div>

    <q-table
      v-else
      :rows="essays"
      :columns="columns"
      row-key="essay_id"
      :loading="loading"
    >
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn-group flat>
            <q-btn
              flat
              round
              color="primary"
              icon="edit"
              @click="handleEdit(props.row)"
            />
            <q-btn
              flat
              round
              color="negative"
              icon="delete"
              @click="confirmDelete(props.row)"
            />
          </q-btn-group>
        </q-td>
      </template>
    </q-table>

    <!-- Edit Form Dialog -->
    <q-dialog v-model="showForm" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="row items-center justify-between">
            <div class="text-h6">{{ editingEssay ? 'Edit Essay' : 'Add Essay' }}</div>
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
          <EssayForm
            :application="activeApplication"
            :essay="editingEssay"
            @submit="handleFormSubmit"
            @cancel="closeForm"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">Are you sure you want to delete this essay?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Delete" color="negative" @click="handleDelete" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useApplicationStore } from 'src/stores/application.store'
import type { Essay, Application } from 'src/shared-types'
import EssayForm from 'src/components/EssayForm.vue'

const props = defineProps<{
  application?: Application | null
}>()

const $q = useQuasar()
const applicationStore = useApplicationStore()
const loading = ref(false)
const essays = ref<Essay[]>([])
const showDeleteDialog = ref(false)
const selectedEssay = ref<Essay | null>(null)
const showForm = ref(false)
const editingEssay = ref<Essay | null>(null)

const activeApplication = computed<Application | null>(() => props.application ?? null)

const columns = [
  { name: 'theme', label: 'Theme', field: 'theme', align: 'left' as const },
  { name: 'count', label: 'Count', field: 'count', align: 'left' as const },
  { name: 'units', label: 'Units', field: 'units', align: 'left' as const },
  { name: 'essayLink', label: 'Essay Link', field: 'essay_link', align: 'left' as const, format: (val: string) => val ? 'View' : 'Not uploaded' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' as const }
]

const hasApplication = computed(() => !!activeApplication.value?.application_id)

const loadEssays = () => {
  if (!activeApplication.value?.application_id) {
    essays.value = []
    return
  }

  essays.value = activeApplication.value.essays || []
}

const confirmDelete = (essay: Essay) => {
  selectedEssay.value = essay
  showDeleteDialog.value = true
}

const handleDelete = async () => {
  if (!selectedEssay.value?.essay_id || !activeApplication.value?.application_id) return

  try {
    const application = activeApplication.value
    if (!application?.application_id) return

    const updatedEssays = application.essays?.filter(essay => essay.essay_id !== selectedEssay.value?.essay_id) || []
    const updatedApplication: Application = {
      ...application,
      essays: updatedEssays
    }

    await applicationStore.updateApplication(application.application_id, updatedApplication)
    
    $q.notify({
      color: 'positive',
      message: 'Essay deleted successfully'
    })
    
    selectedEssay.value = null
    showDeleteDialog.value = false
  } catch (error) {
    console.error('Failed to delete essay:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to delete essay'
    })
  }
}

const handleEdit = (essay: Essay | null) => {
  if (!hasApplication.value) {
    $q.notify({
      type: 'negative',
      message: 'Select an application before managing essays'
    })
    return
  }

  editingEssay.value = essay
  showForm.value = true
}

const handleFormSubmit = () => {
  showForm.value = false
  editingEssay.value = null
  loadEssays()
}

const closeForm = () => {
  showForm.value = false
  editingEssay.value = null
}

// Watch for changes in the application prop
watch(() => props.application, () => {
  void loadEssays()
}, { immediate: true })
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
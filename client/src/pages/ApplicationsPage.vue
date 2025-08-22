<template>
  <q-page padding>
    <div class="row q-mb-md items-center justify-between">
      <div class="text-h5">Applications</div>
      <q-btn
        :style="{ backgroundColor: 'var(--q-button-primary)', color: 'white' }"
        icon="add"
        label="New Application"
        @click="handleEdit(null)"
      />
    </div>

    <!-- Main Content with Sidebar -->
    <div class="applications-layout">
      <!-- Left Column: Filters and Table -->
      <div class="applications-main">
        <!-- Filters Section -->
        <div class="filters-section q-mb-md">
          <ApplicationFilters
            v-model:filters="filters"
          />
        </div>

        <!-- Applications Table -->
        <q-card>
          <q-table
            :rows="filteredApplications"
            :columns="columns"
            row-key="application_id"
            :loading="loading"
            v-model:pagination="pagination"
          >
            <template v-slot:body-cell-status="props">
              <q-td :props="props">
                <q-chip
                  :color="getStatusColor(props.value)"
                  text-color="white"
                  dense
                >
                  {{ props.value }}
                </q-chip>
              </q-td>
            </template>

            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn
                  flat
                  round
                  color="primary"
                  icon="edit"
                  size="sm"
                  @click="handleEdit(props.row)"
                />
                <q-btn
                  flat
                  round
                  color="negative"
                  icon="delete"
                  size="sm"
                  @click="confirmDelete(props.row)"
                />
              </q-td>
            </template>
          </q-table>
        </q-card>
      </div>
    </div>

    <!-- Application Form Dialog -->
    <q-dialog v-model="showForm" persistent>
      <q-card style="min-width: 800px; max-width: 90vw">
        <q-card-section>
          <div class="row items-center justify-between">
            <div class="text-h6">{{ dialogTitle }}</div>
            <q-btn
              flat
              round
              dense
              icon="close"
              @click="handleFormCancel"
              size="sm"
              color="grey-7"
              class="close-btn"
              style="background-color: #f5f5f5; transition: all 0.2s ease;"
            />
          </div>
        </q-card-section>

        <q-card-section>
          <ApplicationForm
            :is-edit="!!editingApplication"
            :application="currentApplication"
            @cancel="handleFormCancel"
            @submit="handleFormSubmit"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import type { QTableColumn } from 'quasar'
import ApplicationFilters from 'src/components/ApplicationFilters.vue'
import ApplicationForm from 'src/components/ApplicationForm.vue'
import type { ApplicationStatus, Application } from 'src/shared-types'
import { useGetStatusColor } from 'src/composables/useGetStatusColor'
import { useApplicationStore } from 'src/stores/application.store'
import { useUserStore } from 'src/stores/user.store'
import { storeToRefs } from 'pinia'
import { formatDate } from 'src/utils/helper'
import { useAuthStore } from 'src/stores/auth.store'

const $q = useQuasar()
const loading = ref(false)
const { getStatusColor } = useGetStatusColor()
const applicationStore = useApplicationStore()
const userStore = useUserStore()
const authStore = useAuthStore()

const { applications } = storeToRefs(applicationStore)

const filters = ref({
  status: null as ApplicationStatus | null,
  targetType: null as string | null,
  currentAction: '',
  organization: '',
  dueDateFrom: null as string | null,
  dueDateTo: null as string | null
})

const columns: QTableColumn[] = [
  { name: 'organization', label: 'Organization', field: 'organization', sortable: true, align: 'left' },
  { name: 'scholarship_name', label: 'Scholarship', field: 'scholarship_name', sortable: true, align: 'left' },
  { name: 'target_type', label: 'Type', field: 'target_type', sortable: true, align: 'left' },
  { name: 'min_award', label: 'Min Award', field: 'min_award', sortable: true, align: 'right', format: (val: number) => `$${val.toLocaleString()}` },
  { name: 'max_award', label: 'Max Award', field: 'max_award', sortable: true, align: 'right', format: (val: number) => `$${val.toLocaleString()}` },
  { name: 'status', label: 'Status', field: 'status', sortable: true, align: 'left' },
  { name: 'current_action', label: 'Current Action', field: 'current_action', sortable: true, align: 'left' },
  { name: 'due_date', label: 'Due Date', field: 'due_date', sortable: true, align: 'left', format: (val: string) => formatDate(val) },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'right', style: 'width: 70px' }
]

const pagination = ref({
  sortBy: 'due_date',
  descending: true,
  page: 1,
  rowsPerPage: 10
})

const filteredApplications = computed(() => {
  // Ensure applications.value is an array before filtering
  if (!Array.isArray(applications.value)) {
    return []
  }
  
  return applications.value.filter(app => {
    if (filters.value.status && app.status !== filters.value.status) return false
    if (filters.value.targetType && app.target_type !== filters.value.targetType) return false
    if (filters.value.currentAction && !app.current_action.toLowerCase().includes(filters.value.currentAction.toLowerCase())) return false
    if (filters.value.organization && !app.organization.toLowerCase().includes(filters.value.organization.toLowerCase())) return false
    
    // Date range filtering
    if (filters.value.dueDateFrom || filters.value.dueDateTo) {
      const appDueDate = new Date(app.due_date)
      const fromDate = filters.value.dueDateFrom ? new Date(filters.value.dueDateFrom) : null
      const toDate = filters.value.dueDateTo ? new Date(filters.value.dueDateTo) : null
      
      if (fromDate && appDueDate < fromDate) return false
      if (toDate && appDueDate > toDate) return false
    }
    
    return true
  })
})

const showForm = ref(false)
const editingApplication = ref<Application | null>(null)

const dialogTitle = computed(() => {
  return editingApplication.value ? 'Edit Application' : 'New Application'
})

const currentApplication = computed(() => editingApplication.value)

const handleFormCancel = () => {
  showForm.value = false
  editingApplication.value = null
}

const handleFormSubmit = async () => {
  showForm.value = false
  editingApplication.value = null
  await loadApplications()
}

const handleEdit = (application: Application | null) => {
  editingApplication.value = application
  showForm.value = true
}

const loadApplications = async () => {
  console.log('Loading applications...')
  
  // Try to get user from auth store first
  if (!userStore.user && authStore.user) {
    userStore.user = authStore.user
  }
  
  // If still no user, try to load from backend
  if (!userStore.user) {
    try {
      // If we have a user in auth store, use their ID, otherwise load without ID
      if (authStore.user?.auth_user_id) {
        await userStore.loadUser(authStore.user.auth_user_id)
      } else {
        await userStore.loadUser()
      }
    } catch (error) {
      console.error('Failed to load user:', error)
      $q.notify({
        color: 'negative',
        message: 'Failed to load user data'
      })
      return
    }
  }
  
  if (!userStore.user) {
    $q.notify({
      color: 'negative',
      message: 'User not found'
    })
    return
  }
  
  loading.value = true
  try {
    await applicationStore.getApplicationsByStudentId(userStore.user.user_id || 0)
  } catch (error) {
    console.error('Failed to load applications:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to load applications'
    })
  } finally {
    loading.value = false
  }
}

const confirmDelete = (application: Application) => {
  $q.dialog({
    title: 'Confirm',
    message: 'Are you sure you want to delete this application?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    void (async () => {
      try {
        if (application.application_id) {
          await applicationStore.deleteApplication(application.application_id)
          $q.notify({
            color: 'positive',
            message: 'Application deleted successfully'
          })
          await loadApplications()
        }
      } catch (error) {
        console.error('Failed to delete application:', error)
        $q.notify({
          color: 'negative',
          message: 'Failed to delete application'
        })
      }
    })()
  })
}

onMounted(() => {
  void loadApplications()
})
</script>

<style scoped>
.applications-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.applications-main {
  flex: 1;
  min-width: 0;
}

.filters-section {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .applications-layout {
    flex-direction: column;
    gap: 16px;
  }
  
  .applications-main {
    width: 100%;
  }
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
<template>
  <q-dialog v-model="showWarning" persistent>
    <q-card class="token-expiry-warning">
      <q-card-section class="row items-center">
        <q-avatar icon="warning" color="warning" text-color="white" />
        <span class="q-ml-sm text-h6">Session Expiring Soon</span>
      </q-card-section>

      <q-card-section>
        <p>Your session will expire in {{ timeUntilExpiry }} minutes.</p>
        <p>Would you like to extend your session to continue working?</p>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn 
          flat 
          label="Continue Working" 
          color="primary" 
          @click="extendSession"
          :loading="isExtending"
        />
        <q-btn 
          flat 
          label="Logout Now" 
          color="negative" 
          @click="logout"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuthStore } from 'src/stores/auth.store'
import { useQuasar } from 'quasar'

const authStore = useAuthStore()
const $q = useQuasar()

const showWarning = ref(false)
const isExtending = ref(false)

// Show warning when token expires in 5 minutes or less
const shouldShowWarning = computed(() => {
  return authStore.isTokenExpiringSoon && authStore.isUserAuthenticated
})

const timeUntilExpiry = computed(() => {
  return authStore.timeUntilExpiry
})

// Watch for token expiry and show warning
watch(shouldShowWarning, (newValue) => {
  if (newValue && !showWarning.value) {
    showWarning.value = true
  } else if (!newValue) {
    showWarning.value = false
  }
})

// Watch for when token is no longer expiring soon
watch(() => authStore.isTokenExpiringSoon, (newValue) => {
  if (!newValue) {
    showWarning.value = false
  }
})

const extendSession = async () => {
  try {
    isExtending.value = true
    console.log('Extending session...')
    
    // Try to refresh the token
    const success = await authStore.handleTokenExpiry()
    
    if (success) {
      $q.notify({
        type: 'positive',
        message: 'Session extended successfully!',
        position: 'top'
      })
      showWarning.value = false
    } else {
      $q.notify({
        type: 'negative',
        message: 'Failed to extend session. Please login again.',
        position: 'top'
      })
      await logout()
    }
  } catch (error) {
    console.error('Error extending session:', error)
    $q.notify({
      type: 'negative',
      message: 'Error extending session. Please login again.',
      position: 'top'
    })
    await logout()
  } finally {
    isExtending.value = false
  }
}

const logout = async () => {
  try {
    await authStore.logout()
    $q.notify({
      type: 'info',
      message: 'Logged out successfully.',
      position: 'top'
    })
  } catch (error) {
    console.error('Error during logout:', error)
    $q.notify({
      type: 'negative',
      message: 'Error during logout.',
      position: 'top'
    })
  }
}
</script>

<style scoped>
.token-expiry-warning {
  min-width: 400px;
}
</style> 
<template>
  <q-page class="flex flex-center">
    <div class="column items-center">
      <q-spinner-dots size="40px" color="primary" />
      <div class="text-h6 q-mt-md">Completing login...</div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { useAuthStore } from 'stores/auth.store'
import { useRouter } from 'vue-router'

const auth0 = useAuth0()
const authStore = useAuthStore()
const router = useRouter()

const handleCallback = async () => {
  try {
    console.log('Starting callback handling...')
    console.log('Auth0 isAuthenticated:', auth0.isAuthenticated.value)
    console.log('Auth0 user:', auth0.user.value)
    
    await authStore.handleCallback()
    console.log('Auth store handleCallback completed')
    
    console.log('Handling Auth0 redirect callback...')
    const { appState } = await auth0.handleRedirectCallback()
    console.log('App state:', appState)
    const target = appState?.target || { name: 'applicationsList' }
    console.log('Redirecting to:', target)
    await router.push(target)
  } catch (err) {
    console.error('Callback handling failed:', err)
    await router.push({ name: 'login' })
  }
}

onMounted(async () => {
  await handleCallback()
})
</script> 
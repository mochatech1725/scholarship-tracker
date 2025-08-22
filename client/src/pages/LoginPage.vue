<template>
  <q-page class="flex flex-center">
    <div class="column items-center">
      <q-btn
        color="primary"
        label="Login"
        @click="handleLogin"
        :loading="isLoading"
      />
      <div class="text-center q-mt-sm">
        <router-link :to="{ name: 'register' }">Don't have an account? Register</router-link>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { useQuasar } from 'quasar'
import { useRouter, useRoute } from 'vue-router'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()
const isLoading = ref(false)
const auth0 = useAuth0()

onMounted(async () => {
  try {
    // Check if user is already authenticated
    if (auth0.isAuthenticated) {
      const targetUrl = route.query.redirect as string || '/dashboard/applications'
      await router.push(targetUrl)
    }
  } catch (error) {
    console.error('Error checking authentication:', error)
    $q.notify({
      type: 'negative',
      message: 'Error checking authentication'
    })
  }
})

const handleLogin = async () => {
  try {
    isLoading.value = true

    const targetUrl = route.query.redirect as string || '/dashboard/applications'
    await auth0.loginWithRedirect({
      appState: { 
        target: targetUrl
      },
      authorizationParams: {
        screen_hint: 'login'
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to login'
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.auth-card {
  width: 100%;
  max-width: 500px;
  margin: 1rem;
}
</style> 
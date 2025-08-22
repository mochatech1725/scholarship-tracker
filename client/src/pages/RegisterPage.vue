<template>
  <q-page class="flex flex-center">
    <q-card class="register-card">
      <q-card-section>
        <div class="text-center q-mb-md">
          <q-btn
            color="primary"
            label="Create Acount"
            @click="onSignUp"
            class="full-width"
          />
        </div>

        <div class="text-center q-mt-sm">
          <router-link to="/login" class="text-primary">Already have an account? Login</router-link>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { useAuth0 } from '@auth0/auth0-vue'

const $q = useQuasar()
const auth0 = useAuth0()

const onSignUp = async () => {
  try {
    await auth0.loginWithRedirect({
      appState: { 
        target: '/dashboard/applications'
      },
      authorizationParams: {
        screen_hint: 'signup',
        redirect_uri: import.meta.env.VITE_AUTH0_CALLBACK_URL
      }
    })
  } catch (err: unknown) {
    console.error('Sign up failed:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('Error details:', {
      message: errorMessage,
      stack: err instanceof Error ? err.stack : undefined
    })
    $q.notify({
      color: 'negative',
      message: `Sign up failed: ${errorMessage}`
    })
  }
}
</script>

<style scoped>
.register-card {
  width: 100%;
  max-width: 400px;
  padding: 20px;
}
</style> 
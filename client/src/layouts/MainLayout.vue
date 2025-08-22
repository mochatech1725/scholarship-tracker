<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <!-- Logo and Title -->
        <div class="header-brand">
          <img src="/favicon.ico" alt="Scholarship Tracker" style="width: 32px; height: 32px; margin-right: 16px;" />
          <q-toolbar-title class="text-weight-bold header-title">
            Scholarship Application Tracker
          </q-toolbar-title>
        </div>

        <!-- Navigation Menu for authenticated users -->
        <q-btn-dropdown
          v-if="authStore.isUserAuthenticated"
          flat
          icon="menu"
          label="Menu"
        >
          <q-list>
            <q-item clickable v-close-popup :to="{ name: 'applicationsList' }">
              <q-item-section avatar>
                <q-icon name="description" />
              </q-item-section>
              <q-item-section>Applications</q-item-section>
            </q-item>

            <q-item clickable v-close-popup :to="{ name: 'scholarshipSearch' }">
              <q-item-section avatar>
                <q-icon name="search" />
              </q-item-section>
              <q-item-section>Scholarship Search</q-item-section>
            </q-item>

            <q-item clickable v-close-popup :to="{ name: 'editProfile' }">
              <q-item-section avatar>
                <q-icon name="person" />
              </q-item-section>
              <q-item-section>Profile</q-item-section>
            </q-item>

            <q-separator />

            <q-item clickable v-close-popup @click="onLogout">
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>
              <q-item-section>Logout</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <!-- Auth Menu for non-authenticated users -->
        <q-btn-dropdown
          v-if="!authStore.isUserAuthenticated"
          flat
          icon="account_circle"
          label="Account"
        >
          <q-list>
            <q-item clickable v-close-popup :to="{ name: 'login' }">
              <q-item-section avatar>
                <q-icon name="login" />
              </q-item-section>
              <q-item-section>Login</q-item-section>
            </q-item>

            <q-item clickable v-close-popup :to="{ name: 'register' }">
              <q-item-section avatar>
                <q-icon name="person_add" />
              </q-item-section>
              <q-item-section>Register</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Token Expiry Warning Component -->
    <TokenExpiryWarning />
  </q-layout>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth.store'
import { useRouter } from 'vue-router'
import TokenExpiryWarning from 'src/components/TokenExpiryWarning.vue'

const $q = useQuasar()
const authStore = useAuthStore()
const router = useRouter()

const onLogout = async () => {
  try {
    await authStore.logout()
    $q.notify({
      color: 'positive',
      message: 'Logged out successfully'
    })
  } catch (err) {
    console.error('Logout failed:', err)
    $q.notify({
      color: 'negative',
      message: 'Logout failed'
    })
  }
}

// Watch for authentication state changes
watch(
  () => authStore.isUserAuthenticated,
  async (isAuthenticated) => {
    if (!isAuthenticated && router.currentRoute.value.path !== '/login') {
      await router.push({ name: 'login' })
    } else if (isAuthenticated) {
      console.log('**** authStore.isUserAuthenticated changed to true')
    }
  }
)
</script>

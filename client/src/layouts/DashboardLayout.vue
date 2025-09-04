<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="text-white">
      <q-toolbar class="q-px-md">
        <!-- Logo and Title -->
        <div class="header-brand">
          <q-icon name="school" size="32px" class="q-mr-md" />
          <q-toolbar-title class="text-white text-weight-bold header-title">
            ScholarTrack
          </q-toolbar-title>
        </div>

        <!-- Spacer to push navigation to the right -->
        <q-space />

        <!-- Desktop Navigation -->
        <div class="desktop-nav q-gutter-md">
          <q-btn
            flat
            :to="{ name: 'dashboard' }"
            :class="{ 'text-primary': $route.name === 'dashboard' }"
            label="Dashboard"
          />
          <q-btn
            flat
            :to="{ name: 'applicationsList' }"
            :class="{ 'text-primary': $route.name === 'applicationsList' }"
            label="Applications"
          />
          <q-btn
            flat
            :to="{ name: 'recommendersList' }"
            :class="{ 'text-primary': $route.name === 'recommendersList' }"
            label="Recommenders"
          />
          <q-btn
            flat
            :to="{ name: 'scholarshipSearch' }"
            :class="{ 'text-primary': $route.name === 'scholarshipSearch' }"
            label="Search"
          />
          <q-btn
            flat
            :to="{ name: 'editProfile' }"
            :class="{ 'text-primary': $route.name === 'editProfile' }"
            label="Profile"
          />
        </div>

        <!-- User Menu and Mobile Menu -->
        <q-space />
        
        <!-- User Avatar -->
        <q-avatar color="primary" text-color="white" class="q-mr-sm">
          {{ userInitials }}
        </q-avatar>
        <span class="text-white q-mr-md">{{ userFullName }}</span>

        <!-- Logout Button -->
        <q-btn
          v-if="authStore.isUserAuthenticated"
          flat
          round
          icon="logout"
          @click="onLogout"
          class="q-mr-sm"
          color="white"
        />

        <!-- Mobile Menu Button -->
        <q-btn
          flat
          round
          icon="menu"
          @click="mobileMenu = !mobileMenu"
          class="mobile-menu-btn"
        />
      </q-toolbar>

      <!-- Mobile Navigation Drawer -->
      <q-slide-transition>
        <div v-show="mobileMenu" class="mobile-nav bg-white">
          <q-list class="q-pa-md">
            <q-item
              clickable
              :to="{ name: 'dashboard' }"
              @click="mobileMenu = false"
              :class="{ 'text-primary': $route.name === 'dashboard' }"
            >
              <q-item-section avatar>
                <q-icon name="dashboard" />
              </q-item-section>
              <q-item-section>Dashboard</q-item-section>
            </q-item>
            
            <q-item
              clickable
              :to="{ name: 'scholarshipSearch' }"
              @click="mobileMenu = false"
              :class="{ 'text-primary': $route.name === 'scholarshipSearch' }"
            >
              <q-item-section avatar>
                <q-icon name="search" />
              </q-item-section>
              <q-item-section>Search</q-item-section>
            </q-item>
            
            <q-item
              clickable
              :to="{ name: 'applicationsList' }"
              @click="mobileMenu = false"
              :class="{ 'text-primary': $route.name === 'applicationsList' }"
            >
              <q-item-section avatar>
                <q-icon name="description" />
              </q-item-section>
              <q-item-section>Applications</q-item-section>
            </q-item>
            
            <q-item
              clickable
              :to="{ name: 'essaysList' }"
              @click="mobileMenu = false"
              :class="{ 'text-primary': $route.name === 'essaysList' }"
            >
              <q-item-section avatar>
                <q-icon name="edit" />
              </q-item-section>
              <q-item-section>Essays</q-item-section>
            </q-item>
            
            <q-item
              clickable
              :to="{ name: 'editProfile' }"
              @click="mobileMenu = false"
              :class="{ 'text-primary': $route.name === 'editProfile' }"
            >
              <q-item-section avatar>
                <q-icon name="person" />
              </q-item-section>
              <q-item-section>Profile</q-item-section>
            </q-item>
            
            <q-separator class="q-my-md" />
            
            <q-item clickable @click="onLogout">
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>
              <q-item-section>Logout</q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-slide-transition>
    </q-header>

    <q-page-container>
      <!-- Dashboard Content -->
      <div v-if="$route.name === 'dashboard'" class="dashboard-content q-pa-lg">
        <!-- Loading State -->
        <div v-if="isLoading" class="flex flex-center" style="height: 50vh">
          <q-spinner-dots color="primary" size="40px" />
        </div>

        <!-- Dashboard Content -->
        <div v-else>
          <!-- Welcome Banner -->
          <div class="welcome-banner bg-primary text-white q-pa-lg q-mb-lg rounded-borders">
            <div class="text-h4 q-mb-sm">Welcome back, {{ userFirstName }}!</div>
            <q-btn 
              color="white" 
              text-color="primary" 
              label="View New Matches" 
              @click="$router.push({ name: 'scholarshipSearch' })"
            />
          </div>

        </div>
      </div>

      <!-- Other Pages Content -->
      <router-view v-else-if="isReady" />
      <div v-else class="flex flex-center" style="height: 100vh">
        <q-spinner-dots color="primary" size="40px" />
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from 'stores/auth.store'
import { useUserStore } from 'stores/user.store'
import { useApplicationStore } from 'stores/application.store'
import { useQuasar } from 'quasar'

const authStore = useAuthStore()
const userStore = useUserStore()
const applicationStore = useApplicationStore()
const $q = useQuasar()
const isReady = ref(false)
const mobileMenu = ref(false)
const isLoading = ref(false)

// Computed properties for user data
const userFullName = computed(() => {
  if (!userStore.user) return 'User'
  return `${userStore.user.first_name} ${userStore.user.last_name}`.trim() || 'User'
})

const userFirstName = computed(() => {
  if (!userStore.user?.first_name) return 'User'
  return userStore.user.first_name
})

const userInitials = computed(() => {
  if (!userStore.user) return 'U'
  const first = userStore.user.first_name?.charAt(0) || ''
  const last = userStore.user.last_name?.charAt(0) || ''
  return (first + last).toUpperCase() || 'U'
})

// Load data
const loadDashboardData = async () => {
  if (!authStore.isUserAuthenticated) return
  
  try {
    isLoading.value = true
    
    // Load user data if not already loaded
    if (!userStore.user) {
      await userStore.getUserProfile()
    }
    
    // Load applications for the current user
    if (userStore.user?.user_id) {
      await applicationStore.getApplicationsByUserId(userStore.user.user_id)
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to load dashboard data'
    })
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  isReady.value = true
  await loadDashboardData()
})

// Watch for authentication changes
watch(() => authStore.isUserAuthenticated, async (isAuthenticated) => {
  if (isAuthenticated) {
    await loadDashboardData()
  }
})

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
</script>

<style scoped>
.header-brand {
  display: flex;
  align-items: center;
}

.desktop-nav .q-btn {
  font-weight: 500;
}

.desktop-nav .q-btn.text-primary {
  border-bottom: 2px solid var(--q-primary);
}

.welcome-banner {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
}

.stat-card {
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.quick-action-btn {
  text-align: left;
  justify-content: flex-start;
  padding: 12px 16px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.quick-action-btn:hover {
  background-color: rgba(25, 118, 210, 0.1);
}

.deadline-item {
  border-left: 4px solid;
  transition: transform 0.2s ease;
}

.deadline-item:hover {
  transform: translateX(4px);
}

.deadline-item.bg-red-1 {
  border-left-color: #f44336;
}

.deadline-item.bg-orange-1 {
  border-left-color: #ff9800;
}

.deadline-item.bg-green-1 {
  border-left-color: #4caf50;
}

@media (max-width: 599px) {
  .desktop-nav {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
}

@media (min-width: 600px) {
  .mobile-menu-btn {
    display: none;
  }
}
</style> 
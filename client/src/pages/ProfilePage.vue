<template>
  <q-page padding>
    <div class="text-h5 q-mb-lg">Search Preferences</div>
    <ProfileForm
      :is-edit="isEdit"
      :search_preferences="userStore.user?.search_preferences ?? null"
      :user="userStore.user"
      @submit="handleSubmit"
      @cancel="handleCancel"
      @edit="isEdit = true"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import ProfileForm from 'src/components/ProfileForm.vue'
import { useUserStore } from 'src/stores/user.store'
import type { UserSearchPreferences } from 'src/shared-types'

const $q = useQuasar()
const userStore = useUserStore()
const isEdit = ref(false)

const handleSubmit = async (search_preferences: UserSearchPreferences) => {
  try {
    await userStore.updateSearchPreferences(search_preferences)
    $q.notify({
      color: 'positive',
      message: 'Profile updated successfully'
    })
    isEdit.value = false
  } catch (error) {
    console.error('Failed to update profile:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to update profile'
    })
  }
}

const handleCancel = () => {
  isEdit.value = false
}

onMounted(async () => {
  try {
    // If we already have a user, use their ID, otherwise load user data
    if (userStore.user?.auth_user_id) {
      await userStore.loadUser(userStore.user.auth_user_id)
    } else {
      await userStore.loadUser()
    }
  } catch (error) {
    console.error('Failed to load user:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to load user'
    })
  }
})
</script>

<style scoped>
.profile-cards-container {
  max-width: 600px;
  margin: 0 auto;
}
</style> 
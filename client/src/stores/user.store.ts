import { defineStore } from 'pinia'
import type { User } from 'src/shared-types'
import type { RegisterData, Auth0User } from 'src/types/index.ts'
import { apiService } from 'src/services/api.service'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as User | null,
    isLoading: false
  }),

  actions: {
    async authenticate() {
      try {
        this.isLoading = true
        const response = await apiService.login()

        return this.setUser(response.user)
      } catch (err) {
        console.error('Failed to authenticate user:', err)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async handleRegistration(auth0User: Auth0User) {
      try {
        this.isLoading = true

        // Step 1: Register with Auth0
        const registerData: RegisterData = {
          email_address: auth0User.emailAddress,
        }
        await apiService.register(registerData)

        // Step 2: Create user record in the users table
        const userData = {
          auth_user_id: auth0User.sub,
          first_name: '',
          last_name: '',
          email_address: auth0User.emailAddress,
          phone_number: '',
          created_at: new Date(),
          updated_at: new Date()
        }

        await apiService.createUser(userData)

        // Step 3: Fetch the complete user profile
        const userProfileResponse = await apiService.getUser()

        return this.setUser(userProfileResponse.user)
      } catch (err) {
        console.error('Failed to register user:', err)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async loadUser(user_id?: number) {
      try {
        console.log('loadUser called with user_id:', user_id)
        const user = await apiService.getUser(user_id)
        this.user = user
        return user
      } catch (error) {
        console.error('Failed to load user from API:', error)
        throw error
      }
    },

    async getUserProfile() {
      try {
        this.isLoading = true
        const response = await apiService.getUser()

        return this.setUser(response.user)
      } catch (err) {
        console.error('Failed to load user profile:', err)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    setUser(backendUser: User) {
      try {
        const user: User = {
          ...backendUser
        }

        this.user = user
        return user
      } catch (error) {
        console.error('Failed to load user from backend:', error)
        throw error
      }
    },

    async updateProfile(search_preferences: User['search_preferences']) {
      try {
        this.isLoading = true
        return await this.updateSearchPreferences(search_preferences)
      } catch (error) {
        console.error('Failed to update profile:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async updateSearchPreferences(search_preferences: User['search_preferences']) {
      if (!this.user || !search_preferences) return

      try {
        const updatedUser = await apiService.updateProfile(search_preferences, this.user.user_id || 0)
        if (updatedUser) {
          this.user = updatedUser
        }
      } catch (error) {
        console.error('Error updating search preferences:', error)
        throw error
      }
    },

    async logout() {
      try {
        this.isLoading = true
        // Call backend API to logout
        await apiService.logout()
        console.log('User logged out from server')
        this.clearUser()
      } catch (err) {
        console.error('Failed to logout from server:', err)
        // Don't throw here - we still want to clear local state even if server logout fails
        this.clearUser()
      } finally {
        this.isLoading = false
      }
    },

    clearUser() {
      this.user = null
    }
  }
}) 
import { defineStore } from 'pinia'
import type { User, UserSearchPreferences, SubjectArea } from 'src/shared-types'
import {
  subjectAreasOptions,
  academicLevelOptions,
  targetTypeOptions,
  genderOptions,
  ethnicityOptions
} from 'src/shared-types'
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

    setUser(backendUser: User | (User & { searchPreferences?: unknown })) {
      try {
        const ensureSubjectAreas = (value: unknown): SubjectArea[] => {
          if (!value) return []

          const list = Array.isArray(value)
            ? value
            : typeof value === 'string'
              ? value.split(',').map(item => item.trim()).filter(Boolean)
              : []

          return list.filter((item): item is SubjectArea =>
            typeof item === 'string' && subjectAreasOptions.includes(item as SubjectArea)
          )
        }

        const ensureOption = <T extends readonly string[]>(value: unknown, options: T): T[number] | undefined => {
          if (typeof value !== 'string') return undefined
          return options.includes(value as T[number]) ? (value as T[number]) : undefined
        }

        const ensureBoolean = (value: unknown): boolean | undefined => {
          if (typeof value === 'boolean') return value
          if (value === null || value === undefined) return undefined
          if (value === 'true') return true
          if (value === 'false') return false
          return undefined
        }

        const normalizeSearchPreferences = (prefs: unknown): UserSearchPreferences | undefined => {
          if (!prefs || typeof prefs !== 'object') return undefined

          const source = prefs as Record<string, unknown>

          const subjectAreas = source.subject_areas
          const academicLevel = source.academic_level
          const targetType = source.target_type
          const gender = source.gender
          const ethnicity = source.ethnicity
          const essayRequired = source.essay_required
          const recommendationRequired = source.recommendation_required

          const normalized: UserSearchPreferences = {
            user_id: (source.user_id as number) ?? (backendUser as User).user_id,
            subject_areas: ensureSubjectAreas(subjectAreas)
          }

          const normalizedAcademicLevel = ensureOption(academicLevel, academicLevelOptions)
          if (normalizedAcademicLevel) {
            normalized.academic_level = normalizedAcademicLevel
          }

          const normalizedTargetType = ensureOption(targetType, targetTypeOptions)
          if (normalizedTargetType) {
            normalized.target_type = normalizedTargetType
          }

          const normalizedGender = ensureOption(gender, genderOptions)
          if (normalizedGender) {
            normalized.gender = normalizedGender
          }

          const normalizedEthnicity = ensureOption(ethnicity, ethnicityOptions)
          if (normalizedEthnicity) {
            normalized.ethnicity = normalizedEthnicity
          }

          const normalizedEssayRequired = ensureBoolean(essayRequired)
          if (normalizedEssayRequired !== undefined) {
            normalized.essay_required = normalizedEssayRequired
          }

          const normalizedRecommendationRequired = ensureBoolean(recommendationRequired)
          if (normalizedRecommendationRequired !== undefined) {
            normalized.recommendation_required = normalizedRecommendationRequired
          }

          const createdAt = source.created_at
          if (createdAt instanceof Date) {
            normalized.created_at = createdAt
          }

          const updatedAt = source.updated_at
          if (updatedAt instanceof Date) {
            normalized.updated_at = updatedAt
          }

          return normalized
        }

        const searchPrefsSource = (backendUser as unknown as Record<string, unknown>).search_preferences

        const normalizedPrefs = normalizeSearchPreferences(searchPrefsSource)

        const normalizedUser: User = {
          ...(backendUser as User)
        }

        // Remove any existing search preference fields so we can set the normalized version
        delete (normalizedUser as unknown as Record<string, unknown>).search_preferences

        if (normalizedPrefs) {
          normalizedUser.search_preferences = normalizedPrefs
        }

        this.user = normalizedUser
        return normalizedUser
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
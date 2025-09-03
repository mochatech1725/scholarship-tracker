import { defineStore } from 'pinia'
import { apiService } from 'src/services/api.service'

import type { Application } from 'src/shared-types'

export const useApplicationStore = defineStore('application', {
  state: () => ({
    applications: [] as Application[]
  }),

  actions: {
    async getApplicationById(application_id: number) {
      try {
        return await apiService.getApplicationById(application_id)
      } catch (error) {
        console.error('Error getting application:', error)
        return null
      }
    },

    async createApplication(application: Omit<Application, '_id'>) {
      return await apiService.createApplication(application)
    },

    async updateApplication(application_id: number, application: Application) {
      try {
        return await apiService.updateApplication(application_id, application)
      } catch (error) {
        console.error('Error updating application:', error)
        return null
      }
    },

    async getApplicationsByUserId(user_id: number) {
      try {
        const result = await apiService.getApplicationsByUserId(user_id)
        // Ensure result is an array
        this.applications = Array.isArray(result) ? result : []
        return this.applications
      } catch (error) {
        console.error('Error fetching applications:', error)
        this.applications = []
        return []
      }
    },

    async deleteApplication(application_id: number) {
      try {
        await apiService.deleteApplication(application_id)
      } catch (error) {
        console.error('Error deleting application:', error)
        throw error
      }
    },
  }
}) 
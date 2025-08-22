import { defineStore } from 'pinia'
import { apiService } from 'src/services/api.service'
import type { Recommender } from 'src/shared-types'

export const useRecommenderStore = defineStore('recommender', {
  state: () => ({
    recommenders: [] as Recommender[]
  }),

  actions: {
    async createRecommender(recommender: Omit<Recommender, 'recommender_id'>) {
      try {
        const newRecommender = await apiService.createRecommender(recommender)
        this.recommenders.push(newRecommender)
        return newRecommender
      } catch (error) {
        console.error('Error creating recommender:', error)
        return null
      }
    },

    async getRecommenders() {
      try {
        this.recommenders = await apiService.getRecommenders()
        return this.recommenders || []
      } catch (error) {
        console.error('Error fetching recommenders:', error)
        return []
      }
    },

    async getRecommendersByUserId(auth_user_id: string) {
      this.recommenders = await apiService.getRecommendersByUserId(auth_user_id)
      return this.recommenders
    },

    async getRecommendersByStudentId(student_id: number) {
      this.recommenders = await apiService.getRecommendersByStudentId(student_id)
      return this.recommenders
    },
    
    async getRecommenderById(recommender_id: number) {
      try {
        return await apiService.getRecommenderById(recommender_id)
      } catch (error) {
        console.error('Error getting recommender:', error)
        return null
      }
    },

    async updateRecommender(recommender_id: number, recommender: Omit<Recommender, 'recommender_id'>) {
      try {
        const updatedRecommender = await apiService.updateRecommender(recommender_id, recommender)
        const index = this.recommenders.findIndex(r => r.recommender_id === recommender_id)
        if (index !== -1) {
          this.recommenders[index] = updatedRecommender
        }
        return updatedRecommender
      } catch (error) {
        console.error('Error updating recommender:', error)
        return null
      }
    },

    async deleteRecommender(recommender_id: number) {
      try {
        await apiService.deleteRecommender(recommender_id)
        const index = this.recommenders.findIndex(r => r.recommender_id === recommender_id)
        if (index !== -1) {
          this.recommenders.splice(index, 1)
        }
      } catch (error) {
        console.error('Error deleting recommender:', error)
        throw error
      }
    }
  }
}) 
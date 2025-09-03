import { useAuthStore } from 'src/stores/auth.store'
import type { RegisterData } from 'src/types/index.ts'
import type { Application, Recommender, SearchCriteria, UserSearchPreferences, User } from 'src/shared-types'
import { api } from 'src/boot/axios'
import type { AxiosRequestConfig } from 'axios'

class ApiService {
  private async getAuthHeaders() {
    const authStore = useAuthStore()
    const token = await authStore.getToken()

    return {
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }

  private async makeRequest(endpoint: string, options: AxiosRequestConfig = {}) {
    try {
      const headers = await this.getAuthHeaders()
      const url = endpoint

      const response = await api({
        url,
        method: options.method || 'GET',
        headers: {
          ...headers,
          ...options.headers,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        data: options.data,
        ...options
      })

      return response.data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('API request failed:', {
        endpoint,
        error: errorMessage
      })
      throw error
    }
  }

  // Auth endpoints
  async login() {
    return this.makeRequest('/api/auth/login')
  }

  async register(userData: RegisterData) {
    return this.makeRequest('/api/auth/register', {
      method: 'POST',
      data: userData
    })
  }

  async logout() {
    return this.makeRequest('/api/auth/logout', {
      method: 'POST'
    })
  }

  // User endpoints
  async createUser(userData: Omit<User, 'user_id'>) {
    return this.makeRequest('/api/users/create', {
      method: 'POST',
      data: userData
    })
  }

  async getUser(auth_user_id?: string) {
    if (auth_user_id) {
      return this.makeRequest(`/api/users/getById/${auth_user_id}`)
    }
    return this.makeRequest('/api/auth/login')
  }

  async updateProfile(search_preferences: UserSearchPreferences, user_id: number) {
    return this.makeRequest(`/api/users/saveProfile/${user_id}`, {
      method: 'POST',
      data: search_preferences
    })
  }

  // Application endpoints
  async getApplications() {
    return this.makeRequest('/api/applications/getAll')
  }

  async getApplicationById(application_id: number) {
    return this.makeRequest(`/api/applications/getById/${application_id}`)
  }

  async createApplication(application: Omit<Application, 'application_id'>) {
    return this.makeRequest('/api/applications/create', {
      method: 'POST',
      data: application
    })
  }

  async updateApplication(application_id: number, application: Application) {
    return this.makeRequest(`/api/applications/update/${application_id}`, {
      method: 'POST',
      data: application
    })
  }

  async deleteApplication(application_id: number) {
    return this.makeRequest(`/api/applications/delete/${application_id}`, {
      method: 'DELETE'
    })
  }
  async getApplicationsByUserId(auth_user_id: number) {
    return this.makeRequest(`/api/applications/user/${auth_user_id}`)
  }



  // Recommender endpoints
  async getRecommendersByUserId(auth_user_id: number) {
    return this.makeRequest(`/api/recommenders/user/${auth_user_id}`)
  }

  async getRecommenders() {
    return this.makeRequest('/api/recommenders/getAll')
  }

  async getRecommenderById(recommender_id: number) {
    return this.makeRequest(`/api/recommenders/getById/${recommender_id}`)
  }

  async createRecommender(recommender: Omit<Recommender, 'recommender_id'>) {
    return this.makeRequest('/api/recommenders/create', {
      method: 'POST',
      data: recommender
    })
  }

  async updateRecommender(recommender_id: number, recommender: Omit<Recommender, 'recommender_id'>) {
    return this.makeRequest(`/api/recommenders/update/${recommender_id}`, {
      method: 'POST',
      data: recommender
    })
  }

  async deleteRecommender(recommender_id: number) {
    return this.makeRequest(`/api/recommenders/delete/${recommender_id}`, {
      method: 'DELETE'
    })
  }

  // Scholarship endpoints
  async findScholarships(searchCriteria: SearchCriteria, maxResults: number = 25) {
    return this.makeRequest('/api/scholarships/find', {
      method: 'POST',
      data: {
        searchCriteria,
        maxResults
      }
    }).then(data => {
      console.log('Scholarships found:', data.data.scholarships)
      return data.data.scholarships
    })
  }
}



export const apiService = new ApiService() 
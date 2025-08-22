import { defineStore } from 'pinia'
import { ref, computed, onUnmounted } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { waitForAuth0Initialization } from 'src/boot/auth0'
import type { User } from 'src/shared-types'
import { useUserStore } from 'src/stores/user.store'

interface TokenInfo {
  expiresAt: number
  issuedAt: number
}

export type AuthStore = ReturnType<typeof useAuthStore>

export const useAuthStore = defineStore('auth', () => {
  const auth0 = useAuth0()
  const userStore = useUserStore()
  const isInitialized = ref(false)
  const isLoggingIn = ref(false)
  const user = ref<User | null>(null)
  const tokenInfo = ref<TokenInfo | null>(null)
  const tokenExpiryCheckInterval = ref<number | null>(null)

  const isUserAuthenticated = computed(() => {
    if (!isInitialized.value) return false
    return auth0?.isAuthenticated?.value ?? false
  })

  // Check if token is expired (for UI purposes)
  const isTokenExpired = computed(() => {
    if (!tokenInfo.value) return true
    return Date.now() >= tokenInfo.value.expiresAt
  })

  // Get time until token expires (in minutes)
  const timeUntilExpiry = computed(() => {
    if (!tokenInfo.value) return 0
    const timeLeft = tokenInfo.value.expiresAt - Date.now()
    return Math.max(0, Math.floor(timeLeft / (1000 * 60)))
  })

  // Check if token will expire soon (within 5 minutes)
  const isTokenExpiringSoon = computed(() => {
    return timeUntilExpiry.value <= 5 && timeUntilExpiry.value > 0
  })

  // Update token info when we get a new token
  const updateTokenInfo = async () => {
    try {
      if (auth0?.isAuthenticated?.value) {
        // Get the token to ensure it's available
        const token = await auth0.getAccessTokenSilently()
        
        if (token) {
          // Decode the JWT to get expiration time
          const parts = token.split('.')
          if (parts.length === 3 && parts[1]) {
            // Decode base64url to base64, then decode
            const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
            const payload = JSON.parse(atob(base64))
            const expiresAt = payload.exp * 1000 // Convert to milliseconds
            const issuedAt = payload.iat * 1000
            
            tokenInfo.value = {
              expiresAt,
              issuedAt
            }
            
            console.log('Token info updated, expires at:', new Date(expiresAt))
          }
        }
      }
    } catch (error) {
      console.error('Failed to update token info:', error)
    }
  }

  // Handle token expiry by attempting to refresh
  const handleTokenExpiry = async () => {
    console.log('Token expired, attempting to refresh...')
    
    try {
      // Try to get a new token silently
      const newToken = await auth0.getAccessTokenSilently()
      if (newToken) {
        await updateTokenInfo()
        console.log('Token refreshed successfully')
        return true
      }
    } catch (error) {
      console.error('Failed to refresh token:', error)
      
      // If silent refresh fails, redirect to login
      if (error instanceof Error && error.message.includes('login_required')) {
        console.log('Silent refresh failed, redirecting to login...')
        await login()
        return false
      }
    }
    
    return false
  }

  const startTokenExpiryMonitoring = () => {
    // Check token expiry every 30 seconds
    tokenExpiryCheckInterval.value = window.setInterval(() => {
      if (isTokenExpired.value) {
        void handleTokenExpiry()
      }
    }, 30000)
  }

  const stopTokenExpiryMonitoring = () => {
    if (tokenExpiryCheckInterval.value) {
      clearInterval(tokenExpiryCheckInterval.value)
      tokenExpiryCheckInterval.value = null
    }
  }

  const initialize = async () => {
    try {
      console.log('Initializing auth store...')
      
      // Wait for Auth0 to be ready
      await waitForAuth0Initialization(auth0)
      
      if (auth0?.isAuthenticated?.value) {
        console.log('User is authenticated, loading user data...')
        const userData = await userStore.authenticate()
        user.value = userData
        await updateTokenInfo()
        startTokenExpiryMonitoring()
      }
      
      isInitialized.value = true
      console.log('Auth store initialized')
    } catch (error) {
      console.error('Failed to initialize auth store:', error)
      isInitialized.value = true // Mark as initialized even if there's an error
    }
  }

  const handleCallback = async () => {
    try {
      console.log('Handling Auth0 callback...')
      
      if (auth0?.isAuthenticated?.value) {
        console.log('User authenticated after callback, loading user data...')
        const userData = await userStore.authenticate()
        user.value = userData
        await updateTokenInfo()
        startTokenExpiryMonitoring()
      }
    } catch (error) {
      console.error('Failed to handle Auth0 callback:', error)
      throw error
    }
  }

  const login = async () => {
    try {
      isLoggingIn.value = true
      console.log('Logging in...')
      
      await auth0?.loginWithRedirect()
    } catch (error) {
      console.error('Failed to login:', error)
      throw error
    } finally {
      isLoggingIn.value = false
    }
  }

  const logout = async () => {
    try {
      console.log('Logging out...')
      
      // Clear local state first
      user.value = null
      tokenInfo.value = null
      stopTokenExpiryMonitoring()
      userStore.clearUser()
      
      // Call backend logout
      await userStore.logout()
      
      // Then logout from Auth0
      await auth0?.logout({
        logoutParams: {
          returnTo: window.location.origin
        }
      })
    } catch (error) {
      console.error('Failed to logout:', error)
      // Still clear local state even if logout fails
      user.value = null
      tokenInfo.value = null
      stopTokenExpiryMonitoring()
      userStore.clearUser()
    }
  }

  const register = async () => {
    try {
      console.log('Registering...')
      
      if (!auth0?.user?.value) {
        throw new Error('No Auth0 user available for registration')
      }
      
      const auth0User = {
        sub: auth0.user.value.sub || '',
        emailAddress: auth0.user.value.email || ''
      }
      
      const userData = await userStore.handleRegistration(auth0User)
      user.value = userData
      await updateTokenInfo()
      startTokenExpiryMonitoring()
      
      return userData
    } catch (error) {
      console.error('Failed to register:', error)
      throw error
    }
  }

  const getToken = async () => {
    try {
      if (!auth0?.isAuthenticated?.value) {
        throw new Error('User not authenticated')
      }
      
      const token = await auth0.getAccessTokenSilently()
      return token
    } catch (error) {
      console.error('Failed to get token:', error)
      throw error
    }
  }

  const refreshUser = async () => {
    try {
      console.log('Refreshing user data...')
      const userData = await userStore.authenticate()
      user.value = userData
      return userData
    } catch (error) {
      console.error('Failed to refresh user:', error)
      throw error
    }
  }

  const reset = () => {
    user.value = null
    tokenInfo.value = null
    isInitialized.value = false
    isLoggingIn.value = false
    stopTokenExpiryMonitoring()
    userStore.clearUser()
  }

  // Cleanup on unmount
  onUnmounted(() => {
    stopTokenExpiryMonitoring()
  })

  return {
    // State
    isInitialized,
    isLoggingIn,
    user,
    tokenInfo,
    
    // Computed
    isUserAuthenticated,
    isTokenExpired,
    timeUntilExpiry,
    isTokenExpiringSoon,
    
    // Actions
    initialize,
    handleCallback,
    login,
    logout,
    register,
    getToken,
    refreshUser,
    reset,
    updateTokenInfo,
    handleTokenExpiry
  }
}) 
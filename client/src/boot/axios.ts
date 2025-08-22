import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosInstance } from 'axios';
import { useAuth0 } from '@auth0/auth0-vue';
import { useAuthStore } from 'src/stores/auth.store';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// Debug environment variables
console.log('API Base URL:', typeof import.meta.env.VITE_API_URL === 'string' ? import.meta.env.VITE_API_URL : '');

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Track if we're currently refreshing a token to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

export default defineBoot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;

  // Add Auth0 token to requests
  api.interceptors.request.use(async (config) => {
    const auth0 = useAuth0();
    if (auth0?.isAuthenticated?.value) {
      try {
        const token = await auth0.getAccessTokenSilently();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error getting token:', error);
        
        // If we can't get a token, the user might need to re-authenticate
        if (error instanceof Error && error.message.includes('login_required')) {
          console.log('Token refresh failed, redirecting to login...');
          const authStore = useAuthStore();
          void authStore.login();
        }
      }
    }
    return config;
  });

  // Add response interceptor for better error handling and token refresh
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      
      console.error('API request failed:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error instanceof Error ? error.message : typeof error === 'string' ? error : 'API request failed',
      });

      // Handle 401 Unauthorized errors (token expired)
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // If we're already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers.Authorization = `Bearer ${String(token)}`;
            return api(originalRequest);
          }).catch(err => {
            return Promise.reject(err instanceof Error ? err : new Error(String(err)));
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const auth0 = useAuth0();
          const authStore = useAuthStore();
          
          // Try to refresh the token
          const newToken = await auth0.getAccessTokenSilently();
          
          if (newToken) {
            // Update token info in the store
            await authStore.updateTokenInfo();
            
            // Process queued requests
            processQueue(null, newToken);
            
            // Retry the original request
            originalRequest.headers.Authorization = `Bearer ${String(newToken)}`;
            return api(originalRequest);
          } else {
            throw new Error('Failed to get new token');
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          
          // Process queued requests with error
          processQueue(refreshError, null);
          
          // If refresh fails, redirect to login
          const authStore = useAuthStore();
          await authStore.login();
          
          return Promise.reject(refreshError instanceof Error ? refreshError : new Error(String(refreshError)));
        } finally {
          isRefreshing = false;
        }
      }

      // Handle other errors
      return Promise.reject(error instanceof Error ? error : new Error(typeof error === 'string' ? error : 'API request failed'));
    }
  );
});

export { api };

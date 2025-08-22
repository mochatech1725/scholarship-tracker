import { boot } from 'quasar/wrappers'
import { createAuth0 } from '@auth0/auth0-vue'
import type { CacheLocation, Auth0VueClient } from '@auth0/auth0-vue'

// Debug environment variables
// console.log('Auth0 Configuration:', {
//   domain: import.meta.env.VITE_AUTH0_DOMAIN,
//   clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
//   callbackUrl: import.meta.env.VITE_AUTH0_CALLBACK_URL,
//   origin: window.location.origin,
//   href: window.location.href
// })

const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  authorizationParams: {
    redirect_uri: import.meta.env.VITE_AUTH0_CALLBACK_URL,
    audience: import.meta.env.VITE_AUTH0_AUDIENCE
  },
  cacheLocation: 'localstorage' as CacheLocation,
  useRefreshTokens: true,
  skipRedirectCallback: window.location.pathname === '/callback'
}


export const waitForAuth0Initialization = async (auth0: Auth0VueClient) => {
  
  while (auth0.isLoading.value) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  await auth0.checkSession()

  let attempts = 0
  const maxAttempts = 20
  while (!auth0.isAuthenticated.value && attempts < maxAttempts) {

    await new Promise(resolve => setTimeout(resolve, 250))
    attempts++
  }
}

export default boot(async ({ app }) => {
  const auth0 = createAuth0(auth0Config)
  
  try {
    app.use(auth0)
    
    await auth0.checkSession()

  } catch (error) {
    console.error('Error initializing Auth0:', error)
  }
}) 
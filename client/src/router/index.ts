import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import { useAuth0 } from '@auth0/auth0-vue';
import { useAuthStore } from 'stores/auth.store';
import { watch } from 'vue';

const createHistory = process.env.SERVER
  ? createMemoryHistory
  : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory);

const router = createRouter({
  scrollBehavior: () => ({ left: 0, top: 0 }),
  routes,
  history: createHistory(process.env.VUE_ROUTER_BASE),
});

// Public routes that don't require authentication
const publicRoutes = ['login', 'register', 'callback'];

router.beforeEach(async (to, from, next) => {
  console.log('Router guard: Navigating from', from.path, 'to', to.path)
  const auth0 = useAuth0();
  const authStore = useAuthStore();

  // Wait for Auth0 to finish loading
  if (auth0.isLoading.value) {
    console.log('Router guard: Waiting for Auth0 to finish loading...')
    await new Promise<void>(resolve => {
      const unwatch = watch(auth0.isLoading, (loading) => {
        if (!loading) {
          unwatch();
          resolve();
        }
      });
    });
  }

  // Initialize auth store if not already done
  if (!authStore.isInitialized) {
    try {
      console.log('Router: Initializing auth store...')
      await authStore.initialize();
    } catch (err) {
      console.error('Failed to initialize auth store:', err);
      // If initialization fails, redirect to login
      return next({ name: 'login' });
    }
  }

  // Wait for authentication state to be determined
  if (!authStore.isUserAuthenticated && !publicRoutes.includes(to.name as string)) {
    // If not authenticated and trying to access protected route, redirect to login
    return next({ name: 'login', query: { redirect: to.fullPath } });
  }

  if (to.name === 'home') {
    return next(authStore.isUserAuthenticated ? { name: 'applicationsList' } : { name: 'login' });
  }

  // Allow access to public routes
  if (authStore.isUserAuthenticated || publicRoutes.includes(to.name as string) || !to.matched.some(record => record.meta.requiresAuth)) {
    return next();
  }

  // Redirect to login
  const isLogout = from.name?.toString().startsWith('dashboard');
  return next(isLogout ? { name: 'login' } : { name: 'login', query: { redirect: to.fullPath } });
});

export default router; 
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: '/dashboard', name: 'home' },
      { path: 'login', component: () => import('pages/LoginPage.vue'), name: 'login', meta: { requiresAuth: false } },
      { path: 'register', component: () => import('pages/RegisterPage.vue'), name: 'register', meta: { requiresAuth: false } },
      { path: 'callback', component: () => import('pages/CallbackPage.vue'), name: 'callback', meta: { requiresAuth: false } }
    ]
  },
  {
    path: '/dashboard',
    component: () => import('layouts/DashboardLayout.vue'),
    name: 'dashboard',
    meta: { requiresAuth: true },
    children: [
      { path: 'applications', component: () => import('pages/ApplicationsPage.vue'), name: 'applicationsList', meta: { requiresAuth: true } },
      { path: 'scholarshipSearch', component: () => import('pages/ScholarshipSearchPage.vue'), name: 'scholarshipSearch', meta: { requiresAuth: true } },
      { path: 'profile', component: () => import('pages/ProfilePage.vue'), name:'editProfile', meta: { requiresAuth: true } },
      { path: 'essays', component: () => import('pages/EssaysPage.vue'), name: 'essaysList', meta: { requiresAuth: true } },
      { path: 'recommenders', component: () => import('pages/RecommendersPage.vue'), name: 'recommendersList', meta: { requiresAuth: true } },
      { path: 'recommendations', component: () => import('pages/RecommendationsPage.vue'), name: 'recommendationsList', meta: { requiresAuth: true } },
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
    name: 'not-found',
    meta: { requiresAuth: false }
  }
]

export default routes

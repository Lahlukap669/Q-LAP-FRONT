import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue')
    },
    {
      path: '/register', 
      name: 'register',
      component: () => import('../views/auth/RegisterView.vue')
    },
    
    // Trainer routes
    {
      path: '/trainer',
      name: 'trainer-dashboard',
      component: () => import('../views/trainer/DashboardView.vue')
    },
    {
      path: '/trainer/create-periodization',
      name: 'create-periodization', 
      component: () => import('../views/trainer/CreatePeriodizationView.vue')
    },
    {
      path: '/trainer/tests',
      name: 'tests',
      component: () => import('../views/trainer/TestsView.vue')
    },
    {
      path: '/trainer/visualizations',
      name: 'visualizations',
      component: () => import('../views/trainer/VisualizationsView.vue')
    },
    {
      path: '/trainer/add-athlete',
      name: 'add-athlete',
      component: () => import('../views/trainer/AddAthleteView.vue')
    },
    {
      path: '/trainer/my-athletes',
      name: 'my-athletes',
      component: () => import('../views/trainer/MyAthletesView.vue'),
    },
    {
      path: '/trainer/microcycle/:microcycleId/:dayOfWeek?',
      name: 'microcycle-info',
      component: () => import('../views/trainer/MicrocycleInfoView.vue')
    },
    {
      path: '/trainer/create-test',
      name: 'create-test',
      component: () => import('../views/trainer/CreateTestView.vue')
    },
    
    // Athlete routes
    {
      path: '/athlete',
      name: 'athlete-dashboard',
      component: () => import('../views/athlete/DashboardView.vue')
    },

    // Shared routes
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue')
    },
    {
      path: '/periodization-info/:id',
      name: 'periodization-info',
      component: () => import('../views/PeriodizationInfoView.vue')
    }
  ]
})

export default router


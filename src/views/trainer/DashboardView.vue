<template>
  <div class="min-h-screen content-bg">
    <!-- Header Component -->
    <TrainerHeader 
      :user-full-name="userFullName"
      @logout="logout"
    />

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-6">
      <!-- Welcome Section -->
      <WelcomeSection />

      <!-- Loading State -->
      <LoadingSpinner v-if="loading" message="Loading periodizations..." />

      <!-- Error State -->
      <ErrorMessage 
        v-else-if="error" 
        :message="error"
        @retry="fetchPeriodizations"
      />

      <!-- Periodizations List -->
      <div v-else class="space-y-6">
        <PeriodizationCard
          v-for="periodization in periodizations"
          :key="periodization.PERIODIZATION_ID"
          :periodization="periodization"
          @view="viewPeriodization"
          @delete="deletePeriodization"
        />

        <!-- Empty State -->
        <EmptyState 
          v-if="periodizations.length === 0"
          @create="createPeriodization"
        />
      </div>
    </main>

    <!-- Floating Add Button -->
    <FloatingActionButton @click="createPeriodization" />
  </div>
</template>

<script>
import axios from 'axios'
import { API_ENDPOINTS } from '@/utils/api.js'
import TrainerHeader from '@/components/layout/TrainerHeader.vue'
import WelcomeSection from '@/components/trainer/WelcomeSection.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'
import PeriodizationCard from '@/components/trainer/PeriodizationCard.vue'
import EmptyState from '@/components/trainer/EmptyState.vue'
import FloatingActionButton from '@/components/ui/FloatingActionButton.vue'

export default {
  name: 'TrainerDashboardView',
  components: {
    TrainerHeader,
    WelcomeSection,
    LoadingSpinner,
    ErrorMessage,
    PeriodizationCard,
    EmptyState,
    FloatingActionButton
  },
  data() {
    return {
      periodizations: [],
      loading: true,
      error: null
    }
  },
  computed: {
    userFullName() {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return `${user.first_name} ${user.last_name}` || 'Trainer'
    }
  },
  methods: {
    async fetchPeriodizations() {
      this.loading = true
      this.error = null
      
      try {
        const token = localStorage.getItem('access_token')
        if (!token) {
          this.$router.push('/login')
          return
        }

        const response = await axios.get(`${API_ENDPOINTS.LOGIN.replace('/auth/login', '')}/users/trainer/periodizations`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        this.periodizations = response.data.periodizations.map(p => {
          const progress = this.calculateProgress(p.DATE_CREATED, p.END_DATE)
          return { ...p, progress }
        })
        
      } catch (error) {
        console.error('Error fetching periodizations:', error)
        
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('user')
          this.$router.push('/login')
        } else {
          this.error = error.response?.data?.message || 'Failed to load periodizations'
        }
      } finally {
        this.loading = false
      }
    },
    
    calculateProgress(startDateStr, endDateStr) {
      const startDate = new Date(startDateStr)
      const endDate = new Date(endDateStr)
      const currentDate = new Date()
      
      const totalDuration = endDate.getTime() - startDate.getTime()
      const elapsed = currentDate.getTime() - startDate.getTime()
      
      if (elapsed < 0) return 0
      if (elapsed > totalDuration) return 100
      
      return Math.round((elapsed / totalDuration) * 100)
    },
    
    viewPeriodization(id) {
      this.$router.push(`/trainer/periodization/${id}`)
    },
    
    createPeriodization() {
      this.$router.push('/trainer/create-periodization')
    },
    
    deletePeriodization(id) {
      // Add delete functionality
      console.log('Delete periodization:', id)
    },
    
    logout() {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      this.$router.push('/login')
    }
  },
  
  mounted() {
    const token = localStorage.getItem('access_token')
    if (!token) {
      this.$router.push('/login')
      return
    }
    
    this.fetchPeriodizations()
  }
}
</script>

<style scoped>
.content-bg {
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
}
</style>

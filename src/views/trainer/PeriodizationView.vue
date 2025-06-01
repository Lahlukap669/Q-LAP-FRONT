<template>
  <div class="min-h-screen content-bg">
    <!-- Header -->
    <TrainerHeader 
      :user-full-name="userFullName"
      @logout="logout"
    />

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <i class="fas fa-spinner fa-spin text-4xl text-white mb-4"></i>
        <p class="text-white text-lg">Loading periodization...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="text-center bg-white rounded-xl p-8 mx-4">
        <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
        <h3 class="text-xl font-bold text-gray-800 mb-2">Error Loading Periodization</h3>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button @click="fetchPeriodizationInfo" class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-200">
          <i class="fas fa-redo mr-2"></i>Try Again
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <main v-else class="container mx-auto px-4 py-6">
      <!-- Page Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-white mb-4">PERIODIZATION PLAN</h1>
        
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="stats-card rounded-xl p-6 text-center">
            <div class="text-3xl font-bold text-blue-600 mb-2">{{ currentWeek }}</div>
            <div class="text-gray-700 font-medium">Current Week</div>
          </div>
          <div class="stats-card rounded-xl p-6 text-center">
            <div class="text-3xl font-bold text-green-600 mb-2">{{ totalWeeks }}</div>
            <div class="text-gray-700 font-medium">Total Weeks</div>
          </div>
          <div class="stats-card rounded-xl p-6 text-center">
            <div class="text-3xl font-bold text-purple-600 mb-2">{{ daysToCompetition }}</div>
            <div class="text-gray-700 font-medium">Days to Competition</div>
          </div>
        </div>
      </div>

      <!-- Training Timeline -->
      <div class="content-section rounded-xl p-6 mb-8">
        <h3 class="text-xl font-bold text-gray-800 mb-6">Training Timeline</h3>
        <div class="timeline-container">
          <div class="timeline-track">
            <div 
              v-for="(mesocycle, index) in periodizationInfo.mesocycles" 
              :key="index"
              class="timeline-segment"
              :class="{ 'current-mesocycle': index + 1 === currentMesocycle }"
              :style="{ width: (mesocycle.number_of_microcycles / totalWeeks * 100) + '%' }"
            >
              <div class="mesocycle-label">
                <div class="mesocycle-number">{{ index + 1 }}</div>
                <div class="mesocycle-weeks">Weeks {{ getWeekRange(index) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mesocycles Details -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div 
          v-for="(mesocycle, index) in periodizationInfo.mesocycles" 
          :key="index"
          class="mesocycle-card rounded-xl p-6"
          :class="{ 'current-mesocycle-card': index + 1 === currentMesocycle }"
        >
          <h4 class="text-lg font-bold text-gray-800 mb-3">
            MESOCYCLE {{ index + 1 }}
          </h4>
          <p class="text-gray-600 mb-4">Weeks {{ getWeekRange(index) }}</p>
          
          <!-- Motor Abilities -->
          <div class="mb-4">
            <h5 class="font-semibold text-gray-800 mb-2">Motor Abilities:</h5>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="ability in mesocycle.motor_abilities" 
                :key="ability"
                class="ability-tag px-3 py-1 rounded-full text-sm font-medium"
              >
                {{ ability }}
              </span>
            </div>
          </div>

          <!-- Training Methods -->
          <div class="mb-4">
            <h5 class="font-semibold text-gray-800 mb-2">Training Methods:</h5>
            <div class="space-y-2">
              <div 
                v-for="(method, methodIndex) in mesocycle.training_methods" 
                :key="methodIndex"
                class="flex items-center justify-between bg-gray-50 p-2 rounded-lg"
              >
                <span class="font-medium">{{ method }}</span>
                <span class="text-sm text-gray-600 bg-blue-100 px-2 py-1 rounded">
                  {{ mesocycle.method_groups[methodIndex] }}
                </span>
              </div>
            </div>
          </div>

          <!-- Key Exercises -->
          <div>
            <h5 class="font-semibold text-gray-800 mb-2">Key Exercises:</h5>
            <ul class="space-y-1">
              <li 
                v-for="exercise in mesocycle.key_exercises" 
                :key="exercise.exercise_id"
                class="flex items-center text-gray-700"
              >
                <i class="fas fa-circle text-xs text-blue-500 mr-2"></i>
                {{ exercise.exercise_name }}
                <span class="ml-2 text-xs text-gray-500">({{ exercise.usage_count }}x)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Current Week Details -->
      <div class="content-section rounded-xl p-6">
        <h3 class="text-xl font-bold text-gray-800 mb-6">
          Week {{ currentWeek }} Details (Mesocycle {{ currentMesocycle }})
        </h3>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Training Methods -->
          <div>
            <h4 class="font-semibold text-gray-800 mb-4">Training Methods</h4>
            <div class="space-y-3">
              <div 
                v-for="method in currentMesocycleData.training_methods" 
                :key="method"
                class="method-item p-3 bg-gray-50 rounded-lg"
              >
                {{ method }}
              </div>
            </div>
          </div>

          <!-- Key Exercises -->
          <div>
            <h4 class="font-semibold text-gray-800 mb-4">Key Exercises</h4>
            <ul class="space-y-2">
              <li 
                v-for="exercise in currentMesocycleData.key_exercises" 
                :key="exercise.exercise_id"
                class="flex items-center text-gray-700"
              >
                <i class="fas fa-circle text-xs text-green-500 mr-3"></i>
                {{ exercise.exercise_name }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Week Information -->
        <div class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="info-item">
            <span class="font-semibold">Mesocycle:</span>
            <span class="ml-2">{{ currentMesocycle }}</span>
          </div>
          <div class="info-item">
            <span class="font-semibold">Difficulty:</span>
            <span class="ml-2">{{ periodizationInfo.difficulty }}/10</span>
          </div>
          <div class="info-item">
            <span class="font-semibold">Competition:</span>
            <span class="ml-2">{{ periodizationInfo.name }}</span>
          </div>
          <div class="info-item">
            <span class="font-semibold">Type:</span>
            <span class="ml-2">{{ getWeekType(currentWeek) }}</span>
          </div>
        </div>
      </div>
    </main>

    <!-- Alert Component -->
    <AppAlert
      :visible="alert.show"
      :type="alert.type"
      :message="alert.message"
      @close="alert.show = false"
    />
  </div>
</template>

<script>
import axios from 'axios'
import { API_ENDPOINTS } from '@/utils/api.js'
import TrainerHeader from '@/components/layout/TrainerHeader.vue'
import AppAlert from '@/components/ui/AppAlert.vue'

export default {
  name: 'PeriodizationInfoView',
  components: {
    TrainerHeader,
    AppAlert
  },
  data() {
    return {
      loading: true,
      error: null,
      periodizationInfo: null,
      currentDate: new Date(2025, 5, 1), // June 1, 2025
      alert: {
        show: false,
        type: 'info',
        message: ''
      }
    }
  },
  computed: {
    userFullName() {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return `${user.first_name} ${user.last_name}` || 'Trainer'
    },
    currentWeek() {
      if (!this.periodizationInfo) return 0
      
      const startDate = new Date(this.periodizationInfo.start_date)
      const daysPassed = Math.floor((this.currentDate - startDate) / (1000 * 60 * 60 * 24))
      const weeksPassed = Math.floor(daysPassed / 7)
      
      return Math.max(1, Math.min(weeksPassed + 1, this.totalWeeks))
    },
    totalWeeks() {
      if (!this.periodizationInfo) return 0
      return Math.ceil(this.periodizationInfo.duration_weeks)
    },
    daysToCompetition() {
      if (!this.periodizationInfo) return 0
      
      const endDate = new Date(this.periodizationInfo.end_date)
      const daysDiff = Math.floor((endDate - this.currentDate) / (1000 * 60 * 60 * 24))
      
      return Math.max(0, daysDiff)
    },
    currentMesocycle() {
      if (!this.periodizationInfo) return 1
      
      let cumulativeWeeks = 0
      for (let i = 0; i < this.periodizationInfo.mesocycles.length; i++) {
        cumulativeWeeks += this.periodizationInfo.mesocycles[i].number_of_microcycles
        if (this.currentWeek <= cumulativeWeeks) {
          return i + 1
        }
      }
      return this.periodizationInfo.mesocycles.length
    },
    currentMesocycleData() {
      if (!this.periodizationInfo) return {}
      return this.periodizationInfo.mesocycles[this.currentMesocycle - 1] || {}
    }
  },
  methods: {
    showAlert(type, message) {
      this.alert = {
        show: true,
        type: type,
        message: message
      }
    },
    
    async fetchPeriodizationInfo() {
      this.loading = true
      this.error = null
      
      try {
        const token = localStorage.getItem('access_token')
        if (!token) {
          this.$router.push('/login')
          return
        }

        const periodizationId = this.$route.params.id
        const response = await axios.get(`${API_ENDPOINTS.LOGIN.replace('/auth/login', '')}/periodization-info/${periodizationId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        this.periodizationInfo = response.data.periodization_info
        
      } catch (error) {
        console.error('Error fetching periodization info:', error)
        
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('user')
          this.$router.push('/login')
        } else {
          this.error = error.response?.data?.message || 'Failed to load periodization information'
        }
      } finally {
        this.loading = false
      }
    },
    
    getWeekRange(mesocycleIndex) {
      if (!this.periodizationInfo) return '1-1'
      
      let startWeek = 1
      for (let i = 0; i < mesocycleIndex; i++) {
        startWeek += this.periodizationInfo.mesocycles[i].number_of_microcycles
      }
      
      const endWeek = startWeek + this.periodizationInfo.mesocycles[mesocycleIndex].number_of_microcycles - 1
      return `${startWeek}-${endWeek}`
    },
    
    getWeekType(week) {
      // 2:1 ratio means every 3rd week is recovery
      return week % 3 === 0 ? 'Recovery Week (2:1 ratio)' : 'Training Week'
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
    
    this.fetchPeriodizationInfo()
  }
}
</script>

<style scoped>
.content-bg {
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
}

.stats-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.content-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.timeline-container {
  width: 100%;
  overflow-x: auto;
}

.timeline-track {
  display: flex;
  min-width: 800px;
  height: 80px;
  background: #f3f4f6;
  border-radius: 10px;
  padding: 10px;
}

.timeline-segment {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
  margin-right: 4px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.timeline-segment.current-mesocycle {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  transform: scale(1.05);
}

.timeline-segment.current-mesocycle .mesocycle-label {
  color: white;
}

.mesocycle-label {
  text-align: center;
}

.mesocycle-number {
  font-weight: bold;
  font-size: 1.2rem;
}

.mesocycle-weeks {
  font-size: 0.75rem;
  opacity: 0.8;
}

.mesocycle-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.mesocycle-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.current-mesocycle-card {
  border: 2px solid #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.ability-tag {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1d4ed8;
}

.method-item {
  border-left: 4px solid #3b82f6;
}

.info-item {
  background: #f9fafb;
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid #10b981;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .timeline-track {
    min-width: 600px;
  }
  
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>

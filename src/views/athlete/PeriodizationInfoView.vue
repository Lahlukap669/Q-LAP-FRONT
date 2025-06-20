<template>
  <div class="periodization-bg">
    <!-- Header -->
    <AthleteHeader 
      :user-full-name="userFullName"
      @logout="logout"
    />

    <!-- Loading State -->
    <div v-if="loading" class="loading-container container mx-auto px-4 py-4">
      <div class="loading-content">
        <i class="fas fa-spinner fa-spin loading-spinner"></i>
        <p class="loading-text">Nalaganje ciklizacije...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container container mx-auto px-4 py-4">
      <div class="error-card">
        <i class="fas fa-exclamation-triangle error-icon"></i>
        <h3 class="error-title">Napaka pri nalaganju ciklizacije.</h3>
        <p class="error-text">{{ error }}</p>
        <button @click="fetchPeriodizationInfo" class="retry-button">
          <i class="fas fa-redo button-icon"></i>Poskusi ponovno
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="dashboard-container container mx-auto px-4 py-4">
      <!-- Header Section -->
      <div class="header-section">
        <div class="header-card">
          <h1 class="header-title">
            <i class="fas fa-calendar header-icon"></i>MOJ NAČRT CIKLIZACIJE
          </h1>
          
          <!-- Stats Row -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">{{ currentWeek }}</div>
              <div class="stat-label">Trenutni teden</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ totalWeeks }}</div>
              <div class="stat-label">Skupno tedni</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ daysToCompetition }}</div>
              <div class="stat-label">Dnevi do glavnega tekmovanja</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Training Timeline -->
      <div class="timeline-section">
        <div class="timeline-card">
          <h3 class="section-title">Časovni potek ciklizacije</h3>
          
          <!-- Week Blocks - CLICKABLE -->
          <div class="week-blocks-container">
            <div 
              v-for="(week, index) in allWeeks" 
              :key="index"
              class="week-block"
              :class="getWeekBlockClass(week, index + 1)"
              @click="navigateToWeekExercises(week, index + 1)"
              :title="`Klikni za ogled vaj v tednu ${index + 1}`"
            >
              <!-- Competition Week: Show both number and crown -->
              <div v-if="index + 1 === totalWeeks" class="competition-content">
                <span class="week-number">{{ index + 1 }}</span>
                <i class="fas fa-crown competition-crown"></i>
              </div>
              <!-- Regular Week: Just show number -->
              <span v-else>{{ index + 1 }}</span>
            </div>
          </div>
          
          <!-- Legend -->
          <div class="legend-container">
            <div class="legend-grid">
              <div 
                v-for="(mesocycle, index) in periodizationInfo.mesocycles" 
                :key="index"
                class="legend-item"
              >
                <div class="legend-color" :class="getMesocycleClass(index)"></div>
                <span class="legend-text">Mezocikel {{ index + 1 }}</span>
              </div>
              <div class="legend-item">
                <div class="legend-color recovery-color"></div>
                <span class="legend-text">Aktivni počitek</span>
              </div>
              <div class="legend-item">
                <div class="legend-color competition-legend"></div>
                <span class="legend-text">Tekmovanje</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mesocycles Grid -->
      <div class="mesocycles-grid">
        <div 
          v-for="(mesocycle, index) in periodizationInfo.mesocycles" 
          :key="index"
          class="mesocycle-card"
        >
          <div class="mesocycle-header">
            <div class="mesocycle-indicator" :class="getMesocycleClass(index)"></div>
            <div>
              <h4 class="mesocycle-title">MEZOCIKEL {{ index + 1 }}</h4>
              <p class="mesocycle-weeks">Weeks {{ getWeekRange(index) }}</p>
            </div>
          </div>
          
          <!-- Motor Abilities -->
          <div class="mesocycle-section">
            <h6 class="section-subtitle">Gibalne sposobnosti:</h6>
            <div class="abilities-container">
              <span 
                v-for="ability in mesocycle.motor_abilities" 
                :key="ability"
                class="ability-badge"
              >
                {{ ability }}
              </span>
            </div>
          </div>

          <!-- Training Methods -->
          <div class="mesocycle-section">
            <h6 class="section-subtitle">Metode treninga:</h6>
            <div class="methods-list">
              <div 
                v-for="(method, methodIndex) in mesocycle.training_methods" 
                :key="methodIndex"
                class="method-item"
              >
                {{ method }}
              </div>
            </div>
          </div>

          <!-- Method Groups -->
          <div class="mesocycle-section">
            <h6 class="section-subtitle">Podkategorije gibalnih sposobnosti:</h6>
            <div class="method-groups-list">
              <span 
                v-for="(group, groupIndex) in mesocycle.method_groups" 
                :key="groupIndex"
                class="method-group-badge"
              >
                {{ group }}
              </span>
            </div>
          </div>

          <!-- Key Exercises -->
          <div class="mesocycle-section">
            <h6 class="section-subtitle">Nekatere vaje:</h6>
            <ul class="exercise-list">
              <li 
                v-for="exercise in mesocycle.key_exercises" 
                :key="exercise.exercise_id"
                class="exercise-item"
              >
                {{ exercise.exercise_name }}
                <span class="exercise-count">({{ exercise.usage_count }}x)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Current Week Details -->
      <div class="week-details-section">
        <div class="week-details-card">
          <h3 class="details-title">
            Teden {{ currentWeek }} - (Mezocikel {{ currentMesocycle }})
          </h3>
          
          <div class="details-grid">
            <!-- Training Methods -->
            <div class="details-column">
              <h5 class="details-subtitle">Metode treninga</h5>
              <div class="training-methods-detail">
                <div 
                  v-for="(method, index) in currentMesocycleData.training_methods" 
                  :key="index"
                  class="method-detail-card"
                >
                  <span class="method-detail-name">{{ method }}</span>
                </div>
              </div>
            </div>

            <!-- Key Exercises -->
            <div class="details-column">
              <h5 class="details-subtitle">Nekatere vaje</h5>
              <ul class="exercise-detail-list">
                <li 
                  v-for="exercise in currentMesocycleData.key_exercises" 
                  :key="exercise.exercise_id"
                  class="exercise-detail-item"
                >
                  {{ exercise.exercise_name }}
                </li>
              </ul>
            </div>
          </div>

          <!-- Week Information -->
          <div class="week-info-section">
            <div class="info-grid">
              <div class="info-card">
                <strong>Mezocikel:</strong> {{ currentMesocycle }}
              </div>
              <div class="info-card">
                <strong>Težavnost:</strong> {{ periodizationInfo.difficulty }}/10
              </div>
              <div class="info-card">
                <strong>Atlet:</strong> {{ periodizationInfo.name }}
              </div>
              <div class="info-card">
                <strong>Tip:</strong> {{ getCurrentWeekType() }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

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
import { apiClient } from '@/utils/api.js'
import AthleteHeader from '@/components/layout/AthleteHeader.vue'
import AppAlert from '@/components/ui/AppAlert.vue'

export default {
  name: 'AthletePeriodizationInfoView',
  components: {
    AthleteHeader,
    AppAlert
  },
  data() {
    return {
      loading: true,
      error: null,
      periodizationInfo: null,
      currentDate: new Date(),
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
      return `${user.first_name} ${user.last_name}` || 'Atlet'
    },
    allWeeks() {
      if (!this.periodizationInfo) return []
      
      const weeks = []
      this.periodizationInfo.mesocycles.forEach((mesocycle, mesocycleIndex) => {
        mesocycle.microcycles.forEach((microcycle) => {
          weeks.push({
            mesocycleIndex,
            microcycle,
            isActiveRest: microcycle.active_rest
          })
        })
      })
      return weeks
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
      return this.allWeeks.length
    },
    daysToCompetition() {
      if (!this.periodizationInfo) return 0
      
      const endDate = new Date(this.periodizationInfo.end_date)
      const daysDiff = Math.floor((endDate - this.currentDate) / (1000 * 60 * 60 * 24))
      
      return Math.max(0, daysDiff)
    },
    currentMesocycle() {
      if (!this.periodizationInfo || this.currentWeek <= 0) return 1
      
      const currentWeekData = this.allWeeks[this.currentWeek - 1]
      return currentWeekData ? currentWeekData.mesocycleIndex + 1 : 1
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

    navigateToWeekExercises(week, weekNumber) {
      // Calculate the first day of the clicked week
      const startDate = new Date(this.periodizationInfo.start_date)
      const firstDayOfWeek = new Date(startDate)
      firstDayOfWeek.setDate(startDate.getDate() + (weekNumber - 1) * 7)
      
      const dateString = firstDayOfWeek.toISOString().split('T')[0]
      
      console.log('Navigating to dashboard with date:', dateString)
      
      // Navigate to athlete dashboard with date query parameter
      this.$router.push({
        name: 'athlete-dashboard',
        query: { date: dateString }
      }).then(() => {
        console.log('Navigation successful')
      }).catch(err => {
        console.error('Navigation error:', err)
        this.showAlert('error', 'Napaka pri navigaciji na vaje.')
      })
    },
    
    async fetchPeriodizationInfo() {
      this.loading = true
      this.error = null
      
      try {
        const periodizationId = this.$route.params.id
        
        if (!periodizationId) {
          this.error = 'No periodization ID provided'
          return
        }

        const response = await apiClient.get(`/periodization-info/${periodizationId}`)
        this.periodizationInfo = response.data.periodization_info
        
      } catch (error) {
        console.error('Napaka pri nalaganju vsebine ciklizacije:', error)
        
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('user')
          this.$router.push('/login')
        } else {
          this.error = error.response?.data?.message || 'Napaka pri nalaganju vsebine ciklizacije.'
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
    
    getWeekBlockClass(week, weekNumber) {
      if (weekNumber === this.totalWeeks) {
        return 'competition-week'
      } else if (week.isActiveRest) {
        return 'recovery-week'
      } else {
        return this.getMesocycleClass(week.mesocycleIndex)
      }
    },
    
    getMesocycleClass(index) {
      const classes = [
        'mesocycle-1', 'mesocycle-2', 'mesocycle-3', 'mesocycle-4', 'mesocycle-5',
        'mesocycle-6', 'mesocycle-7', 'mesocycle-8', 'mesocycle-9', 'mesocycle-10',
        'mesocycle-11', 'mesocycle-12', 'mesocycle-13', 'mesocycle-14', 'mesocycle-15',
        'mesocycle-16', 'mesocycle-17', 'mesocycle-18', 'mesocycle-19', 'mesocycle-20'
      ]
      return classes[index] || 'mesocycle-1'
    },
    
    getCurrentWeekType() {
      if (this.currentWeek <= 0 || this.currentWeek > this.allWeeks.length) return 'Neznano'
      
      const currentWeekData = this.allWeeks[this.currentWeek - 1]
      if (currentWeekData.isActiveRest) {
        return 'Aktivni počitek (2:1 razmerje)'
      }
      
      if (this.currentWeek === this.totalWeeks) {
        return 'Teden tekme'
      }
      
      return 'Teden treninga'
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
/* Main Background */
.periodization-bg {
  background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
  min-height: 100vh;
}

/* Loading and Error States */
.loading-container, .error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
}

.loading-content, .error-card {
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  font-size: 3rem;
  color: #10b981;
  margin-bottom: 1rem;
}

.loading-text {
  color: #374151;
  font-size: 1.125rem;
  font-weight: 500;
}

.error-icon {
  font-size: 3rem;
  color: #ef4444;
  margin-bottom: 1rem;
}

.error-title {
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.error-text {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.retry-button {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.retry-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
}

/* Header Section */
.header-section {
  margin-bottom: 2rem;
}

.header-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
}

.header-title {
  color: white;
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.header-icon {
  color: #fbbf24;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
}

.stat-number {
  color: white;
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Timeline Section */
.timeline-section {
  margin-bottom: 2rem;
}

.timeline-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.section-title {
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  text-align: center;
}

.week-blocks-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.week-block {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
  position: relative;
}

.week-block:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.competition-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.week-number {
  font-size: 14px;
}

.competition-crown {
  font-size: 16px;
  color: #fbbf24;
}

/* Mesocycle Colors */
.mesocycle-1 { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
.mesocycle-2 { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); }
.mesocycle-3 { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
.mesocycle-4 { background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%); }
.mesocycle-5 { background: linear-gradient(135deg, #84cc16 0%, #65a30d 100%); }
.mesocycle-6 { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); }
.mesocycle-7 { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
.mesocycle-8 { background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); }
.mesocycle-9 { background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); }
.mesocycle-10 { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); }

.recovery-week {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.competition-week {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

/* Legend */
.legend-container {
  border-top: 1px solid #e5e7eb;
  padding-top: 1.5rem;
}

.legend-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.recovery-color {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.competition-legend {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.legend-text {
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Mesocycles Grid */
.mesocycles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.mesocycle-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.mesocycle-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.mesocycle-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.mesocycle-indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.mesocycle-title {
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0;
}

.mesocycle-weeks {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.mesocycle-section {
  margin-bottom: 1rem;
}

.mesocycle-section:last-child {
  margin-bottom: 0;
}

.section-subtitle {
  color: #374151;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.abilities-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.ability-badge {
  background: rgba(59, 130, 246, 0.1);
  color: #1d4ed8;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.methods-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.method-item {
  color: #4b5563;
  font-size: 0.875rem;
  padding: 0.25rem 0;
}

.method-groups-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.method-group-badge {
  background: rgba(16, 185, 129, 0.1);
  color: #047857;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.exercise-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.exercise-item {
  color: #4b5563;
  font-size: 0.875rem;
  padding: 0.25rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.exercise-count {
  color: #9ca3af;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Week Details Section */
.week-details-section {
  margin-bottom: 2rem;
}

.week-details-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.details-title {
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  text-align: center;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.details-column {
  background: rgba(249, 250, 251, 0.5);
  border-radius: 12px;
  padding: 1.5rem;
}

.details-subtitle {
  color: #374151;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.training-methods-detail {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.method-detail-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.method-detail-name {
  color: #1f2937;
  font-weight: 500;
}

.exercise-detail-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.exercise-detail-item {
  color: #4b5563;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(229, 231, 235, 0.5);
}

.exercise-detail-item:last-child {
  border-bottom: none;
}

.week-info-section {
  border-top: 1px solid #e5e7eb;
  padding-top: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-card {
  background: rgba(243, 244, 246, 0.5);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  color: #374151;
  font-size: 0.875rem;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .header-title {
    font-size: 2rem;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .week-blocks-container {
    gap: 0.5rem;
  }
  
  .week-block {
    width: 60px;
    height: 60px;
    font-size: 14px;
  }
  
  .mesocycles-grid {
    grid-template-columns: 1fr;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

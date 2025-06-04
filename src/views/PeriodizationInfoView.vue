<template>
  <div class="periodization-bg">
    <!-- Header -->
    <TrainerHeader 
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

    <!-- Main Content with Dashboard Container Width -->
    <div v-else class="dashboard-container container mx-auto px-4 py-4">
      <!-- Header Section -->
      <div class="header-section">
        <div class="header-card">
          <h1 class="header-title">
            <i class="fas fa-calendar header-icon"></i>NAČRT CIKLIZACIJE
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
          
          <!-- Week Blocks - NOW CLICKABLE -->
          <div class="week-blocks-container">
            <div 
              v-for="(week, index) in allWeeks" 
              :key="index"
              class="week-block"
              :class="getWeekBlockClass(week, index + 1)"
              @click="navigateToMicrocycle(week, index + 1)"
              :title="`Klikni za ogled mikrocikel ${week.microcycle?.id || 'N/A'}`"
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

    navigateToMicrocycle(week, weekNumber) {
    // Check if microcycle exists and has an ID
      if (!week.microcycle || !week.microcycle.id) {
        this.showAlert('error', 'Mikrocikel ID ni na voljo za ta teden.')
        return
      }

      // Navigate to microcycle route with dayOfWeek = 1
      const microcycleId = week.microcycle.id
      const dayOfWeek = 1 // Hardcoded to 1 as requested
      
      this.$router.push(`/trainer/microcycle/${microcycleId}/${dayOfWeek}`)
        .catch(err => {
          console.error('Navigation error:', err)
          this.showAlert('error', 'Napaka pri navigaciji na mikrocikel.')
        })
    },
    getWeekTooltip(week, weekNumber) {
      if (!week.microcycle || !week.microcycle.id) {
        return 'Mikrocikel ni na voljo'
      }
      
      if (weekNumber === this.totalWeeks) {
        return `Klikni za ogled mikrocikel ${week.microcycle.id} (Teden tekmovanja)`
      }
      
      if (week.isActiveRest) {
        return `Klikni za ogled mikrocikel ${week.microcycle.id} (Aktivni počitek)`
      }
      
      return `Klikni za ogled mikrocikel ${week.microcycle.id}`
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
        
        if (!periodizationId) {
          this.error = 'No periodization ID provided'
          return
        }

        const response = await axios.get(
          `${API_ENDPOINTS.LOGIN.replace('/auth/login', '')}/periodization-info/${periodizationId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )

        this.periodizationInfo = response.data.periodization_info
        
      } catch (error) {
        console.error('Error fetching periodization info:', error)
        
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
  cursor: pointer; /* Already there */
  transition: all 0.3s ease;
  user-select: none; /* Prevent text selection */
}

.week-block:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); /* Enhanced hover effect */
}
/* Main Background */
.periodization-bg {
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
}

/* Loading State */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.loading-content {
  text-align: center;
}

.loading-spinner {
  font-size: 3rem;
  color: white;
  margin-bottom: 1rem;
}

.loading-text {
  color: white;
  font-size: 1.25rem;
  margin: 0;
}

/* Error State */
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
}

.error-card {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
}

.error-icon {
  font-size: 3rem;
  color: #dc3545;
  margin-bottom: 1rem;
}

.error-title {
  margin-bottom: 1rem;
  color: #333;
}

.error-text {
  margin-bottom: 1.5rem;
  color: #666;
}

.retry-button {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background: #0056b3;
}

.button-icon {
  margin-right: 0.5rem;
}

/* Full Width Container - Same as TrainerHeader */
.full-width-container {
  width: 100%;
  padding: 1.5rem 2rem;
  max-width: none;
}

/* Header Section */
.header-section {
  margin-bottom: 2rem;
}

.header-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
  padding: 2rem;
  text-align: center;
  margin: 0 auto;
}

.header-title {
  color: white;
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 2rem;
}

.header-icon {
  margin-right: 1rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 0 auto;
}

.stat-card {
  background: rgba(255, 255, 255, 0.9);
  padding: 1.5rem;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #007bff;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #6c757d;
}

/* Timeline Section */
.timeline-section {
  margin-bottom: 2rem;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 2rem;
}

.timeline-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 1.5rem;
}

/* Week Blocks - Larger and ~10 per row */
.week-blocks-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 12px;
  margin-bottom: 1.5rem;
  margin-left: auto;
  margin-right: auto;
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
}

.week-block:hover {
  transform: scale(1.1);
}

.competition-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.week-number {
  font-size: 14px;
  line-height: 1;
}

.competition-crown {
  font-size: 12px;
  color: #ffc107;
  margin-top: 3px;
}

/* Week Colors */
.mesocycle-1 { background-color: #ff6b35; }
.mesocycle-2 { background-color: #4285f4; }
.mesocycle-3 { background-color: #9c27b0; }
.mesocycle-4 { background-color: #00bcd4; }
.mesocycle-5 { background-color: #4caf50; }
.mesocycle-6 { background-color: #ff9800; }
.mesocycle-7 { background-color: #f44336; }
.mesocycle-8 { background-color: #3f51b5; }
.mesocycle-9 { background-color: #e91e63; }
.mesocycle-10 { background-color: #009688; }
.mesocycle-11 { background-color: #795548; }
.mesocycle-12 { background-color: #607d8b; }
.mesocycle-13 { background-color: #8bc34a; }
.mesocycle-14 { background-color: #ffeb3b; color: #333; }
.mesocycle-15 { background-color: #cddc39; color: #333; }
.mesocycle-16 { background-color: #ffc107; color: #333; }
.mesocycle-17 { background-color: #ff5722; }
.mesocycle-18 { background-color: #673ab7; }
.mesocycle-19 { background-color: #2196f3; }
.mesocycle-20 { background-color: #ff4081; }

.recovery-week {
  background-color: #6c757d;
}

.competition-week {
  background-color: #6c757d;
  color: white;
}

/* Legend */
.legend-container {
  background: rgba(0, 0, 0, 0.05);
  padding: 1rem;
  border-radius: 8px;
}

.legend-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.recovery-color {
  background-color: #6c757d;
}

.competition-legend {
  background-color: #6c757d;
  position: relative;
}

.competition-legend::after {
  content: "👑";
  position: absolute;
  top: -2px;
  right: -2px;
  font-size: 8px;
}

.legend-text {
  font-size: 0.9rem;
  color: #555;
}

/* Mesocycles Grid - 3 Columns on Desktop */
.mesocycles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  margin-left: auto;
  margin-right: auto;
}

/* Desktop: Force 3 columns */
@media (min-width: 1200px) {
  .mesocycles-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 768px) and (max-width: 1199px) {
  .mesocycles-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.mesocycle-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  height: 100%;
}

.mesocycle-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.mesocycle-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.mesocycle-indicator {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  margin-right: 1rem;
}

.mesocycle-title {
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.25rem;
}

.mesocycle-weeks {
  font-size: 0.9rem;
  color: #6c757d;
  margin: 0;
}

.mesocycle-section {
  margin-bottom: 1rem;
}

.section-subtitle {
  font-weight: 600;
  color: #555;
  margin-bottom: 0.5rem;
}

/* Abilities */
.abilities-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.ability-badge {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

/* Training Methods List */
.methods-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.method-item {
  background: #f8f9fa;
  padding: 0.5rem;
  border-radius: 6px;
  font-weight: 500;
  color: #555;
  border-left: 4px solid #007bff;
}

/* Method Groups */
.method-groups-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.method-group-badge {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
}

/* Exercise List */
.exercise-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.exercise-item {
  color: #555;
  margin-bottom: 0.3rem;
  padding-left: 1rem;
  position: relative;
}

.exercise-item::before {
  content: "•";
  color: #007bff;
  position: absolute;
  left: 0;
}

.exercise-count {
  color: #6c757d;
  font-size: 0.8rem;
}

/* Week Details Section */
.week-details-section {
  margin-bottom: 2rem;
  margin-left: auto;
  margin-right: auto;
}

.week-details-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.details-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 1.5rem;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.details-column {
  display: flex;
  flex-direction: column;
}

.details-subtitle {
  font-weight: 600;
  color: #555;
  margin-bottom: 1rem;
}

.training-methods-detail {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.method-detail-card {
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.method-detail-name {
  font-weight: 500;
  color: #333;
}

.exercise-detail-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.exercise-detail-item {
  color: #555;
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
  position: relative;
}

.exercise-detail-item::before {
  content: "•";
  color: #28a745;
  position: absolute;
  left: 0;
  font-weight: bold;
}

/* Week Info Section */
.week-info-section {
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-card {
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 8px;
  border-left: 4px solid #28a745;
  font-size: 0.9rem;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .full-width-container {
    padding: 1rem;
  }
  
  .header-title {
    font-size: 1.8rem;
  }
  
  .stat-number {
    font-size: 2rem;
  }
  
  .week-blocks-container {
    grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  }
  
  .week-block {
    width: 60px;
    height: 60px;
    font-size: 14px;
  }
  
  .competition-crown {
    font-size: 10px;
  }
  
  .week-number {
    font-size: 12px;
  }
  
  .mesocycles-grid {
    grid-template-columns: 1fr;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>

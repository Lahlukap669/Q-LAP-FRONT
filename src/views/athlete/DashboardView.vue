<template>
  <div class="min-h-screen athlete-dashboard-bg">
    <!-- Header -->
    <AthleteHeader 
      :user-full-name="userFullName"
      @logout="logout"
    />

    <!-- Loading State -->
    <div v-if="loading && !headerMounted" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <i class="fas fa-spinner fa-spin text-4xl text-white mb-4"></i>
        <p class="text-white text-lg">Nalaganje dnevnih vaj...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error && !headerMounted" class="flex items-center justify-center min-h-screen">
      <div class="text-center bg-white rounded-xl p-8 mx-4">
        <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
        <h3 class="text-xl font-bold text-gray-800 mb-2">Napaka pri nalaganju vaj</h3>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button @click="fetchDayExercises" class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-200">
          <i class="fas fa-redo mr-2"></i>Poskusi ponovno
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="container mx-auto px-4 py-6">
      <!-- Exercise Date Header with Day Selection -->
      <div class="exercise-date-header rounded-xl p-6 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-6">
            <!-- Exercise Date -->
            <div class="flex items-center space-x-3">
              <i class="fas fa-calendar text-2xl text-white"></i>
              <h1 class="text-2xl font-bold text-white">{{ formattedExerciseDate }}</h1>
            </div>
            
            <!-- Day Selector -->
            <div class="flex items-center space-x-3">
              <button @click="previousDay()" class="nav-button">
                <i class="fas fa-chevron-left"></i>
              </button>
              
              <select 
                v-model="selectedDate" 
                @change="onDateChange"
                class="day-select-inline"
              >
                <option v-for="date in availableDates" :key="date.value" :value="date.value">
                  {{ date.label }}
                </option>
              </select>
              
              <button @click="nextDay()" class="nav-button">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
          
          <!-- Loading indicator for day changes -->
          <div v-if="loading && headerMounted" class="flex items-center text-white">
            <i class="fas fa-spinner fa-spin mr-2"></i>
            <span>Nalaganje...</span>
          </div>
        </div>
      </div>

      <!-- Rest Day Banner -->
      <div v-if="dayInfo?.active_rest" class="rest-day-banner rounded-xl p-6 mb-6">
        <div class="flex items-center">
          <i class="fas fa-bed text-2xl text-blue-600 mr-4"></i>
          <div>
            <h3 class="text-xl font-bold text-blue-800">Dan počitka</h3>
            <p class="text-blue-700">Danes je predviden aktivni počitek. Priporočamo lahke aktivnosti.</p>
          </div>
        </div>
      </div>

      <!-- No Exercises State -->
      <div v-if="(!dayInfo?.methods || dayInfo.methods.length === 0) && !dayInfo?.active_rest" class="no-exercises-state rounded-xl p-12 mb-6">
        <div class="text-center">
          <i class="fas fa-calendar-times text-6xl text-white/50 mb-4"></i>
          <h3 class="text-2xl font-bold text-white mb-2">Ni vaj na ta dan</h3>
          <p class="text-white/80">Za izbrani dan ni predvidena nobena vaja.</p>
        </div>
      </div>

      <!-- Exercises Table -->
      <div v-if="dayInfo?.methods && dayInfo.methods.length > 0" class="exercises-table rounded-xl overflow-hidden">
        <!-- Table Header -->
        <div class="table-header grid grid-cols-12 gap-4 p-4">
          <div class="col-span-1 text-center font-semibold text-white">KONČANO</div>
          <div class="col-span-3 text-center font-semibold text-white">VAJA</div>
          <div class="col-span-1 text-center font-semibold text-white">SERIJE</div>
          <div class="col-span-1 text-center font-semibold text-white">PONOVITVE</div>
          <div class="col-span-1 text-center font-semibold text-white">OBREMENITEV %</div>
          <div class="col-span-1 text-center font-semibold text-white">VO2 MAX</div>
          <div class="col-span-1 text-center font-semibold text-white">HR %</div>
          <div class="col-span-1 text-center font-semibold text-white">POČITEK</div>
          <div class="col-span-1 text-center font-semibold text-white">SKUPINA</div>
          <div class="col-span-1 text-center font-semibold text-white">OPIS</div>
        </div>

        <!-- Exercise Rows -->
        <div class="exercise-rows">
          <template v-for="method in dayInfo.methods" :key="method.method_id">
            <div 
              v-for="exercise in method.exercises" 
              :key="exercise.exercise_id"
              class="exercise-row grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/10 transition duration-200"
              :class="{ 'completed-exercise': exercise.exercise_finished }"
            >
              <!-- Checkbox -->
              <div class="col-span-1 flex justify-center">
                <input 
                  type="checkbox" 
                  :checked="exercise.exercise_finished"
                  @change="toggleExerciseCompletion(exercise)"
                  class="exercise-checkbox"
                >
              </div>

              <!-- Exercise Name with Info -->
              <div class="col-span-3 flex items-center space-x-2">
                <span class="exercise-name" :class="{ 'completed-text': exercise.exercise_finished }">
                  {{ exercise.exercise_name }}
                </span>
                <div class="difficulty-badge">
                  {{ exercise.difficulty }}/10
                </div>
              </div>

              <!-- Method Parameters -->
              <div class="col-span-1 text-center parameter-value">
                {{ method.method_parameters.sets || '/' }}
              </div>
              <div class="col-span-1 text-center parameter-value">
                {{ method.method_parameters.repetitions || '/' }}
              </div>
              <div class="col-span-1 text-center parameter-value">
                {{ method.method_parameters.burden_percentage_of_mvc ? method.method_parameters.burden_percentage_of_mvc + ' %' : '/' }}
              </div>
              <div class="col-span-1 text-center parameter-value">
                {{ method.method_parameters.vo2_max ? method.method_parameters.vo2_max + ' %' : '/' }}
              </div>
              <div class="col-span-1 text-center parameter-value">
                {{ method.method_parameters.hr_percentage ? method.method_parameters.hr_percentage + ' %' : '/' }}
              </div>
              <div class="col-span-1 text-center parameter-value">
                {{ formatRestTime(method.method_parameters.rest_seconds) }}
              </div>

              <!-- Method Group -->
              <div class="col-span-1 text-center">
                <span class="method-group-badge">{{ method.method_group }}</span>
              </div>

              <!-- Info Button -->
              <div class="col-span-1 flex justify-center">
                <button 
                  @click="showExerciseInfo(exercise)"
                  class="info-button"
                >
                  <i class="fas fa-info-circle"></i>
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Progress Summary and Save Button -->
      <div v-if="dayInfo?.methods && dayInfo.methods.length > 0" class="progress-summary rounded-xl p-6 mt-6">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">Napredek za danes</h3>
            <p class="text-gray-600">Končano {{ completedExercisesCount }} od {{ totalExercisesCount }} vaj</p>
            <p v-if="hasUnsavedChanges" class="text-orange-600 text-sm mt-1">
              <i class="fas fa-exclamation-triangle mr-1"></i>
              Imate neshranjene spremembe
            </p>
          </div>
          <div class="flex items-center space-x-4">
            <!-- Progress Circle -->
            <div class="progress-circle">
              <div class="circle-progress" :style="{ 'stroke-dasharray': `${progressPercentage}, 100` }">
                <svg viewBox="0 0 36 36" class="circular-chart">
                  <path class="circle-bg" d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"/>
                  <path class="circle" :stroke-dasharray="`${progressPercentage}, 100`" d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"/>
                </svg>
                <div class="percentage">{{ Math.round(progressPercentage) }}%</div>
              </div>
            </div>
            
            <!-- Save Button -->
            <button 
              @click="saveExerciseChanges"
              :disabled="!hasUnsavedChanges || saving"
              class="save-button"
              :class="{ 'disabled': !hasUnsavedChanges || saving }"
            >
              <i v-if="saving" class="fas fa-spinner fa-spin mr-2"></i>
              <i v-else class="fas fa-save mr-2"></i>
              {{ saving ? 'Shranjujem...' : 'Shrani spremembe' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Exercise Info Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="modal-content max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-start mb-4">
          <h1 class="modal-title">{{ selectedExercise.exercise_name }}</h1>
          <button @click="closeModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="exercise-details">
          <div class="detail-row">
            <span class="detail-label">Težavnost:</span>
            <span class="detail-value">{{ selectedExercise.difficulty }}/10</span>
          </div>
          <div class="detail-row" v-if="selectedExercise.video_url && selectedExercise.video_url !== '/'">
            <span class="detail-label">Video:</span>
            <a :href="selectedExercise.video_url" target="_blank" class="detail-link">Oglej si video</a>
          </div>
        </div>

        <div class="exercise-description">
          <h3 class="description-title">Opis</h3>
          <p class="description-text">{{ selectedExercise.description }}</p>
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
  name: 'DashboardView',
  components: {
    AthleteHeader,
    AppAlert
  },
  data() {
    return {
      loading: true,
      saving: false,
      error: null,
      dayInfo: null,
      originalExerciseStatus: {}, // Track original status for changes
      selectedDate: this.getCurrentDate(),
      showModal: false,
      selectedExercise: {},
      headerMounted: false,
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
    formattedExerciseDate() {
      if (!this.selectedDate) {
        return 'Ni datuma'
      }
      
      const date = new Date(this.selectedDate)
      return date.toLocaleDateString('sl-SI', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    availableDates() {
      const dates = []
      const today = new Date()
      
      // Generate dates for 7 days back and 7 days forward
      for (let i = -7; i <= 7; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        
        const value = date.toISOString().split('T')[0]
        const label = date.toLocaleDateString('sl-SI', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        })
        
        dates.push({ value, label })
      }
      
      return dates
    },
    totalExercisesCount() {
      if (!this.dayInfo?.methods) return 0
      return this.dayInfo.methods.reduce((total, method) => {
        return total + (method.exercises?.length || 0)
      }, 0)
    },
    completedExercisesCount() {
      if (!this.dayInfo?.methods) return 0
      return this.dayInfo.methods.reduce((total, method) => {
        return total + (method.exercises?.filter(ex => ex.exercise_finished).length || 0)
      }, 0)
    },
    progressPercentage() {
      if (this.totalExercisesCount === 0) return 0
      return (this.completedExercisesCount / this.totalExercisesCount) * 100
    },
    hasUnsavedChanges() {
      if (!this.dayInfo?.methods) return false
      
      // Check if any exercise status has changed from original
      for (const method of this.dayInfo.methods) {
        for (const exercise of method.exercises) {
          const original = this.originalExerciseStatus[exercise.exercise_id]
          if (original !== undefined && original !== exercise.exercise_finished) {
            return true
          }
        }
      }
      return false
    }
  },
  methods: {
    getCurrentDate() {
        return new Date().toISOString().split('T')[0]
    },
    
    showAlert(type, message) {
      this.alert = {
        show: true,
        type: type,
        message: message
      }
    },
    
    async fetchDayExercises() {
      if (!this.headerMounted) {
        this.loading = true
      }
      this.error = null
      
      try {
        console.log(this.selectedDate)
        const response = await apiClient.post('/users/athlete/microcycle-info', {
          current_date: this.selectedDate
        })
        console.log(this.selectedDate)

        this.dayInfo = response.data
        
        // Store original exercise status for change tracking
        this.storeOriginalExerciseStatus()
        
        if (!this.headerMounted) {
          this.headerMounted = true
        }
        
      } catch (error) {
        console.error('Napaka pri pridobivanju vaj:', error)
        
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('user')
          this.$router.push('/login')
        } else {
          this.error = error.response?.data?.message || 'Napaka pri nalaganju vaj za ta dan.'
          // Set dayInfo to null on error so "Ni vaj na ta dan" shows
          this.dayInfo = null
        }
      } finally {
        this.loading = false
      }
    },

    storeOriginalExerciseStatus() {
      this.originalExerciseStatus = {}
      if (this.dayInfo?.methods) {
        this.dayInfo.methods.forEach(method => {
          method.exercises.forEach(exercise => {
            this.originalExerciseStatus[exercise.exercise_id] = exercise.exercise_finished
          })
        })
      }
    },

    onDateChange() {
      this.loading = true
      this.fetchDayExercises()
    },

    previousDay() {
      const currentDate = new Date(this.selectedDate)
      currentDate.setDate(currentDate.getDate() - 1)
      this.selectedDate = currentDate.toISOString().split('T')[0]
      this.loading = true
      this.fetchDayExercises()
    },

    nextDay() {
      const currentDate = new Date(this.selectedDate)
      currentDate.setDate(currentDate.getDate() + 1)
      this.selectedDate = currentDate.toISOString().split('T')[0]
      this.loading = true
      this.fetchDayExercises()
    },

    toggleExerciseCompletion(exercise) {
      // Simply toggle the status without showing alert
      exercise.exercise_finished = !exercise.exercise_finished
    },

    async saveExerciseChanges() {
      if (!this.dayInfo || !this.hasUnsavedChanges) return
      
      this.saving = true
      
      try {
        // Prepare exercises status array
        const exercisesStatus = []
        
        this.dayInfo.methods.forEach(method => {
          method.exercises.forEach(exercise => {
            exercisesStatus.push({
              exercise_id: exercise.exercise_id,
              finished: exercise.exercise_finished
            })
          })
        })

        const payload = {
          microcycle_id: this.dayInfo.microcycle_id,
          day_of_week_number: this.dayInfo.day_of_week_number,
          exercises_status: exercisesStatus
        }

        const response = await apiClient.post('/users/athlete/save-finished-exercises', payload)
        
        // Show success message
        this.showAlert('success', response.data.message || 'Spremembe uspešno shranjene')
        
        // Update original status to current status (changes are now saved)
        this.storeOriginalExerciseStatus()
        
        // Handle partial success or failed exercises
        if (response.data.failed_exercises && response.data.failed_exercises.length > 0) {
          console.warn('Nekatere vaje niso bile posodobljene:', response.data.failed_exercises)
          this.showAlert('warning', 'Nekatere vaje niso bile posodobljene')
        }
        
      } catch (error) {
        console.error('Napaka pri shranjevanju sprememb:', error)
        this.showAlert('error', error.response?.data?.message || 'Napaka pri shranjevanju sprememb.')
      } finally {
        this.saving = false
      }
    },

    showExerciseInfo(exercise) {
      this.selectedExercise = exercise
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.selectedExercise = {}
    },

    formatRestTime(seconds) {
      if (!seconds) return '/'
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      
      if (minutes === 0) {
        return `${remainingSeconds} s`
      } else if (remainingSeconds === 0) {
        return `${minutes} min`
      } else {
        return `${minutes} min ${remainingSeconds} s`
      }
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
    
    this.fetchDayExercises()
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.previousDay()
      } else if (e.key === 'ArrowRight') {
        this.nextDay()
      } else if (e.key === 'Escape') {
        this.closeModal()
      }
    })
  },

  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeydown)
  }
}
</script>

<style scoped>
/* Main Background */
.athlete-dashboard-bg {
  background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
  min-height: 100vh;
}

/* Exercise Date Header */
.exercise-date-header {
  background: #10b981;
  backdrop-filter: blur(10px);
}

/* Rest Day Banner */
.rest-day-banner {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  backdrop-filter: blur(10px);
}

/* No Exercises State */
.no-exercises-state {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Navigation Buttons */
.nav-button {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.nav-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

/* Day Selector */
.day-select-inline {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  color: #1f2937;
  font-weight: 500;
  min-width: 150px;
  transition: all 0.2s ease;
}

.day-select-inline:focus {
  outline: none;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

/* Exercises Table */
.exercises-table {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.table-header {
  background: #10b981;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.exercise-row {
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.exercise-row:last-child {
  border-bottom: none;
}

.completed-exercise {
  background: rgba(16, 185, 129, 0.1) !important;
  border-left: 4px solid #10b981;
}

/* Exercise Elements */
.exercise-checkbox {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.exercise-checkbox:checked {
  background: #10b981;
  border-color: #10b981;
}

.exercise-name {
  color: white;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s ease;
}

.completed-text {
  text-decoration: line-through;
  opacity: 0.7;
}

.difficulty-badge {
  background: rgba(245, 158, 11, 0.8);
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
}

.info-button {
  width: 24px;
  height: 24px;
  background: rgba(59, 130, 246, 0.8);
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.info-button:hover {
  background: #3b82f6;
  transform: scale(1.1);
}

.parameter-value {
  color: white;
  font-weight: 500;
  font-size: 14px;
}

.method-group-badge {
  background: rgba(16, 185, 129, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

/* Progress Summary */
.progress-summary {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.progress-circle {
  position: relative;
  width: 80px;
  height: 80px;
}

.circular-chart {
  width: 100%;
  height: 100%;
}

.circle-bg {
  fill: none;
  stroke: #eee;
  stroke-width: 3.8;
}

.circle {
  fill: none;
  stroke: #10b981;
  stroke-width: 2.8;
  stroke-linecap: round;
  animation: progress 1s ease-out forwards;
}

.percentage {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 14px;
  font-weight: bold;
  color: #10b981;
}

/* Save Button */
.save-button {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.save-button:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.save-button.disabled {
  background: #9ca3af;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

/* Modal */
.modal-content {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-title {
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 16px;
}

.modal-close {
  width: 32px;
  height: 32px;
  background: #f3f4f6;
  border-radius: 8px;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #e5e7eb;
  color: #374151;
}

.exercise-details {
  margin-bottom: 24px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: #374151;
}

.detail-value {
  color: #6b7280;
}

.detail-link {
  color: #3b82f6;
  text-decoration: underline;
}

.detail-link:hover {
  color: #1d4ed8;
}

.description-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
}

.description-text {
  color: #4b5563;
  line-height: 1.6;
  white-space: pre-wrap;
}

/* Animations */
@keyframes progress {
  0% {
    stroke-dasharray: 0 100;
  }
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .exercise-date-header .flex {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .exercises-table {
    overflow-x: auto;
  }
  
  .table-header,
  .exercise-row {
    min-width: 800px;
  }
  
  .day-select-inline {
    width: 100%;
  }
  
  .progress-summary .flex {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
}
</style>

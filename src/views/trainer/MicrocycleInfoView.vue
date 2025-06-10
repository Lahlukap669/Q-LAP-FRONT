<template>
  <div class="min-h-screen microcycle-bg">
    <!-- Header -->
    <TrainerHeader 
      :user-full-name="userFullName"
      @logout="logout"
    />

    <!-- Loading State -->
    <div v-if="loading && !headerMounted" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <i class="fas fa-spinner fa-spin text-4xl text-white mb-4"></i>
        <p class="text-white text-lg">Nalaganje mikrocikla...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error && !headerMounted" class="flex items-center justify-center min-h-screen">
      <div class="text-center bg-white rounded-xl p-8 mx-4">
        <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
        <h3 class="text-xl font-bold text-gray-800 mb-2">Napaka pri nalaganju mikrocikla</h3>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button @click="fetchMicrocycleInfo" class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-200">
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
              <button @click="previousDay()" :disabled="selectedDayOfWeek <= 1" class="nav-button" :class="{ 'opacity-50 cursor-not-allowed': selectedDayOfWeek <= 1 }">
                <i class="fas fa-chevron-left"></i>
              </button>
              
              <select 
                v-model="selectedDayOfWeek" 
                @change="onDayChange"
                class="day-select-inline"
              >
                <option value="1">Ponedeljek</option>
                <option value="2">Torek</option>
                <option value="3">Sreda</option>
                <option value="4">Četrtek</option>
                <option value="5">Petek</option>
                <option value="6">Sobota</option>
                <option value="7">Nedelja</option>
              </select>
              
              <button @click="nextDay()" :disabled="selectedDayOfWeek >= 7" class="nav-button" :class="{ 'opacity-50 cursor-not-allowed': selectedDayOfWeek >= 7 }">
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

      <!-- Exercises Table -->
      <div class="exercises-table rounded-xl overflow-hidden">
        <!-- Table Header -->
        <div class="table-header grid grid-cols-12 gap-4 p-4">
          <div class="col-span-1"></div>
          <div class="col-span-3 text-center font-semibold text-white">VAJA</div>
          <div class="col-span-1 text-center font-semibold text-white">SERIJE</div>
          <div class="col-span-1 text-center font-semibold text-white">PONOVITVE</div>
          <div class="col-span-1 text-center font-semibold text-white">OBREMENITEV %</div>
          <div class="col-span-1 text-center font-semibold text-white">VO2 MAX</div>
          <div class="col-span-1 text-center font-semibold text-white">HR %</div>
          <div class="col-span-1 text-center font-semibold text-white">POČITEK</div>
          <div class="col-span-1 text-center font-semibold text-white">SKUPINA</div>
          <div class="col-span-1 text-center font-semibold text-white">UREDI</div>
        </div>

        <!-- Exercise Rows -->
        <div class="exercise-rows">
          <template v-for="method in microcycleInfo?.methods || []" :key="method.method_id">
            <div 
              v-for="exercise in method.exercises" 
              :key="exercise.exercise_id"
              class="exercise-row grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/10 transition duration-200"
            >
              <!-- Checkbox -->
              <div class="col-span-1 flex justify-center">
                <input 
                  type="checkbox" 
                  :checked="exercise.exercise_finished"
                  class="exercise-checkbox"
                  disabled>
              </div>

              <!-- Exercise Name with Info -->
              <div class="col-span-3 flex items-center space-x-2">
                <span class="exercise-name">{{ exercise.exercise_name }}</span>
                <button 
                  @click="showExerciseInfo(exercise)"
                  class="info-button"
                >
                  <i class="fas fa-info-circle"></i>
                </button>
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
                {{ ((Math.floor(method.method_parameters.rest_seconds/60)!==0) ? Math.floor(method.method_parameters.rest_seconds/60) + ' min ' : '') + ((method.method_parameters.rest_seconds % 60 !== 0) ? method.method_parameters.rest_seconds%60 + ' s' : '')  || '/' }}
              </div>

              <!-- Method Group -->
              <div class="col-span-1 text-center">
                <span class="method-group-badge">{{ method.method_group }}</span>
              </div>

              <!-- Edit Button -->
              <div class="col-span-1 flex justify-center">
                <button 
                  @click="editExercise(exercise)"
                  class="edit-button"
                >
                  <i class="fas fa-edit"></i>
                </button>
              </div>
            </div>
          </template>
        </div>

        <!-- Empty State -->
        <div v-if="!microcycleInfo?.methods || microcycleInfo.methods.length === 0" class="empty-state">
          <div class="text-center py-12">
            <i class="fas fa-dumbbell text-4xl text-white/50 mb-4"></i>
            <h3 class="text-xl font-bold text-white mb-2">Na vaj.</h3>
            <p class="text-white/80">Na ta dan ni predvidena nobena vaja.</p>
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
          <div class="detail-row">
            <span class="detail-label">Video:</span>
            <span class="detail-value">{{ selectedExercise.video_url !== '/' ? 'Available' : 'Not Available' }}</span>
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
import { apiClient, API_ENDPOINTS } from '@/utils/api.js'
import TrainerHeader from '@/components/layout/TrainerHeader.vue'
import AppAlert from '@/components/ui/AppAlert.vue'

export default {
  name: 'MicrocycleInfoView',
  components: {
    TrainerHeader,
    AppAlert
  },
  data() {
    return {
      loading: true,
      error: null,
      microcycleInfo: null,
      selectedDayOfWeek: 1,
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
      return `${user.first_name} ${user.last_name}` || 'Trainer'
    },
    microcycleId() {
      return this.$route.params.microcycleId
    },
    formattedExerciseDate() {
      if (!this.microcycleInfo?.methods || this.microcycleInfo.methods.length === 0) {
        return 'Ni datuma'
      }
      
      // Get the exercise date from the first exercise
      const firstMethod = this.microcycleInfo.methods[0]
      if (firstMethod.exercises && firstMethod.exercises.length > 0) {
        const exerciseDate = new Date(firstMethod.exercises[0].exercise_date)
        return exerciseDate.toLocaleDateString('sl-SI', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }
      
      return 'No Date'
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
    
    async fetchMicrocycleInfo() {
      // Don't show full loading screen if header is already mounted
      if (!this.headerMounted) {
        this.loading = true
      }
      this.error = null
      
      try {
        // No manual token handling needed!
        const response = await apiClient.get(`/users/trainer/microcycle-info/${this.microcycleId}/${this.selectedDayOfWeek}`)

        this.microcycleInfo = response.data.microcycle_info
        
        // Mark header as mounted after first successful fetch
        if (!this.headerMounted) {
          this.headerMounted = true
        }
        
      } catch (error) {
        console.error('Napaka pri pridobivanju mikrocikla:', error)
        
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('user')
          this.$router.push('/login')
        } else {
          this.error = error.response?.data?.message || 'Napaka pri nalaganju informacij o mikrociklu.'
        }
      } finally {
        this.loading = false
      }
    },

    onDayChange() {
      this.loading = true
      this.fetchMicrocycleInfo()
    },

    previousDay() {
      if (this.selectedDayOfWeek > 1) {
        this.selectedDayOfWeek = this.selectedDayOfWeek - 1
        this.loading = true
        this.fetchMicrocycleInfo()
      }
    },

    nextDay() {
      if (this.selectedDayOfWeek < 7) {
        this.selectedDayOfWeek = this.selectedDayOfWeek + 1
        this.loading = true
        this.fetchMicrocycleInfo()
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

    editExercise(exercise) {
      // Navigate to edit exercise page or open edit modal
      this.showAlert('Info', 'Funkcionalnost za urejanje bo narejena v kratkem.')
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
    
    // Set initial day from route params if available
    if (this.$route.params.dayOfWeek) {
      this.selectedDayOfWeek = parseInt(this.$route.params.dayOfWeek)
    }
    
    this.fetchMicrocycleInfo()
  }
}
</script>

<style scoped>
/* Main Background */
.microcycle-bg {
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
  min-height: 100vh;
}

/* Exercise Date Header */
.exercise-date-header {
  background: #10b981;
  backdrop-filter: blur(10px);
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

.nav-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.nav-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Inline Day Selector */
.day-select-inline {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  color: #1f2937;
  font-weight: 500;
  min-width: 120px;
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
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
}

.exercise-row:last-child {
  border-bottom: none;
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

.edit-button {
  width: 32px;
  height: 32px;
  background: rgba(245, 158, 11, 0.8);
  border-radius: 6px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.edit-button:hover {
  background: #f59e0b;
  transform: translateY(-1px);
}

/* Empty State */
.empty-state {
  background: rgba(255, 255, 255, 0.05);
  margin: 1px;
  border-radius: 15px;
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

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .exercise-date-header .flex {
    flex-direction: column;
    align-items: flex-start;
    space-y: 4;
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
}
</style>

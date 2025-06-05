<template>
  <div class="min-h-screen test-bg">
    <!-- Header -->
    <TrainerHeader 
      :user-full-name="userFullName"
      @logout="logout"
    />

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <i class="fas fa-spinner fa-spin text-4xl text-white mb-4"></i>
        <p class="text-white text-lg">Loading test exercises...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="text-center bg-white rounded-xl p-8 mx-4">
        <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
        <h3 class="text-xl font-bold text-gray-800 mb-2">Error Loading Test Exercises</h3>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button @click="fetchTestExercises" class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-200">
          <i class="fas fa-redo mr-2"></i>Try Again
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="container mx-auto px-4 py-6">
      <!-- Page Header with Dropdowns -->
      <div class="test-header rounded-xl p-6 mb-6">
        <div class="flex items-center justify-between">
          <!-- Left: Title -->
          <div>
            <h1 class="text-3xl font-bold text-white mb-2">
              <i class="fas fa-clipboard-list mr-3"></i>CREATE TEST
            </h1>
            <p class="text-white/90">Enter test results for each exercise</p>
          </div>
          
          <!-- Right: Date and Athlete Dropdowns -->
          <div class="flex items-center space-x-4">
            <!-- Date Picker -->
            <div class="dropdown-container">
              <label class="dropdown-label">Test Date:</label>
              <input 
                type="date" 
                v-model="testForm.test_date"
                class="header-input date-input"
              >
            </div>
            
            <!-- Athlete Selector -->
            <div class="dropdown-container">
              <label class="dropdown-label">Select Athlete:</label>
              <select 
                v-model="testForm.athlete_id"
                class="header-input athlete-select"
              >
                <option value="">Choose athlete...</option>
                <option 
                  v-for="athlete in athletes" 
                  :key="athlete.id" 
                  :value="athlete.id"
                >
                  {{ athlete.first_name }} {{ athlete.last_name }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Test Exercises Table -->
      <div class="exercises-table rounded-xl overflow-hidden">
        <!-- Table Header -->
        <div class="table-header grid grid-cols-12 gap-4 p-4">
          <div class="col-span-6 text-left font-semibold text-white">EXERCISE</div>
          <div class="col-span-3 text-center font-semibold text-white">VALUE</div>
          <div class="col-span-2 text-center font-semibold text-white">UNIT</div>
          <div class="col-span-1 text-center font-semibold text-white">INFO</div>
        </div>

        <!-- Exercise Rows -->
        <div class="exercise-rows">
          <template v-for="(ability, abilityIdx) in testExercises" :key="'ability-' + abilityIdx">
            <!-- Motor Ability Title -->
            <div class="motor-ability-row">
              <div class="motor-ability-title">
                {{ ability.motor_ability }}
              </div>
            </div>
            
            <template v-for="(group, groupIdx) in ability.method_groups" :key="'group-' + abilityIdx + '-' + groupIdx">
              <!-- Method Group Title -->
              <div class="method-group-row">
                <div class="method-group-title">
                  {{ group.method_group }}
                </div>
              </div>
              
              <!-- Exercises -->
              <div 
                v-for="exercise in group.exercises" 
                :key="exercise.id"
                class="exercise-row grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/10 transition duration-200"
              >
                <!-- Exercise Name -->
                <div class="col-span-6 flex items-center">
                  <span class="exercise-name">{{ exercise.exercise }}</span>
                </div>

                <!-- Value Input -->
                <div class="col-span-3 flex justify-center">
                  <input 
                    type="number" 
                    step="0.01"
                    v-model="exerciseValues[exercise.id].value"
                    placeholder="Enter value"
                    class="value-input"
                  >
                </div>

                <!-- Unit Input -->
                <div class="col-span-2 flex justify-center">
                  <select 
                    v-model="exerciseValues[exercise.id].unit"
                    class="unit-select"
                  >
                    <option value="">Unit</option>
                    <option value="m">m</option>
                    <option value="cm">cm</option>
                    <option value="s">s</option>
                    <option value="kg">kg</option>
                  </select>
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
          </template>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex space-x-4 justify-center mt-6">
        <button 
          @click="saveTestResults"
          :disabled="!isFormValid"
          class="save-btn px-8 py-4 rounded-xl font-bold text-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i class="fas fa-save mr-2"></i>SAVE TEST RESULTS
        </button>
        
        <button 
          @click="clearAllValues"
          class="clear-btn px-8 py-4 rounded-xl font-bold text-lg transition duration-300"
        >
          <i class="fas fa-eraser mr-2"></i>CLEAR ALL
        </button>
      </div>
    </div>

    <!-- Exercise Info Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="modal-content max-w-2xl w-full">
        <div class="flex justify-between items-start mb-4">
          <h1 class="modal-title">{{ selectedExercise.exercise }}</h1>
          <button @click="closeModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <p class="description-text">{{ selectedExercise.description }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { API_ENDPOINTS } from '@/utils/api.js'
import TrainerHeader from '@/components/layout/TrainerHeader.vue'

export default {
  name: 'CreateTestView',
  components: {
    TrainerHeader
  },
  data() {
    return {
      loading: true,
      error: null,
      testExercises: [],
      athletes: [],
      exerciseValues: {},
      showModal: false,
      selectedExercise: {},
      testForm: {
        test_date: new Date().toISOString().split('T')[0], // Today's date
        athlete_id: ''
      }
    }
  },
  computed: {
    userFullName() {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return `${user.first_name} ${user.last_name}` || 'Trainer'
    },
    isFormValid() {
      return this.testForm.test_date && 
             this.testForm.athlete_id && 
             Object.values(this.exerciseValues).some(exercise => 
               exercise.value && exercise.unit
             )
    }
  },
  methods: {
    async fetchAthletes() {
      try {
        const token = localStorage.getItem('access_token')
        const response = await axios.get(
          `${API_ENDPOINTS.LOGIN.replace('/auth/login', '')}/users/trainer/my-athletes`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )
        this.athletes = response.data.athletes || []
      } catch (error) {
        console.error('Error fetching athletes:', error)
      }
    },

    async fetchTestExercises() {
      this.loading = true
      this.error = null
      
      try {
        const token = localStorage.getItem('access_token')
        const response = await axios.get(
          `${API_ENDPOINTS.LOGIN.replace('/auth/login', '')}/users/trainer/get-test-exercises`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )

        this.testExercises = response.data.data || []
        this.initializeExerciseValues()
        
      } catch (error) {
        console.error('Error:', error)
        this.error = 'Failed to load test exercises'
      } finally {
        this.loading = false
      }
    },

    initializeExerciseValues() {
      const values = {}
      this.testExercises.forEach(ability => {
        ability.method_groups.forEach(group => {
          group.exercises.forEach(exercise => {
            values[exercise.id] = { value: '', unit: '' }
          })
        })
      })
      this.exerciseValues = values
    },

    showExerciseInfo(exercise) {
      this.selectedExercise = exercise
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
    },

    clearAllValues() {
      this.initializeExerciseValues()
    },

    async saveTestResults() {
        // Validate form
        if (!this.testForm.athlete_id || !this.testForm.test_date) {
            alert('Please select an athlete and test date')
            return
        }

        // Filter and format exercises - only include exercises with both measure and unit
        const validExercises = Object.entries(this.exerciseValues)
            .filter(([_, data]) => data.value && data.unit) // Only exercises with both value and unit
            .map(([exerciseId, data]) => ({
            exercise_id: parseInt(exerciseId),
            measure: parseFloat(data.value),
            unit: data.unit
            }))

        if (validExercises.length === 0) {
            alert('Please enter at least one exercise with both value and unit')
            return
        }

        // Prepare payload according to API specification
        const payload = {
            athlete_id: parseInt(this.testForm.athlete_id),
            date: this.testForm.test_date,
            exercises: validExercises
        }

        this.loading = true

        try {
            const token = localStorage.getItem('access_token')
            if (!token) {
            this.$router.push('/login')
            return
            }

            console.log('Creating test with payload:', payload)

            const response = await axios.post(
            `${API_ENDPOINTS.LOGIN.replace('/auth/login', '')}/users/trainer/create-test`,
            payload,
            {
                headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
                }
            }
            )

            // Show success message from response
            alert(response.data.message || 'Test created successfully')
            
            // Clear form and redirect
            this.clearAllValues()
            this.testForm = {
            test_date: new Date().toISOString().split('T')[0],
            athlete_id: ''
            }
            
            // Optionally redirect to dashboard
            setTimeout(() => {
            this.$router.push('/trainer/tests')
            }, 1500)

        } catch (error) {
            console.error('Error creating test:', error)
            
            if (error.response?.status === 401) {
            localStorage.removeItem('access_token')
            localStorage.removeItem('user')
            this.$router.push('/login')
            } else {
            const errorMessage = error.response?.data?.message || 'Failed to create test'
            alert(errorMessage)
            }
        } finally {
            this.loading = false
        }
        },


    logout() {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      this.$router.push('/login')
    }
  },
  
  mounted() {
    this.fetchAthletes()
    this.fetchTestExercises()
  }
}
</script>

<style scoped>
.test-bg {
  background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
  min-height: 100vh;
}

.test-header {
  background: #10b981;
}

/* Header Dropdowns */
.dropdown-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.dropdown-label {
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  white-space: nowrap;
}

.header-input {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.95);
  color: #1f2937;
  font-weight: 500;
  transition: all 0.2s ease;
}

.header-input:focus {
  outline: none;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.date-input {
  min-width: 150px;
}

.athlete-select {
  min-width: 200px;
}

.exercises-table {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
}

.table-header {
  background: #10b981;
}

.motor-ability-row {
  background: #3b82f6;
  padding: 16px 24px;
}

.motor-ability-title {
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
}

.method-group-row {
  background: rgba(59, 130, 246, 0.7);
  padding: 12px 24px 12px 48px;
}

.method-group-title {
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
}

.exercise-row {
  background: rgba(255, 255, 255, 0.05);
  padding-left: 64px;
}

.exercise-name {
  color: white;
  font-weight: 500;
}

.value-input, .unit-select {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.9);
}

.info-button {
  width: 32px;
  height: 32px;
  background: #3b82f6;
  border-radius: 50%;
  color: white;
  border: none;
  cursor: pointer;
}

.save-btn {
  background: #10b981;
  color: white;
}

.clear-btn {
  background: #ef4444;
  color: white;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 24px;
}

.modal-title {
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
}

.modal-close {
  width: 32px;
  height: 32px;
  background: #f3f4f6;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .test-header .flex {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .test-header .flex > div:last-child {
    margin-top: 1rem;
    width: 100%;
  }
  
  .dropdown-container {
    align-items: flex-start;
    width: 100%;
  }
  
  .header-input {
    width: 100%;
  }
}
</style>

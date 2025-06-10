<template>
  <div class="min-h-screen content-bg">
    <!-- Header -->
    <TrainerHeader 
      :user-full-name="userFullName"
      @logout="logout"
    />

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-6">
      <!-- Page Title -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">
          <i class="fas fa-plus-circle mr-3"></i>USTVARI CIKLIZACIJO
        </h1>
      </div>

      <!-- Form Sections -->
      <div class="space-y-6">
        <!-- Basic Information -->
        <div class="form-section rounded-xl p-6">
          <h3 class="section-title text-xl font-bold text-gray-800 mb-4">Osnovne informacije</h3>
          
          <!-- Periodization Name -->
          <div class="mb-6">
            <label class="block text-gray-700 font-medium mb-2">
              <i class="fas fa-tag mr-2 text-blue-500"></i>Ime ciklizacije
            </label>
            <input 
              type="text" 
              v-model="form.periodization_name"
              placeholder="Vnesi ime ciklizacije..."
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            >
          </div>

          <!-- Difficulty Slider -->
          <div class="mb-6">
            <label class="block text-gray-700 font-medium mb-2">
              <i class="fas fa-signal mr-2 text-blue-500"></i>Težavnost (1-10)
            </label>
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-600">1</span>
              <input 
                type="range" 
                v-model="form.difficulty"
                min="1" 
                max="10" 
                class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              >
              <span class="text-sm text-gray-600">10</span>
              <div class="bg-blue-500 text-white px-3 py-1 rounded-lg font-bold min-w-[3rem] text-center">
                {{ form.difficulty }}
              </div>
            </div>
          </div>
        </div>

        <!-- Mesocycles Configuration -->
        <div class="form-section rounded-xl p-6">
          <h3 class="section-title text-xl font-bold text-gray-800 mb-4">Konfiguracija mezociklov</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
            <div v-for="(weeks, index) in form.mesocycle_lengths" :key="index" class="text-center relative">
              <label class="block text-gray-700 font-medium mb-2">Mezocikel {{ index + 1 }}</label>
              <input 
                type="number" 
                v-model="form.mesocycle_lengths[index]"
                min="1" 
                max="12"
                class="w-full px-4 py-3 text-center rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              >
              <!-- Remove Button -->
              <button 
                v-if="form.mesocycle_lengths.length > 3"
                @click="removeMesocycle(index)"
                class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition duration-200"
              >
                ×
              </button>
            </div>
          </div>

          <div class="text-center">
            <button 
              @click="addMesocycle"
              :disabled="form.mesocycle_lengths.length >= 20"
              class="add-mesocycle-btn px-6 py-3 rounded-lg font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="fas fa-plus mr-2"></i>Dodaj mezocikel
            </button>
          </div>
        </div>

        <!-- Competition & Athlete -->
        <div class="form-section rounded-xl p-6">
          <h3 class="section-title text-xl font-bold text-gray-800 mb-4">Športnik in tekmovanje</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Competition Date -->
            <div>
              <label class="block text-gray-700 font-medium mb-2">
                <i class="fas fa-calendar mr-2 text-blue-500"></i>Dan tekmovanja
              </label>
              <input 
                type="date" 
                v-model="form.competition_date"
                class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              >
            </div>

            <!-- Select Athlete -->
            <div>
              <label class="block text-gray-700 font-medium mb-2">Izberi športnika</label>
              <select 
                v-model="form.athlete_id"
                class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              >
                <option value="">Izberi športnika...</option>
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

        <!-- Training Methods Selection -->
        <div class="form-section rounded-xl p-6">
          <h3 class="section-title text-xl font-bold text-gray-800 mb-4">Izbira metod treninga</h3>
          <p class="text-gray-600 mb-4">Izberi 1 metodo na gibalno sposobnost, maksimalno 3 gibalne sposobnosti.</p>

          <div class="overflow-x-auto">
            <table class="w-full border border-gray-300 rounded-lg overflow-hidden">
              <thead>
                <tr class="methods-header">
                  <th class="p-3 text-left font-semibold">Metode</th>
                  <th 
                    v-for="(_, index) in form.mesocycle_lengths" 
                    :key="index"
                    class="p-3 text-center font-semibold"
                  >
                    Mezo {{ index + 1 }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(ability, abilityIdx) in trainingMethods" :key="'ability-' + abilityIdx">
                  <!-- Motor Ability Title -->
                  <tr>
                    <td :colspan="form.mesocycle_lengths.length + 1" class="bg-blue-50 font-bold text-2xl py-4 text-blue-900">
                      {{ ability.motor_ability }}
                    </td>
                  </tr>
                  <template v-for="(group, groupIdx) in ability.method_groups" :key="'group-' + abilityIdx + '-' + groupIdx">
                    <!-- Method Group Title -->
                    <tr>
                      <td :colspan="form.mesocycle_lengths.length + 1" class="bg-blue-100 font-semibold text-lg py-3 text-blue-700 pl-8">
                        {{ group.group_name }}
                      </td>
                    </tr>
                    <!-- Methods -->
                    <tr v-for="method in group.methods" :key="method.id" class="border-t hover:bg-gray-50">
                      <td class="p-3 font-medium text-gray-800 pl-14">
                        <div class="flex items-center space-x-2">
                          <span>{{ method.name }}</span>
                          <button 
                            @click="showMethodInfo(method)"
                            class="info-button w-5 h-5 bg-blue-500 text-white rounded-full text-xs hover:bg-blue-600 transition duration-200"
                          >
                            i
                          </button>
                        </div>
                      </td>
                      <td 
                        v-for="(_, mesoIndex) in form.mesocycle_lengths" 
                        :key="mesoIndex"
                        class="p-3 text-center"
                      >
                        <input 
                          type="checkbox" 
                          :checked="isMethodSelected(method.id, mesoIndex)"
                          @change="toggleMethod(method.id, mesoIndex, ability.motor_ability)"
                          :disabled="isMethodDisabled(method.id, mesoIndex, ability.motor_ability)"
                          class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        >
                      </td>
                    </tr>
                  </template>
                </template>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex space-x-4 justify-center">
          <button 
            @click="savePeriodization"
            :disabled="loading || !isFormValid"
            class="save-btn px-8 py-4 rounded-xl font-bold text-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
            <i v-else class="fas fa-save mr-2"></i>
            {{ loading ? 'Saving...' : 'SAVE PERIODIZATION' }}
          </button>
          
          <button 
            @click="cancelCreation"
            :disabled="loading"
            class="cancel-btn px-8 py-4 rounded-xl font-bold text-lg transition duration-300 disabled:opacity-50"
          >
            <i class="fas fa-times mr-2"></i>CANCEL
          </button>
        </div>
      </div>
    </main>

    <!-- Method Info Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl max-w-md w-full p-6">
        <div class="flex justify-between items-start mb-4">
          <h1 class="text-2xl font-bold text-gray-800">{{ selectedMethod.name }}</h1>
          <button @click="closeModal" class="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>
        <p class="text-gray-700 leading-relaxed">{{ selectedMethod.description }}</p>
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
  name: 'CreatePeriodizationView',
  components: {
    TrainerHeader,
    AppAlert
  },
  data() {
    return {
      loading: false,
      athletes: [],
      trainingMethods: [],
      showModal: false,
      selectedMethod: {},
      form: {
        periodization_name: '',
        difficulty: 5,
        competition_date: '',
        athlete_id: '',
        mesocycle_lengths: [4, 4, 4],
        selected_methods: [[], [], []] // Array of arrays for each mesocycle
      },
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
    isFormValid() {
      return (
        this.form.periodization_name.trim() &&
        this.form.athlete_id &&
        this.form.competition_date &&
        this.form.mesocycle_lengths.length >= 3 &&
        this.form.selected_methods.every(methods => methods.length > 0)
      )
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
    
    async fetchAthletes() {
      try {
        // No manual token handling needed!
        const response = await apiClient.get('/users/trainer/my-athletes');
        this.athletes = response.data.athletes || [];
      } catch (error) {
        console.error('Napaka pri nalaganju športnikov:', error);
        if (error.response?.status === 401) {
          this.$router.push('/login');
        } else {
          this.showAlert('error', 'Napaka pri nalaganju športnikov.');
        }
      }
    },

    async fetchTrainingMethods() {
      try {
        // No manual token handling needed!
        const response = await apiClient.get('/users/trainer/methods');
        this.trainingMethods = response.data.data || [];
      } catch (error) {
        console.error('Napaka pri pridobivanju metod:', error);
        if (error.response?.status === 401) {
          this.$router.push('/login');
        } else {
          this.showAlert('error', 'Napaka pri pridobivanju metod.');
        }
      }
    },

    addMesocycle() {
      if (this.form.mesocycle_lengths.length < 20) {
        this.form.mesocycle_lengths.push(4)
        this.form.selected_methods.push([])
      }
    },

    removeMesocycle(index) {
      if (this.form.mesocycle_lengths.length > 3) {
        this.form.mesocycle_lengths.splice(index, 1)
        this.form.selected_methods.splice(index, 1)
      }
    },

    showMethodInfo(method) {
      this.selectedMethod = method
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.selectedMethod = {}
    },

    isMethodSelected(methodId, mesoIndex) {
      return this.form.selected_methods[mesoIndex]?.includes(methodId) || false
    },

    getSelectedMethodsCount(mesoIndex) {
      return this.form.selected_methods[mesoIndex]?.length || 0
    },

    getSelectedMotorAbilities(mesoIndex) {
      const selectedMethods = this.form.selected_methods[mesoIndex] || []
      const motorAbilities = new Set()
      
      selectedMethods.forEach(methodId => {
        for (const ability of this.trainingMethods) {
          for (const group of ability.method_groups) {
            if (group.methods.find(method => method.id === methodId)) {
              motorAbilities.add(ability.motor_ability)
              break
            }
          }
        }
      })
      
      return Array.from(motorAbilities)
    },

    hasMethodFromMotorAbility(mesoIndex, motorAbility) {
      const selectedMethods = this.form.selected_methods[mesoIndex] || []
      
      for (const methodId of selectedMethods) {
        const ability = this.trainingMethods.find(a => a.motor_ability === motorAbility)
        if (ability) {
          for (const group of ability.method_groups) {
            if (group.methods.find(method => method.id === methodId)) {
              return true
            }
          }
        }
      }
      return false
    },

    isMethodDisabled(methodId, mesoIndex, motorAbility) {
      // If this method is already selected, it's not disabled
      if (this.isMethodSelected(methodId, mesoIndex)) {
        return false
      }

      // Check if we already have 4 different motor abilities selected
      const selectedMotorAbilities = this.getSelectedMotorAbilities(mesoIndex)
      if (selectedMotorAbilities.length >= 3 && !selectedMotorAbilities.includes(motorAbility)) {
        return true
      }

      // Check if we already have a method from this motor ability
      if (this.hasMethodFromMotorAbility(mesoIndex, motorAbility)) {
        return true
      }

      return false
    },

    toggleMethod(methodId, mesoIndex, motorAbility) {
      if (!this.form.selected_methods[mesoIndex]) {
        this.$set(this.form.selected_methods, mesoIndex, [])
      }

      const methods = this.form.selected_methods[mesoIndex]
      const index = methods.indexOf(methodId)

      if (index > -1) {
        // Remove method
        methods.splice(index, 1)
      } else {
        // Add method only if rules allow
        const selectedMotorAbilities = this.getSelectedMotorAbilities(mesoIndex)
        
        // Check if we can add this method
        if (selectedMotorAbilities.length < 4 && !this.hasMethodFromMotorAbility(mesoIndex, motorAbility)) {
          methods.push(methodId)
        }
      }
    },

    async savePeriodization() {
      this.loading = true;

      try {
        // Format data for API (same as before)
        const payload = {
          athlete_id: parseInt(this.form.athlete_id),
          difficulty: parseInt(this.form.difficulty),
          competition_date: this.form.competition_date,
          mesocycle_lengths: this.form.mesocycle_lengths.join(','),
          method_ids: this.form.selected_methods.map(methods => methods.join(',')).join('|'),
          periodization_name: this.form.periodization_name.trim()
        };

        console.log('Payload:', payload);

        // No manual token handling needed!
        const response = await apiClient.post('/users/trainer/create-periodization', payload);

        this.showAlert('success', response.data.message);

        // Redirect to dashboard after 1.5 seconds
        setTimeout(() => {
          this.$router.push('/trainer');
        }, 1500);

      } catch (error) {
        console.error('Napaka pri ustvarjanju ciklizacije:', error);
        
        if (error.response?.status === 401) {
          this.$router.push('/login');
        } else {
          const errorMessage = error.response?.data?.message || 'Napaka pri ustvarjanju ciklizacije';
          this.showAlert('error', errorMessage);
        }
      } finally {
        this.loading = false;
      }
    },

    // ✅ Keep your other methods unchanged
    showAlert(type, message) {
      this.alert = { show: true, type: type, message: message };
    },

    cancelCreation() {
      if (confirm('Želiš preklicati ustvarjanje? Vse neshranjene spremembe bodo izgubljene.')) {
        this.$router.push('/trainer')
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
    
    this.fetchAthletes()
    this.fetchTrainingMethods()

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal()
      }
    })
  }
}
</script>

<style scoped>
.content-bg {
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
}

.form-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.methods-header {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

.add-mesocycle-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.add-mesocycle-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6);
}

.save-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6);
}

.cancel-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.cancel-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.6);
}

.info-button {
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
}
</style>

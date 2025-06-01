<template>
  <div class="min-h-screen content-bg">
    <!-- Header -->
    <TrainerHeader 
      :user-full-name="userFullName"
      @logout="logout"
    />

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-6">
      <!-- Welcome Section -->
      <div class="welcome-section rounded-xl p-8 mb-8">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-3xl font-bold text-white mb-2">
              Dodaj športnika
            </h2>
            <p class="text-white/90 text-lg">
              Išči in dodaj športnike za svoje ciklizacije.
            </p>
          </div>
          <button 
            @click="goToMyAthletes" 
            class="back-button px-6 py-3 rounded-lg font-semibold transition duration-200 flex items-center"
          >
            <i class="fas fa-arrow-left mr-2"></i>Nazaj na moje špornike
          </button>
        </div>
      </div>

      <!-- Search Section -->
      <div class="search-card rounded-xl p-6 mb-6">
        <div class="relative">
          <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          <input 
            type="text" 
            v-model="searchQuery"
            @input="debouncedSearch"
            placeholder="Išči športnika po imenu ali e-pošti..." 
            class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          >
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <i class="fas fa-spinner fa-spin text-4xl text-white mb-4"></i>
        <p class="text-white text-lg">Nalagam športnike</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-card rounded-xl p-8 text-center">
        <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
        <h3 class="text-xl font-bold text-gray-800 mb-2">Napaka pri nalaganju športnikov</h3>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button @click="fetchAthletes" class="retry-button px-6 py-3 rounded-lg font-semibold transition duration-200">
          <i class="fas fa-redo mr-2"></i>Poskusi ponovno
        </button>
      </div>

      <!-- Athletes List -->
      <div v-else class="space-y-4">
        <div 
          v-for="athlete in filteredAthletes" 
          :key="athlete.id"
          class="athlete-card rounded-xl p-6 flex justify-between items-center"
        >
          <!-- Athlete Info -->
          <div class="flex items-center space-x-4">
            <div class="athlete-avatar">
              <i class="fas fa-user-circle text-4xl text-gray-400"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-800">
                {{ athlete.first_name }} {{ athlete.last_name }}
              </h3>
              <p class="text-gray-600">{{ athlete.email }}</p>
            </div>
          </div>
          
          <!-- Add Button -->
          <button 
            @click="addAthlete(athlete)"
            :disabled="addingAthletes.includes(athlete.id)"
            class="add-athlete-button px-6 py-3 rounded-lg font-semibold transition duration-200 flex items-center"
          >
            <i v-if="addingAthletes.includes(athlete.id)" class="fas fa-spinner fa-spin mr-2"></i>
            <i v-else class="fas fa-user-plus mr-2"></i>
            {{ addingAthletes.includes(athlete.id) ? 'Dodajanje...' : 'Dodaj športnika' }}
          </button>
        </div>

        <!-- Empty State -->
        <div v-if="filteredAthletes.length === 0 && !loading" class="empty-state rounded-xl p-12 text-center">
          <i class="fas fa-users text-6xl text-gray-400 mb-4"></i>
          <h3 class="text-xl font-bold text-gray-700 mb-2">Ni bilo najdenih špornikov.</h3>
          <p class="text-gray-500 mb-6">
            {{ searchQuery ? 'Poskusi dodati kriterije za iskanje športnika.' : 'Ni razpoložljivih športnikov za dodajanje.' }}
          </p>
          <button v-if="searchQuery" @click="clearSearch" class="clear-button px-6 py-3 rounded-lg font-semibold transition duration-200">
            <i class="fas fa-times mr-2"></i>Počisti iskalnik
          </button>
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
  name: 'AddAthleteView',
  components: {
    TrainerHeader,
    AppAlert
  },
  data() {
    return {
      athletes: [],
      loading: true,
      error: null,
      searchQuery: '',
      addingAthletes: [], // Array to track which athletes are being added
      alert: {
        show: false,
        type: 'info',
        message: ''
      },
      searchTimeout: null
    }
  },
  computed: {
    userFullName() {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return `${user.first_name} ${user.last_name}` || 'Trainer'
    },
    filteredAthletes() {
      if (!this.searchQuery.trim()) {
        return this.athletes
      }
      
      const query = this.searchQuery.toLowerCase()
      return this.athletes.filter(athlete => 
        athlete.first_name.toLowerCase().includes(query) ||
        athlete.last_name.toLowerCase().includes(query) ||
        athlete.email.toLowerCase().includes(query) ||
        `${athlete.first_name} ${athlete.last_name}`.toLowerCase().includes(query)
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
      this.loading = true
      this.error = null
      
      try {
        const token = localStorage.getItem('access_token')
        if (!token) {
          this.$router.push('/login')
          return
        }

        const response = await axios.get(`${API_ENDPOINTS.LOGIN.replace('/auth/login', '')}/users/trainer/search-athletes`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        this.athletes = response.data.athletes || []
        
      } catch (error) {
        console.error('Error fetching athletes:', error)
        
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('user')
          this.$router.push('/login')
        } else {
          this.error = error.response?.data?.message || 'Failed to load athletes'
        }
      } finally {
        this.loading = false
      }
    },
    
    debouncedSearch() {
      // Clear previous timeout
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }
      
      // Set new timeout for debounced search
      this.searchTimeout = setTimeout(() => {
        // Search logic is handled by computed property
        console.log('Searching for:', this.searchQuery)
      }, 300)
    },
    
    async addAthlete(athlete) {
      // Add athlete ID to loading array
      this.addingAthletes.push(athlete.id)
      
      try {
        const token = localStorage.getItem('access_token')
        
        // Use actual API endpoint
        const response = await axios.post(`${API_ENDPOINTS.LOGIN.replace('/auth/login', '')}/users/trainer/add-athlete`, {
          athlete_id: athlete.id
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        // Display success message from API response
        this.showAlert('success', response.data.message || `${response.data.athlete_name} successfully added!`)
        
        // Remove athlete from list after successful addition
        this.athletes = this.athletes.filter(a => a.id !== athlete.id)
        
        // Refresh the athlete list after a brief delay to show the message
        setTimeout(() => {
          this.fetchAthletes()
        }, 2000)
        
      } catch (error) {
        console.error('Error adding athlete:', error)
        this.showAlert('error', error.response?.data?.message || 'Failed to add athlete')
      } finally {
        // Remove from loading array
        this.addingAthletes = this.addingAthletes.filter(id => id !== athlete.id)
      }
    },
    
    clearSearch() {
      this.searchQuery = ''
    },
    
    goToMyAthletes() {
      this.$router.push('/trainer/my-athletes')
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
  }
}
</script>


<style scoped>
.content-bg {
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
}

.welcome-section {
  background: transparent;
  backdrop-filter: blur(10px);
}

.back-button {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 255, 255, 0.2);
}

.search-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.athlete-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.athlete-card:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.add-athlete-button {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.add-athlete-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6);
}

.add-athlete-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.empty-state {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.error-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.retry-button {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

.retry-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6);
}

.clear-button {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: white;
}

.clear-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(107, 114, 128, 0.6);
}
</style>

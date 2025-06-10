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
              My Athlete
            </h2>
            <p class="text-white/90 text-lg">
              See your athletes.
            </p>
          </div>
          <button 
            @click="goToAddAthlete" 
            class="forward-button px-6 py-3 rounded-lg font-semibold transition duration-200 flex items-center"
          >
            <i class="fas fa-arrow-right mr-2"></i>Dodaj športnika
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <i class="fas fa-spinner fa-spin text-4xl text-white mb-4"></i>
        <p class="text-white text-lg">Nalaganje športnikov...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-card rounded-xl p-8 text-center">
        <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
        <h3 class="text-xl font-bold text-gray-800 mb-2">Napaka pri nalaganju športnikov.</h3>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button @click="fetchAthletes" class="retry-button px-6 py-3 rounded-lg font-semibold transition duration-200">
          <i class="fas fa-redo mr-2"></i>Poskusi ponovno
        </button>
      </div>

      <!-- Athletes List -->
      <div v-else class="space-y-4">
        <div 
          v-for="athlete in athletes" 
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
              <p class="text-gray-600">{{ athlete.phone_number }}</p>
            </div>
          </div>
          
          <!-- Delete Button -->
          <button 
            @click="deleteAthlete(athlete)"
            :disabled="deletingAthletes.includes(athlete.id)"
            class="delete-athlete-button px-6 py-3 rounded-lg font-semibold transition duration-200 flex items-center"
          >
            <i v-if="deletingAthletes.includes(athlete.id)" class="fas fa-spinner fa-spin mr-2"></i>
            <i v-else class="fas fa-user-minus mr-2"></i>
            {{ deletingAthletes.includes(athlete.id) ? 'Brisanje...' : 'Odstrani' }}
          </button>
        </div>

        <!-- Empty State -->
        <div v-if="athletes.length === 0 && !loading" class="empty-state rounded-xl p-12 text-center">
          <i class="fas fa-users text-6xl text-gray-400 mb-4"></i>
          <h3 class="text-xl font-bold text-gray-700 mb-2">Športniki niso bili najdeni.</h3>
          <p class="text-gray-500 mb-6">Nimaš še dodanih športnikov.</p>
          <button @click="goToAddAthlete" class="create-button px-6 py-3 rounded-lg font-semibold transition duration-200 inline-flex items-center">
            <i class="fas fa-plus mr-2 text-sm"></i>Dodaj špornika
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
import { apiClient, API_ENDPOINTS } from '@/utils/api.js'
import TrainerHeader from '@/components/layout/TrainerHeader.vue'
import AppAlert from '@/components/ui/AppAlert.vue'

export default {
  name: 'MyAthletesView',
  components: {
    TrainerHeader,
    AppAlert
  },
  data() {
    return {
      athletes: [],
      loading: true,
      error: null,
      deletingAthletes: [],
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
        // No manual token handling needed!
        const response = await apiClient.get('/users/trainer/my-athletes')
        this.athletes = response.data.athletes || []
        
      } catch (error) {
        console.error('Error fetching athletes:', error)
        
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('user')
          this.$router.push('/login')
        } else {
          this.error = error.response?.data?.message || 'Napaka pri nalaganju športnikov.'
        }
      } finally {
        this.loading = false
      }
    },
    async deleteAthlete(athlete) {
      if (!confirm(`Si prepričan, da želiš izbrisati ${athlete.first_name} ${athlete.last_name}?`)) {
        return
      }
      
      this.deletingAthletes.push(athlete.id)
      
      try {
        // No manual token handling needed!
        await apiClient.delete(`/users/trainer/delete-athlete/${athlete.id}`)
        
        this.showAlert('success', `${athlete.first_name} ${athlete.last_name} je bil izbrisan.`)
        this.athletes = this.athletes.filter(a => a.id !== athlete.id)
        
      } catch (error) {
        console.error('Error deleting athlete:', error)
        
        if (error.response?.status === 401) {
          this.$router.push('/login')
        } else {
          this.showAlert('error', error.response?.data?.message || 'Napaka pri brisanju športnika.')
        }
      } finally {
        this.deletingAthletes = this.deletingAthletes.filter(id => id !== athlete.id)
      }
    },
    goToAddAthlete() {
      this.$router.push('/trainer/add-athlete')
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

.forward-button {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.retry-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6);
}

.create-button {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.create-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6);
}

.delete-athlete-button {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.delete-athlete-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.6);
}

.delete-athlete-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>

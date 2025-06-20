<template>
  <div class="min-h-screen content-bg">
    <!-- Header Component -->
    <AthleteHeader 
      :user-full-name="userFullName"
      @logout="logout"
    />

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-6">
      <!-- Welcome Section -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">
          <i class="fas fa-clipboard-list mr-3"></i>MOJI TESTI
        </h1>
        <p class="text-white/90">Pregled vseh opravljenih testov</p>
      </div>

      <!-- Search Bar -->
      <div class="search-section mb-8">
        <div class="search-container">
          <div class="search-input-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input 
              type="text" 
              v-model="searchTerm"
              placeholder="Išči po trenerju ali datumu..."
              class="search-input"
            >
            <button 
              v-if="searchTerm"
              @click="clearSearch"
              class="clear-search-btn"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center min-h-[400px]">
        <div class="text-center">
          <i class="fas fa-spinner fa-spin text-4xl text-white mb-4"></i>
          <p class="text-white text-lg">Nalaganje testov...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex items-center justify-center min-h-[400px]">
        <div class="text-center bg-white rounded-xl p-8">
          <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
          <h3 class="text-xl font-bold text-gray-800 mb-2">Napaka pri nalaganju testov</h3>
          <p class="text-gray-600 mb-4">{{ error }}</p>
          <button 
            @click="fetchTests" 
            class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            <i class="fas fa-redo mr-2"></i>Poskusi ponovno
          </button>
        </div>
      </div>

      <!-- Tests List -->
      <div v-else class="space-y-6">
        <!-- Search Results Info -->
        <div v-if="searchTerm" class="search-results-info">
          <p class="text-white/90">
            Najdenih {{ filteredTests.length }} test{{ filteredTests.length !== 1 ? 'ov' : '' }} 
            za "{{ searchTerm }}"
          </p>
        </div>

        <div 
          v-for="test in filteredTests" 
          :key="test.id"
          class="test-card rounded-xl p-6 transition-all duration-300 hover:transform hover:scale-105"
        >
          <!-- Test Header -->
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-2xl font-bold text-gray-800 mb-1">Test #{{ test.id }}</h2>
              <p class="text-gray-600">{{ formatDate(test.test_date) }}</p>
            </div>
            
            <!-- Status Badge -->
            <div class="status-badge">
              <i class="fas fa-check-circle text-green-500 mr-2"></i>
              <span class="text-green-600 font-medium">Opravljen</span>
            </div>
          </div>

          <!-- Test Details -->
          <div class="test-details mb-6">
            <div class="flex items-center mb-3">
              <div class="detail-icon trainer-icon">
                <i class="fas fa-user-tie text-white"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm text-gray-600">Trener</p>
                <p class="font-semibold text-gray-800">{{ test.trainer_full_name }}</p>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex space-x-3">
            <button 
              @click="viewTest(test.id)"
              class="view-btn flex-1 py-3 px-6 rounded-lg font-bold transition duration-300"
            >
              <i class="fas fa-eye mr-2"></i>PODROBNOSTI
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="tests.length === 0 && !loading" class="empty-state text-center py-16">
          <div class="empty-icon mb-6">
            <i class="fas fa-clipboard-list text-6xl text-white/30"></i>
          </div>
          <h3 class="text-2xl font-bold text-white mb-4">Ni opravljenih testov</h3>
          <p class="text-white/80">Še nisi opravil nobenega testa.</p>
        </div>

        <!-- No Search Results -->
        <div v-if="searchTerm && filteredTests.length === 0 && tests.length > 0" class="no-results text-center py-16">
          <div class="empty-icon mb-6">
            <i class="fas fa-search text-6xl text-white/30"></i>
          </div>
          <h3 class="text-2xl font-bold text-white mb-4">Ni najdenih rezultatov</h3>
          <p class="text-white/80 mb-8">Noben test ne ustreza iskalnim pogojem.</p>
          <button 
            @click="clearSearch"
            class="clear-btn px-8 py-3 rounded-xl font-bold transition duration-300"
          >
            <i class="fas fa-times mr-2"></i>Počisti iskanje
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { apiClient } from '@/utils/api.js'
import AthleteHeader from '@/components/layout/AthleteHeader.vue'

export default {
  name: 'TestView',
  components: {
    AthleteHeader
  },
  data() {
    return {
      tests: [],
      loading: true,
      error: null,
      searchTerm: ''
    }
  },
  computed: {
    userFullName() {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return `${user.first_name} ${user.last_name}` || 'Atlet'
    },
    filteredTests() {
      if (!this.searchTerm) {
        return this.tests
      }
      
      const search = this.searchTerm.toLowerCase()
      return this.tests.filter(test => {
        // Search by trainer full name
        const trainerMatch = test.trainer_full_name.toLowerCase().includes(search)
        
        // Search by date (formatted and raw)
        const formattedDate = this.formatDate(test.test_date).toLowerCase()
        const rawDate = test.test_date.toLowerCase()
        const dateMatch = formattedDate.includes(search) || rawDate.includes(search)
        
        return trainerMatch || dateMatch
      })
    }
  },
  methods: {
    async fetchTests() {
      this.loading = true
      this.error = null
      
      try {
        const response = await apiClient.get('/users/athlete/get-tests')
        this.tests = response.data.tests || []
        
      } catch (error) {
        console.error('Error fetching tests:', error)
        
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('user')
          this.$router.push('/login')
        } else {
          this.error = error.response?.data?.message || 'Napaka pri nalaganju testov'
        }
      } finally {
        this.loading = false
      }
    },

    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('sl-SI', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },

    clearSearch() {
      this.searchTerm = ''
    },

    viewTest(id) {
      // Navigate to test details view for athlete
      this.$router.push(`/athlete/test/${id}`)
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
    
    this.fetchTests()
  }
}
</script>

<style scoped>
.content-bg {
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
}

/* Search Section */
.search-section {
  display: flex;
  justify-content: center;
}

.search-container {
  width: 100%;
  max-width: 500px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: #6b7280;
  z-index: 10;
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  font-size: 1rem;
  color: #1f2937;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.search-input::placeholder {
  color: #9ca3af;
}

.clear-search-btn {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.clear-search-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.search-results-info {
  text-align: center;
  margin-bottom: 1rem;
}

.test-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.test-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.status-badge {
  display: flex;
  align-items: center;
  background: rgba(34, 197, 94, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.detail-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.trainer-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.view-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  cursor: pointer;
}

.view-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6);
}

.clear-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  cursor: pointer;
}

.clear-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6);
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .search-container {
    max-width: 100%;
  }
  
  .test-card {
    margin-bottom: 1rem;
  }
  
  .flex.space-x-3 {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>

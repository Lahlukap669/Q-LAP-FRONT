<template>
  <div class="min-h-screen visualization-bg">
    <!-- Header -->
    <TrainerHeader 
      :user-full-name="userFullName"
      @logout="logout"
    />

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-6">
      <!-- Page Header -->
      <div class="text-center mb-6">
        <h1 class="text-3xl font-bold text-white mb-2">
          <i class="fas fa-chart-line mr-3"></i>VIZUALIZACIJA PODATKOV
        </h1>
        <p class="text-white/90">Analiza napredka atletov</p>
      </div>

      <!-- Selection Banner -->
      <div class="selection-banner rounded-xl p-6 mb-6">
        <div class="flex items-center justify-between">
          <!-- Left: Athlete Selection -->
          <div class="athlete-selection">
            <label class="selection-label">Izberi atleta:</label>
            <select 
              v-model="selectedAthleteId"
              @change="onAthleteChange"
              class="selection-input athlete-select"
            >
              <option value="">Izberi atleta...</option>
              <option 
                v-for="athlete in athletes" 
                :key="athlete.id" 
                :value="athlete.id"
              >
                {{ athlete.first_name }} {{ athlete.last_name }}
              </option>
            </select>
          </div>
          
          <!-- Right: Visualization Type -->
          <div class="visualization-type">
            <label class="selection-label">Tip vizualizacije:</label>
            <div class="flex space-x-2">
              <button 
                @click="changeVisualizationType('Testi')"
                :class="['type-button', { 'active': selectedVisualizationType === 'Testi' }]"
              >
                Testi
              </button>
              <button 
                @click="changeVisualizationType('Gibalne sposobnosti')"
                :class="['type-button', { 'active': selectedVisualizationType === 'Gibalne sposobnosti' }]"
              >
                Gibalne sposobnosti
              </button>
              <button 
                @click="changeVisualizationType('Mezocikel')"
                :class="['type-button', { 'active': selectedVisualizationType === 'Mezocikel' }]"
                disabled
              >
                Mezocikel
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center min-h-[400px]">
        <div class="text-center">
          <i class="fas fa-spinner fa-spin text-4xl text-white mb-4"></i>
          <p class="text-white text-lg">Nalagam podatke...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex items-center justify-center min-h-[400px]">
        <div class="text-center bg-white rounded-xl p-8">
          <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
          <h3 class="text-xl font-bold text-gray-800 mb-2">Napaka pri nalaganju</h3>
          <p class="text-gray-600 mb-4">{{ error }}</p>
          <button 
            @click="fetchCurrentAnalytics" 
            class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            <i class="fas fa-redo mr-2"></i>Poskusi znova
          </button>
        </div>
      </div>

      <!-- No Athlete Selected -->
      <div v-else-if="!selectedAthleteId" class="no-selection text-center py-16">
        <div class="no-selection-icon mb-6">
          <i class="fas fa-user-plus text-6xl text-white/30"></i>
        </div>
        <h3 class="text-2xl font-bold text-white mb-4">Izberi atleta</h3>
        <p class="text-white/80">Izberi atleta za prikaz vizualizacije podatkov.</p>
      </div>

      <!-- TESTI Charts Container -->
      <div v-else-if="selectedVisualizationType === 'Testi'" class="charts-container">
        <!-- No Data -->
        <div v-if="!testAnalytics || !testAnalytics.tests || testAnalytics.tests.length === 0" class="no-data text-center py-16">
          <div class="no-data-icon mb-6">
            <i class="fas fa-chart-line text-6xl text-white/30"></i>
          </div>
          <h3 class="text-2xl font-bold text-white mb-4">Ni podatkov</h3>
          <p class="text-white/80">Za tega atleta ni na voljo testnih podatkov.</p>
        </div>

        <!-- Charts by Unit -->
        <div v-else class="space-y-8">
          <!-- Analytics Summary -->
          <div class="analytics-summary rounded-xl p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4">Povzetek testov</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="summary-card">
                <div class="summary-number">{{ testAnalytics.total_tests }}</div>
                <div class="summary-label">Skupaj testov</div>
              </div>
              <div class="summary-card">
                <div class="summary-number">{{ getTotalExercises() }}</div>
                <div class="summary-label">Skupaj vaj</div>
              </div>
              <div class="summary-card">
                <div class="summary-number">{{ getUniqueUnits().length }}</div>
                <div class="summary-label">Različnih enot</div>
              </div>
            </div>
          </div>

          <!-- Chart for each unit -->
          <div 
            v-for="(chartData, index) in chartsData" 
            :key="'test-' + chartData.unit"
            class="chart-container rounded-xl p-6"
          >
            <h3 class="chart-title">Napredek vaj - {{ chartData.unit }}</h3>
            <div class="chart-wrapper">
              <canvas 
                :id="'test-chart-canvas-' + index"
                :ref="'test-chart-' + chartData.unit" 
                class="chart-canvas"
                width="800" 
                height="400"
              ></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- MOTOR ABILITIES Charts Container -->
      <div v-else-if="selectedVisualizationType === 'Gibalne sposobnosti'" class="charts-container">
        <!-- No Data -->
        <div v-if="!motorAbilityAnalytics || !motorAbilityAnalytics.tests || motorAbilityAnalytics.tests.length === 0" class="no-data text-center py-16">
          <div class="no-data-icon mb-6">
            <i class="fas fa-chart-line text-6xl text-white/30"></i>
          </div>
          <h3 class="text-2xl font-bold text-white mb-4">Ni podatkov</h3>
          <p class="text-white/80">Za tega atleta ni na voljo podatkov o motoričnih sposobnostih.</p>
        </div>

        <!-- Charts by Motor Ability -->
        <div v-else class="space-y-8">
          <!-- Analytics Summary -->
          <div class="analytics-summary rounded-xl p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4">Povzetek motoričnih sposobnosti</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="summary-card">
                <div class="summary-number">{{ motorAbilityAnalytics.total_tests }}</div>
                <div class="summary-label">Skupaj testov</div>
              </div>
              <div class="summary-card">
                <div class="summary-number">{{ getTotalMotorAbilities() }}</div>
                <div class="summary-label">Motorične sposobnosti</div>
              </div>
              <div class="summary-card">
                <div class="summary-number">{{ motorAbilityChartsData.length }}</div>
                <div class="summary-label">Aktivnih grafov</div>
              </div>
            </div>
          </div>

          <!-- Chart for each motor ability -->
          <div 
            v-for="(chartData, index) in motorAbilityChartsData" 
            :key="'motor-' + chartData.motorAbility"
            class="chart-container rounded-xl p-6"
          >
            <h3 class="chart-title">{{ chartData.motorAbility }} ({{ chartData.unit }})</h3>
            <div class="chart-wrapper">
              <canvas 
                :id="'motor-chart-canvas-' + index"
                :ref="'motor-chart-' + chartData.motorAbility" 
                class="chart-canvas"
                width="800" 
                height="400"
              ></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Other Visualization Types (Placeholder) -->
      <div v-else class="coming-soon text-center py-16">
        <div class="coming-soon-icon mb-6">
          <i class="fas fa-tools text-6xl text-white/30"></i>
        </div>
        <h3 class="text-2xl font-bold text-white mb-4">Kmalu na voljo</h3>
        <p class="text-white/80">Ta tip vizualizacije je trenutno v razvoju.</p>
      </div>
    </main>
  </div>
</template>

<script>
import { apiClient, API_ENDPOINTS } from '@/utils/api.js'
import TrainerHeader from '@/components/layout/TrainerHeader.vue'
import Chart from 'chart.js/auto'

export default {
  name: 'VisualizationView',
  components: {
    TrainerHeader
  },
  data() {
    return {
      loading: false,
      error: null,
      athletes: [],
      selectedAthleteId: '',
      selectedVisualizationType: 'Testi',
      testAnalytics: null,
      motorAbilityAnalytics: null,
      chartsData: [],
      motorAbilityChartsData: [],
      chartInstances: {}
    }
  },
  computed: {
    userFullName() {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return `${user.first_name} ${user.last_name}` || 'Trainer'
    }
  },
  methods: {
    async fetchAthletes() {
      try {
        // No manual token handling needed!
        const response = await apiClient.get('/users/trainer/my-athletes')
        this.athletes = response.data.athletes || []
        console.log('Atletje naloženi:', this.athletes)
      } catch (error) {
        console.error('Error fetching athletes:', error)
        if (error.response?.status === 401) {
          this.$router.push('/login')
        }
      }
    },

    async fetchTestAnalytics() {
      if (!this.selectedAthleteId) return

      this.loading = true
      this.error = null
      
      try {
        console.log('Kličem TEST API za atleta:', this.selectedAthleteId)

        // No manual token handling needed!
        const response = await apiClient.post('/users/trainer/get-test-analytics', {
          athlete_id: parseInt(this.selectedAthleteId)
        })

        console.log('Test API response:', response.data)
        this.testAnalytics = response.data
        this.processChartsData()
        
      } catch (error) {
        console.error('Error fetching test analytics:', error)
        
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('user')
          this.$router.push('/login')
        } else {
          this.error = error.response?.data?.message || 'Napaka pri nalaganju testne analitike'
        }
      } finally {
        this.loading = false
      }
    },

    async fetchMotorAbilityAnalytics() {
      if (!this.selectedAthleteId) return

      this.loading = true
      this.error = null
      
      try {
        console.log('Kličem MOTOR ABILITY API za atleta:', this.selectedAthleteId)

        // No manual token handling needed!
        const response = await apiClient.post('/users/trainer/get-motor-ability-analytics', {
          athlete_id: parseInt(this.selectedAthleteId)
        })

        console.log('Motor Ability API response:', response.data)
        this.motorAbilityAnalytics = response.data
        this.processMotorAbilityChartsData()
        
      } catch (error) {
        console.error('Error fetching motor ability analytics:', error)
        
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('user')
          this.$router.push('/login')
        } else {
          this.error = error.response?.data?.message || 'Napaka pri nalaganju analitike motoričnih sposobnosti'
        }
      } finally {
        this.loading = false
      }
    },

    async fetchCurrentAnalytics() {
      if (this.selectedVisualizationType === 'Testi') {
        await this.fetchTestAnalytics()
      } else if (this.selectedVisualizationType === 'Gibalne sposobnosti') {
        await this.fetchMotorAbilityAnalytics()
      }
      
      await this.$nextTick()
      setTimeout(() => {
        this.renderCharts()
      }, 100)
    },

    processChartsData() {
      console.log('Procesiranje TEST podatkov...')
      this.chartsData = []
      
      if (!this.testAnalytics || !this.testAnalytics.tests || this.testAnalytics.tests.length === 0) {
        console.log('Ni test podatkov za procesiranje')
        return
      }

      console.log('Test podatki:', this.testAnalytics.tests)

      // Group exercises by unit
      const unitGroups = {}
      
      this.testAnalytics.tests.forEach(test => {
        const date = test.test_date
        console.log('Procesiranje testa:', test.id, 'datum:', date)
        
        test.exercises.forEach(exercise => {
          const unit = exercise.unit
          const exerciseName = exercise.exercise
          const measure = exercise.measure
          
          console.log('Vaja:', exerciseName, 'Vrednost:', measure, 'Enota:', unit)
          
          if (!unit || !exerciseName || measure === undefined || measure === null) {
            console.log('Preskoči - manjkajo podatki')
            return
          }
          
          if (!unitGroups[unit]) {
            unitGroups[unit] = {}
          }
          if (!unitGroups[unit][exerciseName]) {
            unitGroups[unit][exerciseName] = []
          }
          
          unitGroups[unit][exerciseName].push({
            date: date,
            measure: measure
          })
        })
      })

      console.log('Unit groups:', unitGroups)

      // Pripravi podatke za grafe
      Object.entries(unitGroups).forEach(([unit, exercises]) => {
        console.log('Procesiranje enote:', unit)
        
        const hasValidData = Object.values(exercises).some(exerciseData => 
          exerciseData && exerciseData.length > 0
        )
        
        if (!hasValidData) {
          console.log(`Preskačam enoto ${unit} - ni veljavnih podatkov`)
          return
        }

        // Zberi vse datume in jih uredi
        const allDates = new Set()
        Object.values(exercises).forEach(exerciseData => {
          exerciseData.forEach(point => {
            if (point.date) {
              allDates.add(point.date)
            }
          })
        })
        
        const sortedDates = Array.from(allDates).sort((a, b) => new Date(a) - new Date(b))
        console.log('Datumi za enoto', unit, ':', sortedDates)

        // Pripravi datasets
        const datasets = []
        const colors = [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
          '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
        ]
        let colorIndex = 0

        Object.entries(exercises).forEach(([exerciseName, dataPoints]) => {
          if (!dataPoints || dataPoints.length === 0) {
            return
          }
          
          // Mapiranje datuma v vrednost
          const dateToMeasure = {}
          dataPoints.forEach(dp => {
            if (dp.date && dp.measure !== undefined && dp.measure !== null) {
              dateToMeasure[dp.date] = dp.measure
            }
          })

          const data = sortedDates.map(date => dateToMeasure[date] || null)
          
          const hasValidDataPoints = data.some(value => value !== null && value !== undefined)
          if (!hasValidDataPoints) {
            return
          }

          datasets.push({
            label: exerciseName,
            data: data,
            borderColor: colors[colorIndex % colors.length],
            backgroundColor: colors[colorIndex % colors.length] + '20',
            borderWidth: 3,
            fill: false,
            tension: 0.1,
            pointRadius: 6,
            pointHoverRadius: 8,
            spanGaps: false
          })
          colorIndex++
        })

        if (datasets.length > 0) {
          this.chartsData.push({
            unit: unit,
            dates: sortedDates,
            datasets: datasets
          })
          console.log(`Dodal TEST graf za enoto: ${unit} z ${datasets.length} dataseti`)
        }
      })

      console.log(`Skupaj TEST grafov: ${this.chartsData.length}`)
    },

    processMotorAbilityChartsData() {
      console.log('Procesiranje MOTOR ABILITY podatkov...')
      this.motorAbilityChartsData = []
      
      if (!this.motorAbilityAnalytics || !this.motorAbilityAnalytics.tests || this.motorAbilityAnalytics.tests.length === 0) {
        console.log('Ni motor ability podatkov za procesiranje')
        return
      }

      console.log('Motor ability podatki:', this.motorAbilityAnalytics.tests)

      // Group by motor ability
      const motorAbilityGroups = {}
      
      this.motorAbilityAnalytics.tests.forEach(test => {
        const date = test.test_date
        console.log('Procesiranje motor ability testa:', test.id, 'datum:', date)
        
        test.motor_abilities.forEach(motorAbility => {
          const abilityName = motorAbility.motor_ability
          const measure = motorAbility.measure
          const unit = motorAbility.unit
          
          console.log('Motorična sposobnost:', abilityName, 'Vrednost:', measure, 'Enota:', unit)
          
          if (!abilityName || measure === undefined || measure === null || !unit) {
            console.log('Preskoči - manjkajo podatki')
            return
          }
          
          if (!motorAbilityGroups[abilityName]) {
            motorAbilityGroups[abilityName] = {
              unit: unit,
              dataPoints: []
            }
          }
          
          motorAbilityGroups[abilityName].dataPoints.push({
            date: date,
            measure: measure
          })
        })
      })

      console.log('Motor ability groups:', motorAbilityGroups)

      // Pripravi podatke za grafe
      Object.entries(motorAbilityGroups).forEach(([motorAbility, data]) => {
        console.log('Procesiranje motorične sposobnosti:', motorAbility)
        
        if (!data.dataPoints || data.dataPoints.length === 0) {
          console.log(`Preskačam ${motorAbility} - ni podatkov`)
          return
        }

        // Zberi vse datume in jih uredi
        const allDates = new Set()
        data.dataPoints.forEach(point => {
          if (point.date) {
            allDates.add(point.date)
          }
        })
        
        const sortedDates = Array.from(allDates).sort((a, b) => new Date(a) - new Date(b))
        console.log('Datumi za motorično sposobnost', motorAbility, ':', sortedDates)

        // Mapiranje datuma v vrednost
        const dateToMeasure = {}
        data.dataPoints.forEach(dp => {
          if (dp.date && dp.measure !== undefined && dp.measure !== null) {
            dateToMeasure[dp.date] = dp.measure
          }
        })

        const chartData = sortedDates.map(date => dateToMeasure[date] || null)
        
        const hasValidDataPoints = chartData.some(value => value !== null && value !== undefined)
        if (!hasValidDataPoints) {
          return
        }

        // Create dataset for this motor ability
        const dataset = {
          label: motorAbility,
          data: chartData,
          borderColor: '#FF6384',
          backgroundColor: '#FF638420',
          borderWidth: 3,
          fill: false,
          tension: 0.1,
          pointRadius: 6,
          pointHoverRadius: 8,
          spanGaps: false
        }

        this.motorAbilityChartsData.push({
          motorAbility: motorAbility,
          unit: data.unit,
          dates: sortedDates,
          datasets: [dataset]
        })
        console.log(`Dodal MOTOR ABILITY graf za: ${motorAbility}`)
      })

      console.log(`Skupaj MOTOR ABILITY grafov: ${this.motorAbilityChartsData.length}`)
    },

    renderCharts() {
      console.log('Renderiranje grafov...')
      
      // Uniči obstoječe grafe
      Object.values(this.chartInstances).forEach(chart => {
        if (chart) {
          chart.destroy()
        }
      })
      this.chartInstances = {}

      // Render test charts
      if (this.selectedVisualizationType === 'Testi') {
        console.log('Renderiranje TEST grafov:', this.chartsData.length)
        this.chartsData.forEach((chartData, index) => {
          console.log(`Renderiranje TEST grafa ${index} za enoto: ${chartData.unit}`)
          
          let canvas = document.getElementById('test-chart-canvas-' + index)
          
          if (!canvas) {
            const canvasRef = this.$refs['test-chart-' + chartData.unit]
            if (canvasRef) {
              canvas = Array.isArray(canvasRef) ? canvasRef[0] : canvasRef
            }
          }
          
          if (canvas) {
            console.log(`Canvas najden za TEST enoto ${chartData.unit}`)
            const ctx = canvas.getContext('2d')
            
            this.chartInstances['test-' + chartData.unit] = new Chart(ctx, {
              type: 'line',
              data: {
                labels: chartData.dates,
                datasets: chartData.datasets
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  title: {
                    display: true,
                    text: `Napredek vaj (${chartData.unit})`,
                    font: {
                      size: 16,
                      weight: 'bold'
                    }
                  },
                  legend: {
                    display: true,
                    position: 'top'
                  }
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: 'Datum testa'
                    }
                  },
                  y: {
                    title: {
                      display: true,
                      text: `Vrednost (${chartData.unit})`
                    }
                  }
                },
                interaction: {
                  intersect: false,
                  mode: 'index'
                }
              }
            })
            console.log(`TEST graf ustvarjen za enoto: ${chartData.unit}`)
          } else {
            console.error(`Canvas ni najden za TEST enoto: ${chartData.unit}`)
          }
        })
      }

      // Render motor ability charts
      if (this.selectedVisualizationType === 'Gibalne sposobnosti') {
        console.log('Renderiranje MOTOR ABILITY grafov:', this.motorAbilityChartsData.length)
        this.motorAbilityChartsData.forEach((chartData, index) => {
          console.log(`Renderiranje MOTOR ABILITY grafa ${index} za: ${chartData.motorAbility}`)
          
          let canvas = document.getElementById('motor-chart-canvas-' + index)
          
          if (!canvas) {
            const canvasRef = this.$refs['motor-chart-' + chartData.motorAbility]
            if (canvasRef) {
              canvas = Array.isArray(canvasRef) ? canvasRef[0] : canvasRef
            }
          }
          
          if (canvas) {
            console.log(`Canvas najden za MOTOR ABILITY ${chartData.motorAbility}`)
            const ctx = canvas.getContext('2d')
            
            this.chartInstances['motor-' + chartData.motorAbility] = new Chart(ctx, {
              type: 'line',
              data: {
                labels: chartData.dates,
                datasets: chartData.datasets
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  title: {
                    display: true,
                    text: `${chartData.motorAbility} (${chartData.unit})`,
                    font: {
                      size: 16,
                      weight: 'bold'
                    }
                  },
                  legend: {
                    display: false // No legend needed for single line
                  }
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: 'Datum testa'
                    }
                  },
                  y: {
                    title: {
                      display: true,
                      text: `${chartData.motorAbility} (${chartData.unit})`
                    }
                  }
                },
                interaction: {
                  intersect: false,
                  mode: 'index'
                }
              }
            })
            console.log(`MOTOR ABILITY graf ustvarjen za: ${chartData.motorAbility}`)
          } else {
            console.error(`Canvas ni najden za MOTOR ABILITY: ${chartData.motorAbility}`)
          }
        })
      }
    },

    async changeVisualizationType(type) {
      console.log('Spreminjam tip vizualizacije na:', type)
      this.selectedVisualizationType = type
      
      if (this.selectedAthleteId) {
        await this.fetchCurrentAnalytics()
      }
    },

    async onAthleteChange() {
      console.log('Atlet spremenjen:', this.selectedAthleteId)
      if (this.selectedAthleteId) {
        await this.fetchCurrentAnalytics()
      } else {
        this.testAnalytics = null
        this.motorAbilityAnalytics = null
        this.chartsData = []
        this.motorAbilityChartsData = []
        Object.values(this.chartInstances).forEach(chart => {
          if (chart) chart.destroy()
        })
        this.chartInstances = {}
      }
    },

    getTotalExercises() {
      if (!this.testAnalytics || !this.testAnalytics.tests) return 0
      
      const uniqueExercises = new Set()
      this.testAnalytics.tests.forEach(test => {
        test.exercises.forEach(exercise => {
          if (exercise.exercise) {
            uniqueExercises.add(exercise.exercise)
          }
        })
      })
      return uniqueExercises.size
    },

    getUniqueUnits() {
      if (!this.testAnalytics || !this.testAnalytics.tests) return []
      
      const units = new Set()
      this.testAnalytics.tests.forEach(test => {
        test.exercises.forEach(exercise => {
          if (exercise.unit) {
            units.add(exercise.unit)
          }
        })
      })
      return Array.from(units)
    },

    getTotalMotorAbilities() {
      if (!this.motorAbilityAnalytics || !this.motorAbilityAnalytics.tests) return 0
      
      const uniqueAbilities = new Set()
      this.motorAbilityAnalytics.tests.forEach(test => {
        test.motor_abilities.forEach(ability => {
          if (ability.motor_ability) {
            uniqueAbilities.add(ability.motor_ability)
          }
        })
      })
      return uniqueAbilities.size
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
  },

  beforeUnmount() {
    Object.values(this.chartInstances).forEach(chart => {
      if (chart) {
        chart.destroy()
      }
    })
  }
}
</script>

<style scoped>
.visualization-bg {
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
  min-height: 100vh;
}

.debug-info {
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #f59e0b;
}

/* Selection Banner */
.selection-banner {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.selection-label {
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  display: block;
}

.selection-input {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.95);
  color: #1f2937;
  font-weight: 500;
  transition: all 0.2s ease;
}

.selection-input:focus {
  outline: none;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.athlete-select {
  min-width: 200px;
}

.type-button {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.type-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.type-button.active {
  background: rgba(255, 255, 255, 0.9);
  color: #1f2937;
}

.type-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Analytics Summary */
.analytics-summary {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.summary-card {
  text-align: center;
  padding: 1rem;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 8px;
}

.summary-number {
  font-size: 2rem;
  font-weight: bold;
  color: #3b82f6;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.summary-label {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Chart Container */
.chart-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.chart-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

.chart-wrapper {
  height: 400px;
  position: relative;
  width: 100%;
}

.chart-canvas {
  max-height: 100%;
  max-width: 100%;
}

/* Empty States */
.no-selection, .no-data, .coming-soon {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .selection-banner .flex {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .athlete-select {
    width: 100%;
  }
  
  .chart-wrapper {
    height: 300px;
  }
  
  .summary-card {
    margin-bottom: 1rem;
  }
}
</style>

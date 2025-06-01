<template>
  <div 
    class="periodization-card rounded-xl p-6 cursor-pointer relative"
    @click="$emit('view', periodization.PERIODIZATION_ID)"
  >
    <!-- Header -->
    <div class="flex justify-between items-start mb-4">
      <h3 class="text-xl font-bold text-gray-800">
        {{ periodization.PERIODIZATION_NAME }}
      </h3>
      <div class="flex space-x-2">
        <button 
          @click.stop="$emit('delete', periodization.PERIODIZATION_ID)"
          class="text-red-500 hover:text-red-700 transition duration-200"
        >
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
    
    <!-- Progress Section -->
    <div class="mb-6">
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm font-semibold text-gray-700">Napredek</span>
        <span class="text-sm font-bold text-gray-700">{{ periodization.progress }}%</span>
      </div>
      <div class="progress-bg rounded-full h-3">
        <div 
          class="progress-fill rounded-full h-3 transition-all duration-500"
          :style="{ width: periodization.progress + '%' }"
        ></div>
      </div>
    </div>
    
    <!-- Footer Info -->
    <div class="flex justify-between items-center text-sm text-gray-500">
      <!-- Athlete Info -->
      <div class="flex items-center">
        <i class="fas fa-user mr-2"></i>
        <span>{{ periodization.ATHLETE_NAME }}</span>
      </div>
      
      <!-- Created Date -->
      <div class="flex items-center">
        <i class="fas fa-calendar mr-1"></i>
        <span>{{ formatDate(periodization.DATE_CREATED) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PeriodizationCard',
  props: {
    periodization: {
      type: Object,
      required: true
    }
  },
  emits: ['view', 'delete'],
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
.periodization-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.periodization-card:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.progress-bg {
  background: #e5e7eb;
}

.progress-fill {
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
}
</style>

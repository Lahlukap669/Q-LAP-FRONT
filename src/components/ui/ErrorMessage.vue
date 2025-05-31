<template>
  <div class="error-card rounded-xl p-8 text-center">
    <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
    <h3 class="text-xl font-bold text-gray-800 mb-2">Error Loading Data</h3>
    <p class="text-gray-600 mb-4">{{ message }}</p>
    <BaseButton
      variant="primary"
      @click="$emit('retry')"
    >
      <i class="fas fa-redo mr-2"></i>Try Again
    </BaseButton>
  </div>
</template>

<script>
import BaseButton from './BaseButton.vue'

export default {
  name: 'ErrorMessage',
  components: {
    BaseButton
  },
  props: {
    message: {
      type: String,
      required: true
    }
  },
  emits: ['retry']
}
</script>

<style scoped>
.error-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}
</style>

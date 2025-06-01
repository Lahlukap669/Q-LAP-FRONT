<template>
  <div class="empty-state rounded-xl p-12 text-center">
    <i class="fas fa-calendar-plus text-6xl text-gray-400 mb-4"></i>
    <h3 class="text-xl font-bold text-gray-700 mb-2">Ni najdenih ciklizacij.</h3>
    <p class="text-gray-500 mb-6">Ustvari prvo ciklizacijo, da začneš.</p>
    <BaseButton
      variant="primary"
      @click="$emit('create')"
    >
      <i class="fas fa-plus mr-2 text-sm"></i>Ustvari ciklizacijo
    </BaseButton>
  </div>
</template>

<script>
import BaseButton from '../ui/BaseButton.vue'

export default {
  name: 'EmptyState',
  components: {
    BaseButton
  },
  emits: ['create']
}
</script>

<style scoped>
.empty-state {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}
</style>

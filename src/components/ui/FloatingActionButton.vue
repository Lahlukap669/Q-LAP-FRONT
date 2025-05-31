<template>
  <button 
    @click="$emit('click')"
    class="floating-add-button fixed bottom-6 right-6 w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center"
    style="z-index: 1000;"
  >
    <i class="fas fa-plus text-xl"></i>
  </button>
</template>

<script>
export default {
  name: 'FloatingActionButton',
  emits: ['click']
}
</script>

<style scoped>
.floating-add-button {
  box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4);
}

.floating-add-button:hover {
  box-shadow: 0 8px 25px rgba(34, 197, 94, 0.6);
}
</style>

<template>
  <div class="text-center py-12">
    <i class="fas fa-spinner fa-spin text-4xl text-white mb-4"></i>
    <p class="text-white text-lg">{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    message: {
      type: String,
      default: 'Nalaganje...'
    }
  }
}
</script>

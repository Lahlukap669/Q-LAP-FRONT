<template>
  <div class="min-h-screen content-bg flex items-center justify-center p-4">
    <div class="form-card rounded-xl overflow-hidden max-w-md w-full">
      <!-- Header with green background -->
      <div class="header-bg p-8 text-center">
        <h1 class="text-4xl font-bold text-white tracking-wider mb-2">Q-LAP</h1>
        <p class="text-white/90 text-sm">Quick Layered Annual Periodization</p>
      </div>
      
      <!-- Form content with white background -->
      <div class="form-content p-8">
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginCard'
}
</script>

<style scoped>
.content-bg {
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
}

.form-card {
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.header-bg {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.form-content {
  background: rgba(255, 255, 255, 0.95);
}
</style>

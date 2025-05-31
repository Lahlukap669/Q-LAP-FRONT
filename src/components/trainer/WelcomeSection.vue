<template>
  <div class="welcome-section rounded-xl p-8 mb-8">
    <h2 class="text-3xl font-bold text-white mb-2">
      Welcome back, Trainer!
    </h2>
    <p class="text-white/90 text-lg">
      Manage your periodization plans and track athlete progress.
    </p>
  </div>
</template>

<script>
export default {
  name: 'WelcomeSection'
}
</script>

<style scoped>
.welcome-section {
  background: transparent;
  backdrop-filter: blur(10px);
}
</style>

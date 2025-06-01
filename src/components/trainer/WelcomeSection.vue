<template>
  <div class="welcome-section rounded-xl p-8 mb-8">
    <h2 class="text-3xl font-bold text-white mb-2">
      Trener, dobrodošel nazaj!
    </h2>
    <p class="text-white/90 text-lg">
      Upravljaj s svojimi ciklizacijami in spremljaj napredek špotnikov.
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

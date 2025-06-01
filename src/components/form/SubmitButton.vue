<template>
  <button 
    type="submit"
    :disabled="disabled"
    class="submit-button w-full py-3 px-6 text-white font-bold text-lg rounded-xl transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: 'SubmitButton',
  props: {
    loading: Boolean,
    disabled: Boolean
  }
}
</script>

<style scoped>
.submit-button {
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6);
}
</style>

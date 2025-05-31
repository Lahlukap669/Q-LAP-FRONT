<template>
  <button 
    :type="type"
    :disabled="disabled"
    :class="buttonClasses"
    @click="$emit('click')"
    class="w-full py-3 px-6 font-bold text-lg rounded-xl transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
    <i v-else-if="icon" :class="icon" class="mr-2"></i>
    <slot>{{ text }}</slot>
  </button>
</template>

<script>
export default {
  name: 'BaseButton',
  props: {
    type: {
      type: String,
      default: 'button'
    },
    variant: {
      type: String,
      default: 'primary'
    },
    text: String,
    icon: String,
    loading: Boolean,
    disabled: Boolean
  },
  emits: ['click'],
  computed: {
    buttonClasses() {
      const variants = {
        primary: 'login-button text-white',
        secondary: 'secondary-button text-white',
        link: 'text-blue-600 hover:text-blue-800 bg-transparent p-0'
      }
      return variants[this.variant] || variants.primary
    }
  }
}
</script>

<style scoped>
.login-button {
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6);
}

.secondary-button {
  background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
}

.secondary-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6);
}
</style>

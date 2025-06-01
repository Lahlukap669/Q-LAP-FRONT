<template>
  <div class="mb-4 relative">
    <label v-if="label" :for="id" class="block text-gray-700 font-medium mb-2">
      <i class="fas fa-lock mr-2 text-blue-500"></i>
      {{ label }}
    </label>
    <div class="relative">
      <input 
        :id="id"
        :type="showPassword ? 'text' : 'password'"
        :placeholder="placeholder"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :disabled="disabled"
        :required="required"
        class="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
      >
      <button
        type="button"
        @click="showPassword = !showPassword"
        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition duration-200"
      >
        <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PasswordField',
  props: {
    id: String,
    label: String,
    placeholder: String,
    modelValue: String,
    disabled: Boolean,
    required: Boolean
  },
  emits: ['update:modelValue'],
  data() {
    return {
      showPassword: false
    }
  }
}
</script>

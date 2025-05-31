<template>
  <div class="mb-4">
    <label v-if="label" :for="id" class="block text-gray-700 font-medium mb-2">
      <i v-if="icon" :class="icon" class="mr-2 text-blue-500"></i>
      {{ label }}
    </label>
    <input 
      :id="id"
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :disabled="disabled"
      :required="required"
      class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none input-focus transition duration-200"
    >
  </div>
</template>

<script>
export default {
  name: 'BaseInput',
  props: {
    id: String,
    type: {
      type: String,
      default: 'text'
    },
    label: String,
    icon: String,
    placeholder: String,
    modelValue: String,
    disabled: Boolean,
    required: Boolean
  },
  emits: ['update:modelValue']
}
</script>

<style scoped>
.input-focus:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
  border-color: #3b82f6;
}
</style>

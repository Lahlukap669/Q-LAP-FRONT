<template>
  <div class="flex items-start mb-4">
    <input 
      :id="id"
      type="checkbox"
      :checked="modelValue"
      @change="$emit('update:modelValue', $event.target.checked)"
      :disabled="disabled"
      :required="required"
      class="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
    >
    <label :for="id" class="ml-3 text-sm text-gray-700 cursor-pointer">
      <slot></slot>
    </label>
  </div>
</template>

<script>
export default {
  name: 'CheckboxField',
  props: {
    id: String,
    modelValue: Boolean,
    disabled: Boolean,
    required: Boolean
  },
  emits: ['update:modelValue']
}
</script>

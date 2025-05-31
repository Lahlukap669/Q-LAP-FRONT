<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Username Field -->
    <BaseInput
      id="email"
      type="email"
      label="Username"
      icon="fas fa-user"
      placeholder="Enter your username"
      v-model="form.email"
      :disabled="loading"
      required
    />

    <!-- Password Field -->
    <BaseInput
      id="password"
      type="password"
      label="Password"
      icon="fas fa-lock"
      placeholder="Enter your password"
      v-model="form.password"
      :disabled="loading"
      required
    />

    <!-- Single Login Button -->
    <BaseButton
      type="submit"
      variant="primary"
      :loading="loading"
      :disabled="loading"
    >
      {{ loading ? 'Logging in...' : 'Login' }}
    </BaseButton>
  </form>
</template>

<script>
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

export default {
  name: 'LoginForm',
  components: {
    BaseInput,
    BaseButton
  },
  props: {
    loading: Boolean
  },
  emits: ['submit'],
  data() {
    return {
      form: {
        email: '',
        password: ''
      }
    }
  },
  methods: {
    handleSubmit() {
      // Emit the form data to parent
      this.$emit('submit', this.form)
    }
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Name Fields Row -->
    <div class="grid grid-cols-2 gap-4">
      <InputField
        id="firstName"
        type="text"
        label="Ime"
        icon="fas fa-user"
        placeholder="John"
        v-model="form.firstName"
        :disabled="loading"
        required
      />
      <InputField
        id="lastName"
        type="text"
        label="Priimek"
        icon="fas fa-user"
        placeholder="Doe"
        v-model="form.lastName"
        :disabled="loading"
        required
      />
    </div>

    <!-- Email Field -->
    <InputField
      id="email"
      type="email"
      label="Email"
      icon="fas fa-envelope"
      placeholder="john.doe@example.com"
      v-model="form.email"
      :disabled="loading"
      required
    />

    <!-- Phone Number Field -->
    <InputField
      id="phoneNumber"
      type="tel"
      label="Telefonska številka"
      icon="fas fa-phone"
      placeholder="+1 (555) 123-4567"
      v-model="form.phoneNumber"
      :disabled="loading"
      required
    />

    <!-- Password Field -->
    <PasswordField
      id="password"
      label="Geslo"
      placeholder="Ustvari geslo"
      v-model="form.password"
      :disabled="loading"
      required
    />

    <!-- Confirm Password Field -->
    <PasswordField
      id="confirmPassword"
      label="Potrdite geslo"
      placeholder="Potrdi geslo"
      v-model="form.confirmPassword"
      :disabled="loading"
      required
    />

    <!-- Validation Error -->
    <div v-if="passwordError" class="text-red-500 text-sm">
      {{ passwordError }}
    </div>

    <!-- Trainer Checkbox -->
    <CheckboxField
      id="isTrainer"
      v-model="form.isTrainer"
      :disabled="loading"
    >
      <i class="fas fa-dumbbell mr-2 text-blue-500"></i>Sem trener/ka
    </CheckboxField>

    <!-- GDPR Consent Checkbox -->
    <CheckboxField
      id="gdprConsent"
      v-model="form.gdprConsent"
      :disabled="loading"
      required
    >
      Strinjam se z <a href="#" class="text-blue-600 hover:text-blue-800">določili in pogoji</a> ter z <a href="#" class="text-blue-600 hover:text-blue-800">Zasebno politiko</a>
    </CheckboxField>

    <!-- Submit Button -->
    <SubmitButton
      :loading="loading"
      :disabled="loading || !isFormValid"
      class="w-full"
    >
      <i class="fas fa-user-plus mr-2"></i>
      {{ loading ? 'Ustvarjam račun...' : 'Ustvari račun' }}
    </SubmitButton>
  </form>
</template>

<script>
import InputField from '@/components/form/InputField.vue'
import PasswordField from '@/components/form/PasswordField.vue'
import CheckboxField from '@/components/form/CheckboxField.vue'
import SubmitButton from '@/components/form/SubmitButton.vue'

export default {
  name: 'RegistrationForm',
  components: {
    InputField,
    PasswordField,
    CheckboxField,
    SubmitButton
  },
  props: {
    loading: Boolean
  },
  emits: ['submit'],
  data() {
    return {
      form: {
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        isTrainer: false,
        gdprConsent: false
      }
    }
  },
  computed: {
    passwordError() {
      if (this.form.password && this.form.confirmPassword) {
        if (this.form.password !== this.form.confirmPassword) {
          return 'Gesli se ne ujemata'
        }
        if (this.form.password.length < 6) {
          return 'Geslo mora biti dolgo vsaj 6 znakov'
        }
      }
      return null
    },
    isFormValid() {
      return (
        this.form.firstName &&
        this.form.lastName &&
        this.form.email &&
        this.form.phoneNumber &&
        this.form.password &&
        this.form.confirmPassword &&
        this.form.gdprConsent &&
        !this.passwordError
      )
    }
  },
  methods: {
    handleSubmit() {
      if (this.isFormValid) {
        this.$emit('submit', this.form)
      }
    }
  }
}
</script>

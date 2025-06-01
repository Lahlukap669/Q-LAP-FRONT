<template>
  <div class="min-h-screen content-bg flex items-center justify-center p-4">
    <div class="form-card rounded-xl overflow-hidden max-w-md w-full">
      <!-- Header with green background -->
      <div class="header-bg p-8 text-center">
        <h1 class="text-4xl font-bold text-white tracking-wider mb-2">Q-LAP</h1>
        <p class="text-white/90 text-sm">Ustvari račun</p>
      </div>
      
      <!-- Form content with white background -->
      <div class="form-content p-8">
        <RegistrationForm 
          :loading="loading"
          @submit="handleRegister"
        />
        <RegistrationFooter />
      </div>
    </div>

    <!-- Alert Component -->
    <AppAlert
      :visible="alert.show"
      :type="alert.type"
      :message="alert.message"
      @close="alert.show = false"
    />
  </div>
</template>

<script>
import axios from 'axios'
import bcrypt from 'bcryptjs'  // Import bcryptjs
import { API_ENDPOINTS } from '@/utils/api.js'
import RegistrationForm from '@/components/auth/RegistrationForm.vue'
import RegistrationFooter from '@/components/auth/RegistrationFooter.vue'
import AppAlert from '@/components/ui/AppAlert.vue'

export default {
  name: 'RegisterView',
  components: {
    RegistrationForm,
    RegistrationFooter,
    AppAlert
  },
  data() {
    return {
      loading: false,
      alert: {
        show: false,
        type: 'info',
        message: ''
      }
    }
  },
  methods: {
    showAlert(type, message) {
      this.alert = {
        show: true,
        type: type,
        message: message
      }
    },
    async handleRegister(formData) {
      this.loading = true
      
      try {   
        const response = await axios.post(`${API_ENDPOINTS.REGISTER}`, {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone_number: formData.phoneNumber,
          email: formData.email,
          password: formData.password, // Send hashed password
          role: formData.isTrainer ? 2 : 1,
          gdpr_consent: formData.gdprConsent
        })
        
        // Show success message
        this.showAlert('success', response.data.message || 'Uporabnik uspešno registriran')
        
        // Redirect to login after short delay
        setTimeout(() => {
          this.$router.push('/login')
        }, 2000)
        
      } catch (error) {
        // Handle registration error
        const errorMessage = error.response?.data?.message || 'Registracija ni uspešna. Poskusite ponovno.'
        this.showAlert('error', errorMessage)
        console.error('Registration error:', error)
      } finally {
        this.loading = false
      }
    }
  }
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
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
}

.form-content {
  background: rgba(255, 255, 255, 0.95);
}
</style>

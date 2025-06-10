<template>
  <LoginCard>
    <!-- Login Form -->
    <LoginForm 
      :loading="loading"
      @submit="handleLogin"
    />

    <!-- Footer Links -->
    <LoginFooter />
  </LoginCard>

  <!-- Beautiful Alert -->
  <AppAlert
    :visible="alert.show"
    :type="alert.type"
    :message="alert.message"
    @close="alert.show = false"
  />
</template>

<script>
import { apiClient } from '@/utils/api.js'
import LoginCard from '@/components/layout/LoginCard.vue'
import LoginForm from '@/components/auth/LoginForm.vue'
import LoginFooter from '@/components/auth/LoginFooter.vue'
import AppAlert from '@/components/ui/AppAlert.vue'

export default {
  name: 'LoginView',
  components: {
    LoginCard,
    LoginForm,
    LoginFooter,
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
    async handleLogin(formData) {
      this.loading = true
      
      try {
        // Clean API call - no manual token needed for login
        const response = await apiClient.post('/auth/login', {
          email: formData.email,
          password: formData.password  // Send plain password - let backend handle hashing
        })
        
        // Handle successful login
        const { access_token, user, message } = response.data
        
        // Store JWT token and user data
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('user', JSON.stringify(user))
        
        // Show success message
        this.showAlert('success', message || 'Uspešna prijava')
        
        // Redirect based on user role after showing alert
        setTimeout(() => {
          if (user.role === 2) { // Trainer
            this.$router.push('/trainer')
          } else if (user.role === 1) { // Athlete
            this.$router.push('/athlete')
          } else {
            // Handle other roles or default redirect
            this.$router.push('/dashboard')
          }
        }, 1500)
        
      } catch (error) {
        console.error('Napaka pri prijavi:', error)
        
        // Handle different error scenarios
        if (error.response?.status === 401) {
          this.showAlert('error', 'Napačni podatki za prijavo.')
        } else if (error.response?.status === 400) {
          this.showAlert('error', error.response.data.message || 'Neveljaven zahtevek.')
        } else if (error.response?.status >= 500) {
          this.showAlert('error', 'Napaka strežnika. Poskusi kasneje.')
        } else {
          const errorMessage = error.response?.data?.message || 'Prijava neuspešna. Poskusi ponovno.'
          this.showAlert('error', errorMessage)
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

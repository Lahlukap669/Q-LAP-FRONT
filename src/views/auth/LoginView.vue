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
import axios from 'axios'
import { API_ENDPOINTS } from '@/utils/api.js'
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
        const response = await axios.post(API_ENDPOINTS.LOGIN, {
          email: formData.email,
          password: formData.password
        })
        
        // Handle successful login
        const { access_token, user, message } = response.data
        
        // Store JWT token in localStorage
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('user', JSON.stringify(user))
        
        // Show success message
        this.showAlert('success', message || 'Uspešna prijava')
        
        // Redirect after a short delay to show the alert
        setTimeout(() => {
          if (user.role === 2) { // Trainer
            this.$router.push('/trainer')
          } else { // Athlete
            this.$router.push('/athlete')
          }
        }, 1500)
        
      } catch (error) {
        // Handle login error
        const errorMessage = error.response?.data?.message || 'Login failed. Please try again.'
        this.showAlert('error', errorMessage)
        console.error('Login error:', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

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
</template>

<script>
import axios from 'axios'
import { API_ENDPOINTS } from '@/utils/api.js'
import LoginCard from '@/components/layout/LoginCard.vue'
import LoginForm from '@/components/auth/LoginForm.vue'
import LoginFooter from '@/components/auth/LoginFooter.vue'

export default {
  name: 'LoginView',
  components: {
    LoginCard,
    LoginForm,
    LoginFooter
  },
  data() {
    return {
      loading: false
    }
  },
  methods: {
    async handleLogin(formData) {
    this.loading = true
    
    try {
        console.log('=== SENDING LOGIN REQUEST ===')
        console.log('Form data:', formData)
        console.log('API endpoint:', API_ENDPOINTS.LOGIN)
        
        const response = await axios.post(API_ENDPOINTS.LOGIN, {
        email: formData.email,
        password: formData.password
        })
        
        console.log('=== RAW RESPONSE ===')
        console.log('Full response object:', response)
        console.log('Response status:', response.status)
        console.log('Response headers:', response.headers)
        console.log('Response data:', response.data)
        
        // Check if response.data exists
        if (!response.data) {
        throw new Error('No data in response')
        }
        
        // Try to access the fields
        console.log('=== EXTRACTING FIELDS ===')
        console.log('Message:', response.data.message)
        console.log('Access token:', response.data.access_token)
        console.log('User:', response.data.user)
        
        // Handle successful login
        const { access_token, user, message } = response.data
        
        if (!access_token || !user) {
        throw new Error('Missing access_token or user in response')
        }
        
        // Store JWT token in localStorage
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('user', JSON.stringify(user))
        
        // Show success message
        alert(message || 'Uspešna prijava')
        
        // Redirect based on user role
        if (user.role === 2) { // Trainer
        this.$router.push('/trainer')
        } else { // Athlete
        this.$router.push('/athlete')
        }
        
    } catch (error) {
        console.log('=== ERROR CAUGHT ===')
        console.log('Error type:', typeof error)
        console.log('Error object:', error)
        console.log('Error message:', error.message)
        console.log('Error response:', error.response)
        
        if (error.response) {
        // Server responded with error status
        console.log('Server error data:', error.response.data)
        console.log('Server error status:', error.response.status)
        alert(error.response.data?.message || 'Server error')
        } else if (error.request) {
        // Request was made but no response
        console.log('No response received:', error.request)
        alert('No response from server')
        } else {
        // Something else happened
        console.log('Request setup error:', error.message)
        alert('Request error: ' + error.message)
        }
    } finally {
        this.loading = false
    }
    }

  }
}
</script>

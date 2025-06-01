<template>
  <div class="mt-6 text-center space-y-3">
    <!-- Forgot Password Link -->
    <div>
      <a href="#" class="text-blue-600 hover:text-blue-800 text-sm transition duration-200">
        Forgot password?
      </a>
    </div>
    
    <!-- Sign Up Link -->
    <div class="text-gray-600 text-sm">
      Don't have an account? 
      <router-link to="/register" class="text-green-600 hover:text-green-800 font-semibold transition duration-200">
        Sign up
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginFooter'
}
</script>

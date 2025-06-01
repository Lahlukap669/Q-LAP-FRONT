<template>
  <div class="mt-6 text-center space-y-3">
    <!-- Forgot Password Link -->
    <div>
      <a href="#" class="text-blue-600 hover:text-blue-800 text-sm transition duration-200">
        Pozabljeno geslo?
      </a>
    </div>
    
    <!-- Sign Up Link -->
    <div class="text-gray-600 text-sm">
      Še nimaš računa? 
      <router-link to="/register" class="text-green-600 hover:text-green-800 font-semibold transition duration-200">
        Registracija
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginFooter'
}
</script>

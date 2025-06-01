<template>
  <header class="header-gradient shadow-lg relative">
    <div class="container mx-auto px-4 py-4 flex justify-between items-center">
      <!-- Logo Section -->
      <div>
        <h1 class="text-3xl lg:text-4xl font-bold text-white tracking-wider">Q-LAP</h1>
        <p class="text-white/90 text-sm">Quick Layered Annual Periodization</p>
      </div>
      
      <!-- Desktop Navigation & User Menu -->
      <div class="flex items-center space-x-6">
        <!-- Desktop Navigation -->
        <nav class="hidden lg:flex items-center space-x-6 text-white">
          <router-link to="/trainer" class="flex items-center hover:text-white/80 transition duration-200">
            <i class="fas fa-home mr-2"></i>Nadzorna plošča
          </router-link>
          <router-link to="/trainer/my-athletes" class="flex items-center hover:text-white/80 transition duration-200">
            <i class="fas fa-users mr-2"></i>Športniki
          </router-link>
          <router-link to="/trainer/analytics" class="flex items-center hover:text-white/80 transition duration-200">
            <i class="fas fa-chart-line mr-2"></i>Analitika
          </router-link>
          <router-link to="/trainer/tests" class="flex items-center hover:text-white/80 transition duration-200">
            <i class="fas fa-flask mr-2"></i>Testi
          </router-link>
        </nav>

        <!-- Desktop User Dropdown -->
        <div class="hidden lg:block relative">
          <button @click="toggleUserMenu" class="flex items-center text-white hover:text-white/80 transition duration-200">
            <i class="fas fa-user-circle text-xl mr-2"></i>
            <span class="hidden md:block">{{ userFullName }}</span>
            <i class="fas fa-chevron-down ml-2"></i>
          </button>
          
          <!-- User Dropdown Menu -->
          <div v-if="showUserMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
            <router-link to="/trainer/profile" class="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition duration-200">
              <i class="fas fa-user mr-2"></i>Profil
            </router-link>
            <router-link to="/trainer/settings" class="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition duration-200">
              <i class="fas fa-cog mr-2"></i>Nastavitve
            </router-link>
            <hr class="my-1">
            <button @click="handleLogout" class="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition duration-200">
              <i class="fas fa-sign-out-alt mr-2"></i>Odjava
            </button>
          </div>
        </div>

        <!-- Mobile Hamburger Menu -->
        <button 
          @click="toggleMobileNav" 
          class="lg:hidden flex items-center text-white hover:text-white/80 transition duration-200"
        >
          <i 
            class="fas fa-bars text-xl transition-transform duration-300"
            :class="{ 'rotate-90': showMobileNav }"
          ></i>
        </button>
      </div>
    </div>

    <!-- Mobile Navigation Menu -->
    <transition name="mobile-nav">
      <div v-if="showMobileNav" class="lg:hidden absolute top-full left-0 w-full bg-white shadow-lg z-40">
        <nav class="container mx-auto px-4 py-4">
          <!-- Mobile Navigation Links -->
          <div class="space-y-4 mb-6">
            <router-link 
              to="/trainer" 
              @click="closeMobileNav"
              class="flex items-center text-gray-700 hover:text-blue-600 hover:bg-gray-50 py-3 px-4 rounded-lg transition duration-200"
            >
              <i class="fas fa-home mr-4 text-lg"></i>
              <span class="text-lg">Nadzorna plošča</span>
            </router-link>
            <router-link 
              to="/trainer/my-athletes" 
              @click="closeMobileNav"
              class="flex items-center text-gray-700 hover:text-blue-600 hover:bg-gray-50 py-3 px-4 rounded-lg transition duration-200"
            >
              <i class="fas fa-users mr-4 text-lg"></i>
              <span class="text-lg">Športniki</span>
            </router-link>
            <router-link 
              to="/trainer/analytics" 
              @click="closeMobileNav"
              class="flex items-center text-gray-700 hover:text-blue-600 hover:bg-gray-50 py-3 px-4 rounded-lg transition duration-200"
            >
              <i class="fas fa-chart-line mr-4 text-lg"></i>
              <span class="text-lg">Analitika</span>
            </router-link>
            <router-link 
              to="/trainer/tests" 
              @click="closeMobileNav"
              class="flex items-center text-gray-700 hover:text-blue-600 hover:bg-gray-50 py-3 px-4 rounded-lg transition duration-200"
            >
              <i class="fas fa-flask mr-4 text-lg"></i>
              <span class="text-lg">Testi</span>
            </router-link>
          </div>

          <!-- Mobile User Section -->
          <div class="border-t border-gray-200 pt-4">
            <div class="flex items-center mb-4 px-4">
              <i class="fas fa-user-circle text-2xl text-gray-600 mr-3"></i>
              <span class="font-semibold text-gray-800">{{ userFullName }}</span>
            </div>
            
            <div class="space-y-2">
              <router-link 
                to="/trainer/profile" 
                @click="closeMobileNav"
                class="flex items-center text-gray-700 hover:text-blue-600 hover:bg-gray-50 py-3 px-4 rounded-lg transition duration-200"
              >
                <i class="fas fa-user mr-4 text-lg"></i>
                <span class="text-lg">Profil</span>
              </router-link>
              <router-link 
                to="/trainer/settings" 
                @click="closeMobileNav"
                class="flex items-center text-gray-700 hover:text-blue-600 hover:bg-gray-50 py-3 px-4 rounded-lg transition duration-200"
              >
                <i class="fas fa-cog mr-4 text-lg"></i>
                <span class="text-lg">Nastavitve</span>
              </router-link>
              <button 
                @click="handleLogout" 
                class="flex items-center w-full text-red-600 hover:text-red-700 hover:bg-red-50 py-3 px-4 rounded-lg transition duration-200"
              >
                <i class="fas fa-sign-out-alt mr-4 text-lg"></i>
                <span class="text-lg">Odjava</span>
              </button>
            </div>
          </div>
        </nav>
      </div>
    </transition>

    <!-- Mobile Menu Overlay -->
    <div 
      v-if="showMobileNav" 
      @click="closeMobileNav"
      class="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
    ></div>
  </header>
</template>

<script>
export default {
  name: 'TrainerHeader',
  props: {
    userFullName: {
      type: String,
      default: 'Trainer'
    }
  },
  emits: ['logout'],
  data() {
    return {
      showUserMenu: false,
      showMobileNav: false
    }
  },
  methods: {
    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu
      this.showMobileNav = false // Close mobile nav if open
    },
    toggleMobileNav() {
      this.showMobileNav = !this.showMobileNav
      this.showUserMenu = false // Close user menu if open
      
      // Prevent body scroll when mobile menu is open
      if (this.showMobileNav) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    },
    closeMobileNav() {
      this.showMobileNav = false
      document.body.style.overflow = ''
    },
    handleLogout() {
      this.showUserMenu = false
      this.showMobileNav = false
      document.body.style.overflow = ''
      this.$emit('logout')
    },
    handleResize() {
      // Close mobile nav on window resize (orientation change)
      if (window.innerWidth >= 1024) {
        this.closeMobileNav()
      }
    }
  },
  mounted() {
    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.relative') && !e.target.closest('button')) {
        this.showUserMenu = false
      }
    })

    // Handle window resize
    window.addEventListener('resize', this.handleResize)

    // Handle escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeMobileNav()
        this.showUserMenu = false
      }
    })
  },
  beforeUnmount() {
    // Clean up event listeners
    window.removeEventListener('resize', this.handleResize)
    document.body.style.overflow = ''
  }
}
</script>

<style scoped>
.header-gradient {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

/* Mobile Navigation Animations */
.mobile-nav-enter-active,
.mobile-nav-leave-active {
  transition: all 0.3s ease;
}

.mobile-nav-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.mobile-nav-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Hamburger Icon Animation */
.rotate-90 {
  transform: rotate(90deg);
}

/* Active Link Styling */
.router-link-active {
  color: #90baff !important;
}

/* Mobile specific styles */
@media (max-width: 1023px) {
  .mobile-nav-menu {
    max-height: calc(100vh - 100px);
    overflow-y: auto;
  }
}
</style>

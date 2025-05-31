<template>
  <!-- Alert Overlay -->
  <transition name="alert-overlay">
    <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <transition name="alert-modal">
        <div v-if="visible" class="alert-modal rounded-xl max-w-md w-full">
          <!-- Alert Header -->
          <div class="alert-header p-6 pb-4">
            <div class="flex items-center">
              <i :class="alertIcon" class="text-3xl mr-4"></i>
              <h3 class="text-xl font-bold text-white">{{ alertTitle }}</h3>
            </div>
          </div>
          
          <!-- Alert Content -->
          <div class="alert-content bg-white p-6 pt-4">
            <p class="text-gray-700 mb-6">{{ message }}</p>
            
            <!-- Buttons -->
            <div class="flex space-x-3">
              <button 
                @click="handleConfirm"
                class="confirm-button flex-1 py-3 px-6 rounded-lg font-semibold transition duration-200"
              >
                {{ confirmText }}
              </button>
              <button 
                v-if="showCancel"
                @click="handleCancel"
                class="cancel-button flex-1 py-3 px-6 rounded-lg font-semibold transition duration-200"
              >
                {{ cancelText }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'AppAlert',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'info', // success, error, warning, info
      validator: value => ['success', 'error', 'warning', 'info'].includes(value)
    },
    message: {
      type: String,
      required: true
    },
    confirmText: {
      type: String,
      default: 'OK'
    },
    cancelText: {
      type: String,
      default: 'Cancel'
    },
    showCancel: {
      type: Boolean,
      default: false
    }
  },
  emits: ['confirm', 'cancel', 'close'],
  computed: {
    alertIcon() {
      const icons = {
        success: 'fas fa-check-circle text-green-500',
        error: 'fas fa-exclamation-circle text-red-500',
        warning: 'fas fa-exclamation-triangle text-yellow-500',
        info: 'fas fa-info-circle text-blue-500'
      }
      return icons[this.type]
    },
    alertTitle() {
      const titles = {
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Information'
      }
      return titles[this.type]
    }
  },
  methods: {
    handleConfirm() {
      this.$emit('confirm')
      this.$emit('close')
    },
    handleCancel() {
      this.$emit('cancel')
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.alert-modal {
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.alert-header {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.confirm-button {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.confirm-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
}

.cancel-button {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.cancel-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
}

/* Transitions */
.alert-overlay-enter-active,
.alert-overlay-leave-active {
  transition: opacity 0.3s ease;
}

.alert-overlay-enter-from,
.alert-overlay-leave-to {
  opacity: 0;
}

.alert-modal-enter-active,
.alert-modal-leave-active {
  transition: all 0.3s ease;
}

.alert-modal-enter-from,
.alert-modal-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}
</style>

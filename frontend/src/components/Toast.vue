<template>
  <transition name="toast">
    <div v-if="visible" 
      class="fixed z-50 top-4 right-4 max-w-md px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2"
      :class="typeClasses">
      <div class="flex-shrink-0">
        <!-- 成功图标 -->
        <svg v-if="type === 'success'" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        
        <!-- 错误图标 -->
        <svg v-else-if="type === 'error'" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        
        <!-- 警告图标 -->
        <svg v-else-if="type === 'warning'" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        
        <!-- 信息图标 -->
        <svg v-else class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>{{ message }}</div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'

export default defineComponent({
  name: 'Toast',
  props: {
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'info',
      validator: (value: string) => ['success', 'error', 'warning', 'info'].includes(value)
    },
    duration: {
      type: Number,
      default: 3000
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['close'],
  
  setup(props, { emit }) {
    const typeClasses = computed(() => {
      switch (props.type) {
        case 'success':
          return 'bg-green-100 text-green-800';
        case 'error':
          return 'bg-red-100 text-red-800';
        case 'warning':
          return 'bg-yellow-100 text-yellow-800';
        default:
          return 'bg-blue-100 text-blue-800';
      }
    });
    
    let timer: number | null = null;
    
    watch(() => props.visible, (newValue) => {
      if (newValue && props.duration > 0) {
        if (timer) clearTimeout(timer);
        timer = window.setTimeout(() => {
          emit('close');
        }, props.duration);
      }
    });
    
    return {
      typeClasses
    };
  }
});
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style> 
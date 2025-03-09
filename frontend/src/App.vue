<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <header class="bg-blue-700 shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <router-link to="/" class="flex items-center">
                <svg class="h-8 w-8 mr-2" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <g>
                    <!-- 背景圆 -->
                    <circle cx="100" cy="100" r="90" fill="#ffffff" />
                    <circle cx="100" cy="100" r="80" fill="#60a5fa" />

                    <!-- 代码标签 <G/> -->
                    <path d="M40 70 L60 70 L60 80 L50 80 L50 120 L60 120 L60 130 L40 130 L40 70" fill="white" />
                    <path
                      d="M70 70 Q50 70 50 90 L50 110 Q50 130 70 130 L100 130 Q120 130 120 110 L120 100 L90 100 L90 110 L100 110 Q100 115 95 115 L75 115 Q70 115 70 110 L70 90 Q70 85 75 85 L95 85 Q100 85 100 90 L100 90 L120 90 L120 90 Q120 70 100 70 L70 70"
                      fill="white" />
                    <path d="M130 70 L150 70 L150 80 L140 80 L140 120 L150 120 L150 130 L130 130 L130 70"
                      fill="white" />
                  </g>
                </svg>
                <span class="text-xl font-bold text-white">GitShop</span>
              </router-link>
            </div>
            <!-- 桌面端导航 - 只在中等屏幕及以上显示 -->
            <nav class="hidden md:ml-6 md:flex md:space-x-8">
              <router-link to="/"
                class="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-white hover:text-blue-100 hover:border-blue-100">
                <svg class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {{ $t('nav.home') }}
              </router-link>
              <router-link to="/category"
                class="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-white hover:text-blue-100 hover:border-blue-100">
                <svg class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {{ $t('nav.products') }}
              </router-link>
              <router-link to="/distributor"
                class="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-white hover:text-blue-100 hover:border-blue-100">
                <svg class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {{ $t('nav.distributor') }}
              </router-link>
            </nav>
          </div>
          <div class="flex items-center">
            <!-- 移动端汉堡菜单按钮 -->
            <button @click="toggleMobileMenu"
              class="md:hidden p-2 rounded-md text-white hover:text-blue-100 focus:outline-none">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path v-if="showMobileMenu" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M6 18L18 6M6 6l12 12" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <router-link to="/cart" class="relative flex items-center text-white hover:text-blue-100 mr-6">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <!-- 购物车徽章 -->
              <span v-if="cartStore.carts.length > 0"
                class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {{ cartStore.carts.length }}
              </span>
            </router-link>
            <div class="relative">
              <button @click="toggleLanguageMenu" class="flex items-center text-white hover:text-blue-100">
                <span class="mr-1">{{ currentLanguage }}</span>
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div v-if="showLanguageMenu"
                class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <div class="py-1">
                  <a href="#" @click.prevent="changeLanguage('zh')"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">中文</a>
                  <a href="#" @click.prevent="changeLanguage('en')"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">English</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 移动端导航菜单 -->
      <div v-if="showMobileMenu" class="md:hidden bg-blue-600">
        <div class="px-2 pt-2 pb-3 space-y-1">
          <router-link to="/"
            class="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-500 hover:text-white"
            @click="showMobileMenu = false">
            <div class="flex items-center">
              <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {{ $t('nav.home') }}
            </div>
          </router-link>
          <router-link to="/category"
            class="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-500 hover:text-white"
            @click="showMobileMenu = false">
            <div class="flex items-center">
              <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {{ $t('nav.products') }}
            </div>
          </router-link>
          <router-link to="/distributor"
            class="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-500 hover:text-white"
            @click="showMobileMenu = false">
            <div class="flex items-center">
              <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {{ $t('nav.distributor') }}
            </div>
          </router-link>
        </div>
      </div>
    </header>

    <main class="flex-grow">
      <router-view />
    </main>

    <footer class="bg-blue-800 text-white mt-auto">
      <div class="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 class="text-lg font-semibold mb-4">{{ $t('footer.about') }}</h3>
            <p class="text-blue-200">{{ $t('footer.description') }}</p>
          </div>
          <div>
            <h3 class="text-lg font-semibold mb-4">{{ $t('footer.links') }}</h3>
            <ul class="space-y-2">
              <li><a :href="store.githubUrl" target="_blank"
                  class="text-blue-200 hover:text-white">GitHub</a></li>
              <li><router-link to="/about" class="text-blue-200 hover:text-white">{{ $t('footer.about_us')
                  }}</router-link></li>
              <li><router-link to="/terms" class="text-blue-200 hover:text-white">{{ $t('footer.terms') }}</router-link>
              </li>
            </ul>
          </div>
          <div>
            <h3 class="text-lg font-semibold mb-4">{{ $t('footer.contact') }}</h3>
            <p class="text-blue-200">{{ $t('footer.contact_info') }}</p>
          </div>
        </div>
        <div class="mt-8 border-t border-blue-700 pt-8 flex justify-between items-center">
          <p class="text-blue-200">
            &copy; {{ new Date().getFullYear() }} GitShop. {{ $t('footer.rights') }}
          </p>
          <div class="flex space-x-4">
            <a :href="store.githubUrl" target="_blank" class="text-blue-200 hover:text-white">
              <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clip-rule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore, useCartStore } from '@/store'
import { useRoute } from 'vue-router'

const { locale, t } = useI18n()
const showLanguageMenu = ref(false)
const showMobileMenu = ref(false)
const currentLanguage = ref(locale.value === 'zh' ? '中文' : 'English')
const store = useStore()
const cartStore = useCartStore()
const route = useRoute()

// 加载产品数据
const initData = async () => {
  store.loading = true
  store.error = null
  store.locale = locale.value as Locale
  if (route.query.ref) {
    const distributor_id = route.query.ref as string
    localStorage.setItem('distributor_id', distributor_id)
    store.distributor_id = distributor_id
  } else {
    const distributor_id = localStorage.getItem('distributor_id')
    if (distributor_id) {
      store.distributor_id = distributor_id
    }
  }

  try {
    await store.initData()
  } catch (err) {
    store.error = t('common.error')
    console.error('Error loading products:', err)
  } finally {
    store.loading = false
  }
}
// 组件挂载时加载购物车数据
onMounted(() => {
  initData()
})

const toggleLanguageMenu = () => {
  showLanguageMenu.value = !showLanguageMenu.value
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const changeLanguage = (lang: Locale) => {
  locale.value = lang
  store.locale = lang
  currentLanguage.value = lang === 'zh' ? '中文' : 'English'
  showLanguageMenu.value = false
}

</script>

<style>
:root {
  --primary-color: #1d4ed8;
  --secondary-color: #3b82f6;
  --accent-color: #60a5fa;
}

.rotating {
  animation: spin 20s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>

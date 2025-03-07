<template>
  <div>
    <!-- 页面标题 Page Title -->
    <!-- <div class="text-center py-8 bg-gradient-to-r from-primary-600 to-secondary-600">
      <div class="logo-container">
        <div class="logo-wrapper">
          <svg class="logo rotating" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <g>
              <circle cx="100" cy="100" r="90" fill="#1d4ed8" />
              
              <path d="M40 70 L60 70 L60 80 L50 80 L50 120 L60 120 L60 130 L40 130 L40 70" fill="white" />
              <path d="M70 70 Q50 70 50 90 L50 110 Q50 130 70 130 L100 130 Q120 130 120 110 L120 100 L90 100 L90 110 L100 110 Q100 115 95 115 L75 115 Q70 115 70 110 L70 90 Q70 85 75 85 L95 85 Q100 85 100 90 L100 90 L120 90 L120 90 Q120 70 100 70 L70 70" fill="white" />
              <path d="M130 70 L150 70 L150 80 L140 80 L140 120 L150 120 L150 130 L130 130 L130 70" fill="white" />
            </g>
          </svg>
          <span class="logo-text">GitShop</span>
        </div>
      </div>
      <p class="mt-2 text-white text-lg">基于GitHub平台的开源电子商务解决方案，专为程序员设计</p>
    </div> -->
    
    <!-- 加载状态 Loading State -->
    <div v-if="store.loading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      <span class="ml-3 text-blue-600">{{ $t('common.loading') }}</span>
    </div>
    
    <!-- 错误提示 Error Message -->
    <div v-else-if="store.error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-auto max-w-4xl my-8">
      <p>{{ store.error }}</p>
    </div>
    
    <!-- 首页内容 Home Content -->
    <div v-else>
      <!-- 英雄区域 Hero Section -->
      <div class="text-center py-8 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div class="text-center">
            <h1 class="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
              <span class="block">{{ $t('home.hero.title') }}</span>
              <span class="block text-blue-200 mt-2">{{ $t('home.hero.subtitle') }}</span>
            </h1>
          </div>
        </div>
      </div>
      
      <!-- GitHub项目链接 GitHub Project Link -->
      <div class="bg-white py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex flex-col md:flex-row items-center justify-between p-6 bg-blue-50 rounded-lg">
            <div class="flex-1 mb-4 md:mb-0 md:mr-6">
              <h2 class="text-2xl font-bold text-blue-800 mb-2">开源项目</h2>
              <p class="text-blue-600">GitShop是一个完全开源的项目，欢迎查看源代码、提交问题或贡献代码。</p>
            </div>
            <a :href="store.githubUrl" target="_blank" class="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              <svg class="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </div>
      
      
      <!-- 所有产品 All Products -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 class="text-3xl font-extrabold text-gray-900 text-center mb-12">{{ $t('home.all_products.title') }}</h2>
        
        <div v-if="products.length === 0" class="text-center py-8">
          <p class="text-gray-500">{{ $t('home.all_products.empty') }}</p>
        </div>
        
        <div v-else class="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          <div v-for="product in products" :key="product.id" class="group relative bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer" @click="navigateToProduct(product.id)">
            <div class="w-full aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
              <img 
                :src="product.main_image.src" 
                :alt="product.main_image.alt" 
                class="w-full h-48 object-cover rounded-t-lg"
                @error="handleImageError"
              />
            </div>
            <div class="mt-4">
              <h3 class="text-sm font-medium text-gray-900">
                <router-link :to="`/product/${product.id}`">
                  {{ product.name }}
                </router-link>
              </h3>
              <p class="mt-1 text-sm text-gray-500 line-clamp-2">{{ product.description }}</p>
              <div class="mt-2 flex justify-between items-center">
                <p class="text-sm font-medium text-gray-900">
                  {{ product.price }} {{ $t('common.currency') }}
                  <span v-if="product.promotions" class="ml-1 text-xs text-red-600">
                    促销
                  </span>
                </p>
                <div class="flex items-center">
                  <svg class="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span class="ml-1 text-xs text-gray-500">{{ product.rating }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 关于我们 About Us -->
      <div class="bg-blue-50 py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="lg:text-center">
            <h2 class="text-base text-blue-600 font-semibold tracking-wide uppercase">{{ $t('home.about.title') }}</h2>
            <p class="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {{ $t('home.about.subtitle') }}
            </p>
            <p class="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              {{ $t('home.about.description') }}
            </p>
          </div>

          <div class="mt-10">
            <dl class="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div class="relative">
                <dt>
                  <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <p class="ml-16 text-lg leading-6 font-medium text-gray-900">{{ $t('home.about.features.open_source.title') }}</p>
                </dt>
                <dd class="mt-2 ml-16 text-base text-gray-500">
                  {{ $t('home.about.features.open_source.description') }}
                </dd>
              </div>

              <div class="relative">
                <dt>
                  <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <p class="ml-16 text-lg leading-6 font-medium text-gray-900">{{ $t('home.about.features.secure.title') }}</p>
                </dt>
                <dd class="mt-2 ml-16 text-base text-gray-500">
                  {{ $t('home.about.features.secure.description') }}
                </dd>
              </div>

              <div class="relative">
                <dt>
                  <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                  </div>
                  <p class="ml-16 text-lg leading-6 font-medium text-gray-900">{{ $t('home.about.features.distribution.title') }}</p>
                </dt>
                <dd class="mt-2 ml-16 text-base text-gray-500">
                  {{ $t('home.about.features.distribution.description') }}
                </dd>
              </div>

              <div class="relative">
                <dt>
                  <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p class="ml-16 text-lg leading-6 font-medium text-gray-900">{{ $t('home.about.features.fast_delivery.title') }}</p>
                </dt>
                <dd class="mt-2 ml-16 text-base text-gray-500">
                  {{ $t('home.about.features.fast_delivery.description') }}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useStore } from '@/store'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()


// 获取所有产品 Get all products
const products = computed(() => store.products)


// 处理图片加载错误 Handle image loading error
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  if (target && target.src !== '/images/placeholder.png') {
    target.src = '/images/placeholder.png';
  }
}

// 导航到产品详情页 Navigate to product detail page
const navigateToProduct = (productId: string) => {
  router.push(`/product/${productId}`)
}

</script>

<style scoped>
.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
}

.logo-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo {
  width: 100%;
  height: 100%;
}

.rotating {
  animation: spin 20s linear infinite;
}

.logo-text {
  position: absolute;
  bottom: -35px;
  font-size: 24px;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
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

<template>
  <div class="bg-gray-50 min-h-screen">
    <!-- 分类头部横幅 -->
    <div v-if="category" class="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white">
      <div class="container mx-auto px-4 py-12">
        <h1 class="text-4xl font-bold mb-2">{{ category.name }}</h1>
        <p class="text-xl text-blue-100 mb-4">{{ category.description }}</p>
      </div>
    </div>
    <div v-else class="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white">
      <div class="container mx-auto px-4 py-12">
        <h1 class="text-4xl font-bold mb-2">{{ $t('products.all_products') }}</h1>
        <p class="text-xl text-blue-100">{{ $t('products.browse_all_description') }}</p>
      </div>
    </div>

    <div class="container mx-auto px-4 py-8">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- 左侧筛选面板 -->
        <div class="lg:w-1/4">
          <div class="bg-white rounded-lg shadow-sm p-6 sticky top-4">
            <h2 class="text-lg font-semibold mb-6 pb-2 border-b border-gray-200">{{ $t('products.filter_by_category')
            }}</h2>

            <!-- 分类选择 -->
            <div class="mb-6">
              <div class="flex flex-col space-y-2">
                <button @click="navigateToCategory('')"
                  class="px-4 py-2 rounded-md text-sm text-left transition-all duration-200 flex items-center justify-between"
                  :class="!categoryId ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'">
                  {{ $t('products.all_categories') }}
                  <span v-if="!categoryId" class="w-2 h-2 rounded-full bg-blue-600"></span>
                </button>
                <button v-for="category in categories" :key="category.id" @click="navigateToCategory(category.id)"
                  class="px-4 py-2 rounded-md text-sm text-left transition-all duration-200 flex items-center justify-between"
                  :class="categoryId === category.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'">
                  {{ category.name }}
                  <span v-if="categoryId === category.id" class="w-2 h-2 rounded-full bg-blue-600"></span>
                </button>
              </div>
            </div>

            <!-- 价格区间 -->
            <div class="mb-6">
              <h3 class="font-medium text-gray-900 mb-3">{{ $t('products.price_range') }}</h3>
              <div class="flex items-center space-x-2">
                <input type="number" v-model="priceMin" placeholder="Min"
                  class="w-full p-2 border border-gray-300 rounded-md text-sm" />
                <span class="text-gray-500">-</span>
                <input type="number" v-model="priceMax" placeholder="Max"
                  class="w-full p-2 border border-gray-300 rounded-md text-sm" />
              </div>
            </div>

            <!-- 评分筛选 -->
            <div class="mb-6">
              <h3 class="font-medium text-gray-900 mb-3">{{ $t('products.rating_above') }}</h3>
              <div class="flex items-center space-x-2">
                <input type="range" v-model="minRating" min="0" max="5" step="1"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                <span class="text-sm font-medium text-gray-700">{{ minRating }}</span>
              </div>
              <div class="flex items-center mt-2">
                <div class="flex">
                  <svg v-for="i in 5" :key="i" class="h-4 w-4"
                    :class="i <= minRating ? 'text-yellow-400' : 'text-gray-300'" fill="currentColor"
                    viewBox="0 0 20 20">
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <span class="ml-1 text-xs text-gray-500">{{ $t('products.rating_above') }}</span>
              </div>
            </div>

            <!-- 库存筛选 -->
            <div class="mb-6">
              <label class="flex items-center">
                <input type="checkbox" v-model="inStockOnly" class="form-checkbox h-4 w-4 text-blue-600" />
                <span class="ml-2 text-sm text-gray-700">{{ $t('products.in_stock_only') }}</span>
              </label>
            </div>

            <!-- 筛选按钮 -->
            <div class="flex space-x-2">
              <button @click="applyFilters"
                class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                {{ $t('products.apply_filter') }}
              </button>
              <button @click="resetFilters"
                class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm">
                {{ $t('products.reset_filter') }}
              </button>
            </div>
          </div>
        </div>

        <!-- 右侧商品列表 -->
        <div class="lg:w-3/4">
          <!-- 排序和统计信息 -->
          <div
            class="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h2 class="text-lg font-semibold text-gray-800 mb-3 sm:mb-0">
              <span v-if="category">{{ category.name }}</span>
              <span v-else>{{ $t('products.title') }}</span>
              <span class="text-sm font-normal text-gray-500 ml-2">({{ filteredAndSortedProducts.length }} {{
                $t('products.items_count') }})</span>
            </h2>
            <div class="flex items-center">
              <label for="sort" class="mr-2 text-sm text-gray-700">{{ $t('products.sort_by') }}:</label>
              <select id="sort" v-model="sortOption" class="border border-gray-300 rounded-md text-sm p-2">
                <option value="price_low_high">{{ $t('products.sort_options.price_low_high') }}</option>
                <option value="price_high_low">{{ $t('products.sort_options.price_high_low') }}</option>
                <option value="newest">{{ $t('products.sort_options.newest') }}</option>
                <option value="popularity">{{ $t('products.sort_options.popularity') }}</option>
              </select>
            </div>
          </div>

          <!-- 商品网格 -->
          <div v-if="filteredAndSortedProducts.length === 0" class="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-gray-500 text-lg mt-4">{{ $t('products.no_products') }}</p>
            <button @click="resetFilters"
              class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              {{ $t('products.view_all_products') }}
            </button>
          </div>

          <div v-else class="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            <div v-for="product in filteredAndSortedProducts" :key="product.id"
              class="group bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer"
              @click="navigateToProduct(product.id)">
              <div class="relative">
                <div class="w-full aspect-w-1 aspect-h-1 bg-gray-200 overflow-hidden">
                  <img :src="product.main_image.src" :alt="product.main_image.alt"
                    class="w-full h-48 object-center object-cover group-hover:opacity-90 transition-opacity"
                    @error="handleImageError" />
                </div>
                <!-- 折扣标签 -->
                <div v-if="product.promotions?.discount_percent"
                  class="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  -{{ product.promotions?.discount_percent }}%
                </div>
                <template v-else v-for="(discount, index) in (product.promotions?.threshold_discounts || product.promotions?.tier_pricing || [])">
                  <div
                    class="absolute right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded"
                    :class="{'top-2': index === 0, 'top-10': index === 1}">
                    {{ discount.description }}
                  </div>
                </template>
              </div>

              <div class="p-4">
                <div class="flex items-center mb-1">
                  <div class="flex items-center">
                    <svg class="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span class="ml-1 text-xs text-gray-500">{{ product.rating }}</span>
                  </div>
                  <span class="mx-2 text-gray-300">|</span>
                  <span class="text-xs text-gray-500">{{ product.reviews }} {{ $t('product.reviews') }}</span>
                </div>

                <h3 class="text-base font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {{ product.name }}
                </h3>

                <p class="mt-1 text-sm text-gray-500 line-clamp-2">{{ product.description }}</p>

                <div class="mt-3 flex justify-between items-center">
                  <div>
                    <span class="text-lg font-bold text-gray-900">
                      {{ product.discountPrice || product.price }} {{ $t('common.currency') }}
                    </span>
                    <span v-if="product.discountPrice" class="ml-2 text-sm text-gray-500 line-through">
                      {{ product.price }} {{ $t('common.currency') }}
                    </span>
                  </div>
                  <button class="p-2 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors" :class="store.isInCart(product.id)?'text-red-600':'text-blue-600'" @click="addToCart($event, product)">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <!-- <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg> -->
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 分页控件 -->
          <!-- <div v-if="filteredAndSortedProducts.length > 0" class="mt-12 flex justify-center">
            <nav class="flex items-center">
              <button class="px-3 py-1 rounded-md mr-2 bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                disabled>
                &laquo; {{ $t('products.previous') }}
              </button>
              <div class="flex space-x-1">
                <button class="w-8 h-8 flex items-center justify-center rounded-md bg-blue-600 text-white">1</button>
                <button
                  class="w-8 h-8 flex items-center justify-center rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300">2</button>
                <button
                  class="w-8 h-8 flex items-center justify-center rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300">3</button>
              </div>
              <button class="px-3 py-1 rounded-md ml-2 bg-gray-200 text-gray-700 hover:bg-gray-300">
                {{ $t('products.next') }} &raquo;
              </button>
            </nav>
          </div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useStore } from '@/store'
import { useRouter, useRoute } from 'vue-router'

const store = useStore()
const router = useRouter()
const route = useRoute()
const sortOption = ref('popularity')

// 筛选条件
const priceMin = ref<number | null>(null)
const priceMax = ref<number | null>(null)
const filterDigital = ref(true)
const filterPhysical = ref(true)
const minRating = ref(0)
const inStockOnly = ref(false)

// 获取路由中的分类ID
const categoryId = ref(route.params.id as string || '')

// 获取所有产品
const products = computed(() => store.products)

// 获取所有分类
const categories = computed(() => store.categories)

// 获取当前分类
const category = computed(() => {
  return store.categories.find(c => c.id === categoryId.value)
})

// 根据选中的分类筛选产品
const filteredProducts = computed(() => {
  if (!categoryId.value) {
    return products.value
  }
  return products.value.filter((product: any) => product.category_id === categoryId.value)
})

// 应用所有筛选条件后的产品
const filteredAndSortedProducts = computed(() => {
  let result = [...filteredProducts.value]

  // 应用价格筛选
  if (priceMin.value !== null) {
    result = result.filter((product: any) => product.price >= priceMin.value!)
  }

  if (priceMax.value !== null) {
    result = result.filter((product: any) => product.price <= priceMax.value!)
  }


  // 应用评分筛选
  if (minRating.value > 0) {
    result = result.filter((product: any) => product.rating >= minRating.value)
  }

  // 应用库存筛选
  if (inStockOnly.value) {
    result = result.filter((product: any) => product.stock > 0)
  }

  // 应用排序
  switch (sortOption.value) {
    case 'price_low_high':
      return result.sort((a: any, b: any) => a.price - b.price)
    case 'price_high_low':
      return result.sort((a: any, b: any) => b.price - a.price)
    case 'newest':
      return result.sort((a: any, b: any) => b.id.localeCompare(a.id))
    case 'popularity':
      return result.sort((a: any, b: any) => b.rating - a.rating)
    default:
      return result
  }
})

// 应用筛选
const applyFilters = () => {
  // 筛选已经通过计算属性自动应用
  // 这里可以添加额外的逻辑，如保存筛选条件到URL或本地存储
}

// 重置筛选
const resetFilters = () => {
  priceMin.value = null
  priceMax.value = null
  filterDigital.value = true
  filterPhysical.value = true
  minRating.value = 0
  inStockOnly.value = false
  sortOption.value = 'popularity'
}

// 导航到产品详情页
const navigateToProduct = (productId: string) => {
  router.push(`/product/${productId}`)
}

// 导航到分类页面
const navigateToCategory = (catId: string) => {
  if (catId) {
    router.push(`/category/${catId}`)
  } else {
    router.push('/category')
  }
}

// 处理图片加载错误
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  if (target && target.src !== '/images/placeholder.png') {
    target.src = '/images/placeholder.png';
  }
}

// 添加到购物车
const addToCart = (e: Event, product: any) => {
  e.stopPropagation()
  if(store.isInCart(product.id)){
    store.removeItem(product.id)
  }else{
    store.addItem(product)
  }
}

// 监听路由参数变化，重新加载数据
watch(() => route.params.id, (newId, oldId) => {
  if (newId !== oldId) {
    categoryId.value = newId as string
  }
});


</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 自定义滑块样式 */
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}

input[type=range]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}
</style>
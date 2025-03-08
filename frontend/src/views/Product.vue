<template>
  <div>
    
    <!-- 商品详情 -->
    <div v-if="product" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 面包屑导航 -->
      <div class="mb-6">
        <nav class="flex" aria-label="Breadcrumb">
          <ol class="flex items-center space-x-2">
            <li>
              <router-link to="/" class="text-gray-500 hover:text-gray-700">{{ $t('nav.home') }}</router-link>
            </li>
            <li class="flex items-center">
              <svg class="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clip-rule="evenodd" />
              </svg>
              <router-link :to="category ? `/category/${category.id}` : '/category'"
                class="ml-2 text-gray-500 hover:text-gray-700">
                {{ category ? category.name : $t('products.all_categories') }}
              </router-link>
            </li>
            <li class="flex items-center">
              <svg class="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clip-rule="evenodd" />
              </svg>
              <span class="ml-2 text-gray-700 font-medium">{{ product.name }}</span>
            </li>
          </ol>
        </nav>
      </div>

      <div class="lg:grid lg:grid-cols-2 lg:gap-8">
        <!-- 商品图片 -->
        <div class="bg-white p-4 rounded-lg shadow-sm">
          <!-- 主图展示 -->
          <img :src="currentImage.src" :alt="currentImage.alt" class="w-full max-h-[400px] object-contain rounded-lg"
            @error="handleImageError" />
          
          <!-- 缩略图列表 -->
          <div v-if="product.images.length > 1" class="mt-3 grid grid-cols-5 gap-2">
            <div v-for="(image, index) in product.images" :key="index" 
                 class="cursor-pointer border rounded-md overflow-hidden h-12"
                 :class="{'border-blue-500': currentImageIndex === index, 'border-gray-200': currentImageIndex !== index}"
                 @click="selectImage(index)">
              <img :src="image.src" :alt="image.alt" class="w-full h-full object-cover" @error="handleImageError" />
            </div>
          </div>
        </div>

        <!-- 商品信息 -->
        <div class="mt-8 lg:mt-0 bg-white p-6 rounded-lg shadow-sm">
          <h1 class="text-3xl font-bold text-gray-900">{{ product.name }}</h1>

          <div class="mt-4 flex items-center">
            <div class="flex items-center">
              <div class="flex items-center">
                <svg v-for="i in 5" :key="i" class="h-5 w-5"
                  :class="i <= Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'" fill="currentColor"
                  viewBox="0 0 20 20">
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <p class="ml-2 text-sm text-gray-600">{{ product.rating }} ({{ product.reviews }} {{ $t('product.reviews')
              }})</p>
            </div>
          </div>

          <!-- 价格和购买区域 -->
          <div class="mt-6 border-t border-gray-200 pt-6">
            <div>
                <div class="flex items-center">
                  <span class="text-3xl font-bold text-gray-900">
                    {{ product.discountPrice || product.price }} {{ $t('common.currency') }}
                    <span v-if="product.discountPrice" class="text-sm text-gray-500 line-through ml-2">
                      {{ product.price }} {{ $t('common.currency') }}
                    </span>
                  </span>
                </div>
              </div>

            <!-- 优惠政策信息 -->
            <div v-if="hasPromotions" class="bg-orange-50 rounded-md p-3 mt-4">
              <h3 class="text-sm font-medium text-orange-800 mb-2">{{ $t('product.promotions') }}</h3>
              <ul class="space-y-2">
                <!-- 直接折扣 -->
                <li v-if="product.promotions?.discount_percent" class="flex items-start">
                  <div class="text-sm text-orange-800">
                    <p>{{ product.promotions.discount_percent }}% {{ $t('product.discount') }}</p>
                  </div>
                </li>
                <!-- 阶梯价格优惠 -->
                <li v-else-if="hasTierPricing" class="flex items-start">
                  <div class="text-sm text-orange-800">
                    <p v-for="(tier, index) in tierPricing" :key="'tier-' + index">
                      {{ tier.description }}
                    </p>
                  </div>
                </li>
                <!-- 满减优惠 -->
                <li v-else-if="hasThresholdDiscounts" class="flex items-start">
                  <div class="text-sm text-orange-800">
                    <p v-for="(discount, index) in thresholdDiscounts" :key="'threshold-' + index">
                      {{ discount.description }}
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div class="mt-6 space-y-3">
              <button v-if="isInCart" @click="removeFromCart(product)"
                class="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 transition-colors">
                <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {{ $t('product.remove_from_cart') }}
              </button>
              <button v-else @click="addToCart(product)"
                class="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors">
                <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {{ $t('product.add_to_cart') }}
              </button>

              <button @click="buyNow(product)"
                class="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                {{ $t('product.buy_now') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 商品详细信息 -->
      <div class="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 商品描述 -->
        <div class="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
          <h2 class="text-xl font-medium text-gray-900 pb-4 border-b border-gray-200">{{ $t('product.description') }}
          </h2>
          <div class="mt-4 prose prose-blue max-w-none">
            <p class="text-gray-600 whitespace-pre-line">{{ product.description }}</p>
          </div>

          <!-- 商品特性 -->
          <div v-if="product.features && product.features.length > 0" class="mt-8">
            <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('product.features') }}</h3>
            <ul class="space-y-2">
              <li v-for="(feature, index) in product.features" :key="index" class="flex items-start">
                <svg class="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-600">{{ feature }}</span>
              </li>
            </ul>
          </div>

          <!-- 标签 -->
          <div v-if="product.tags && product.tags.length > 0" class="mt-8">
            <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('product.tags') }}</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="tag in product.tags" :key="tag"
                class="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                {{ tag }}
              </span>
            </div>
          </div>
        </div>

        <!-- 侧边栏信息 -->
        <div class="space-y-6">
          <!-- 卖家信息 -->
          <div class="bg-white p-6 rounded-lg shadow-sm">
            <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('product.seller_info') }}</h3>
            <div class="flex items-center">
              <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-900">{{ config.github.username }}</p>
                <p class="text-xs text-gray-500">{{ $t('product.official_store') }}</p>
              </div>
            </div>
            <div class="mt-4">
              <button
                class="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                {{ $t('product.contact_seller') }}
              </button>
            </div>
          </div>

          <!-- 安全保障 -->
          <div class="bg-white p-6 rounded-lg shadow-sm">
            <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('product.guarantees') }}</h3>
            <ul class="space-y-3">
              <li class="flex items-start">
                <svg class="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span class="text-sm text-gray-600">{{ $t('product.secure_payment') }}</span>
              </li>
              <li class="flex items-start">
                <svg class="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span class="text-sm text-gray-600">{{ $t('product.authentic_guarantee') }}</span>
              </li>
              <li class="flex items-start">
                <svg class="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span class="text-sm text-gray-600">{{ $t('product.customer_support') }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 相关产品 -->
      <div class="mt-16">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">{{ $t('product.related_products') }}</h2>

        <div v-if="relatedProducts.length === 0" class="text-center py-4 bg-white rounded-lg shadow-sm">
          <p class="text-gray-500">{{ $t('product.no_related_products') }}</p>
        </div>

        <div v-else class="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="relatedProduct in relatedProducts" :key="relatedProduct.id"
            class="group relative bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <div class="w-full aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
              <img :src="relatedProduct.main_image.src" :alt="relatedProduct.main_image.alt"
                class="w-full h-48 object-center object-cover group-hover:opacity-75" @error="handleImageError" />
            </div>
            <div class="mt-4">
              <h3 class="text-sm font-medium text-gray-900">
                <router-link :to="`/product/${relatedProduct.id}`">
                  {{ relatedProduct.name }}
                </router-link>
              </h3>
              <p class="mt-1 text-sm text-gray-500">{{ relatedProduct.price }} {{ $t('common.currency') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 商品未找到 -->
    <div v-else class="text-center py-20">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ $t('product.not_found') }}</h2>
      <p class="text-gray-600 mb-8">{{ $t('product.not_found_message') }}</p>
      <router-link to="/category" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
        {{ $t('product.browse_products') }}
      </router-link>
    </div>

    <!-- Toast消息提示 -->
    <Toast :message="toastMessage" :type="toastType" :visible="showToast" @close="showToast = false" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore,type Product } from '@/store'
import { useI18n } from 'vue-i18n'
import Toast from '@/components/Toast.vue'
import config from '@/config'
import placeholderImage from '@/assets/placeholder.png';
const route = useRoute()
const router = useRouter()
const store = useStore()
const { t } = useI18n()

// Toast相关状态
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

// 获取商品ID
const productId = ref(route.params.id as string)

// 获取商品信息
const product = computed(() => {
  return store.products.find(p => p.id === productId.value)
})

// 检查商品是否在购物车中
const isInCart = computed(() => {
  return store.isInCart(productId.value)
})

// 获取分类信息
const category = computed(() => {
  if (!product.value) return null
  return store.categories.find(c => c.id === product.value!.category_id)
})

// 获取相关产品
const relatedProducts = computed(() => {
  if (!product.value || !product.value.related_products) return []

  // 获取相关产品列表
  return store.products
    .filter(p => product.value?.related_products?.includes(p.id))
    .slice(0, 4) // 最多显示4个相关产品
})

// 图片相关状态
const currentImageIndex = ref(0);
const currentImage = computed(() => {
  if (!product.value || !product.value.images || product.value.images.length === 0) {
    return { src: placeholderImage, alt: 'Product image not available' };
  }
  return product.value.images[currentImageIndex.value];
});

// 选择图片
const selectImage = (index: number) => {
  currentImageIndex.value = index;
};

// 显示Toast消息
const showToastMessage = (message: string, type: string = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
}

// 添加到购物车
const addToCart = (product: Product) => {
  store.addItem(product)

  // 显示成功提示
  showToastMessage(t('product.added_to_cart', { name: product.name }), 'success')
}

// 从购物车中移除
const removeFromCart = (product: Product) => {
  store.removeItem(product.id)

  // 显示成功提示
  showToastMessage(t('product.removed_from_cart', { name: product.name }), 'info')
}

// 立即购买
const buyNow = (product: Product) => {
  // 检查商品是否已在购物车中
  if (!store.isInCart(product.id)) {
    // 如果不在购物车中，先添加到购物车
    store.addItem(product);

    // 显示添加成功提示
    showToastMessage(t('product.added_to_cart', { name: product.name }), 'success');
  }

  // 跳转到购物车页面
  router.push('/cart');
}

// 处理图片加载错误
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  if (target && !target.src.endsWith(placeholderImage)) {
    target.src = placeholderImage;
  }
}

// 监听路由参数变化，重新加载数据
watch(() => route.params.id, (newId, oldId) => {
  if (newId !== oldId) {
    productId.value = newId as string
  }
});

// 检查是否有优惠政策
const hasPromotions = computed(() => {
  return product.value?.promotions?.discount_percent || hasThresholdDiscounts.value || hasTierPricing.value;
});

// 检查是否有满减优惠
const hasThresholdDiscounts = computed(() => {
  return thresholdDiscounts.value.length > 0 && !product.value?.promotions?.discount_percent;
});

// 获取满减优惠列表
const thresholdDiscounts = computed(() => {
  return product.value?.promotions?.threshold_discounts || [];
});

// 检查是否有阶梯价格优惠
const hasTierPricing = computed(() => {
  return tierPricing.value.length > 0 && !product.value?.promotions?.discount_percent && !hasThresholdDiscounts.value;
});

// 获取阶梯价格优惠列表
const tierPricing = computed(() => {
  return product.value?.promotions?.tier_pricing || [];
});


</script>
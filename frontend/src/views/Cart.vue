<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-center mb-8">{{ $t('cart.title') }}</h1>
    <!-- 购物车为空 -->
     
    <div v-if="products.length === 0" class="text-center py-12">
      <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <h3 class="mt-2 text-xl font-medium text-gray-900">{{ $t('cart.empty') }}</h3>
      <p class="mt-1 text-gray-500">{{ $t('cart.empty_message') }}</p>
      <div class="mt-6">
        <button @click="$router.back()"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
          {{ $t('cart.go_back') }}
        </button>
      </div>
    </div>

    <!-- 购物车内容 -->
    <div v-else>
      <div class="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h2 class="text-lg leading-6 font-medium text-gray-900">{{ $t('cart.items') }}</h2>
          <div class="flex items-center space-x-4">
            <button @click="toggleSelectAll(isAllSelected?false:true)" class="text-sm text-blue-600 hover:text-blue-800">
              {{ isAllSelected ? $t('cart.deselect_all') : $t('cart.select_all') }}
            </button>
            <button @click="clearCart" class="text-sm text-red-600 hover:text-red-800">
              {{ $t('cart.clear') }}
            </button>
          </div>
        </div>


        <!-- 商品类型冲突提示 -->
        <div v-if="showTypeConflictAlert" class="px-4 py-3 bg-red-50 border-t border-b border-red-100">
          <p class="text-sm text-red-700">
            {{ $t('cart.type_conflict_notice') }}
          </p>
        </div>

        <div class="border-t border-gray-200 divide-y divide-gray-200">
          <div v-for="(item, index) in products" :key="index" class="px-4 py-4 sm:px-6 flex items-center">
            <!-- 商品选择复选框 -->
            <div class="mr-4">
              <input type="checkbox" :checked="item.selected" @change="toggleItemSelection(item.id, !item.selected)"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
            </div>

            <div class="flex-shrink-0 h-16 w-16 bg-gray-200 rounded-md overflow-hidden">
              <img :src="item.main_image.src" :alt="item.main_image.alt" class="h-full w-full object-center object-cover"
                @error="handleImageError" />
            </div>
            
            <div class="ml-4 flex-1">
              <div class="flex justify-between">
                <div>
                  <h3 class="text-sm font-medium text-gray-900">
                    <router-link :to="`/product/${item.id}`">{{ item.name }}</router-link>
                    <span class="text-xs text-white bg-red-500 rounded-full px-1 ml-2" v-for="(desc,index) in promotionsText(item)" :key="index">{{ desc }}</span>
                  </h3>
                  <p class="mt-1 text-sm text-gray-700" v-if="item.discount_price">{{ item.discount_price }} {{ $t('common.currency') }}
                    <span class="line-through text-gray-500 text-xs ml-1">{{ item.price }} {{ $t('common.currency') }}</span>
                  </p>
                  <p class="mt-1 text-sm text-gray-700" v-else>{{ item.price }} {{ $t('common.currency') }}</p>
                </div>
                <div class="flex items-center">
                  <button @click="decreaseQuantity(index)" class="p-1 rounded-full text-gray-400 hover:text-gray-500">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                    </svg>
                  </button>
                  <span class="mx-2 text-gray-700">{{ item.quantity }}</span>
                  <button @click="increaseQuantity(index)" class="p-1 rounded-full text-gray-400 hover:text-gray-500">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                  <button @click="removeItem(index)" class="ml-4 p-1 rounded-full text-red-400 hover:text-red-500">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 结算信息 -->
      <div class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6">
          <h2 class="text-lg leading-6 font-medium text-gray-900">{{ $t('cart.summary') }}</h2>
        </div>
        <div class="border-t border-gray-200 px-4 py-5 sm:p-6">
          <dl class="space-y-2">
            <div class="flex justify-between">
              <dt class="text-sm text-gray-500">{{ $t('cart.subtotal') }}</dt>
              <dd class="text-sm font-medium text-gray-900">{{ selectedSubtotal }} {{ $t('common.currency') }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-sm text-gray-500">{{ $t('cart.discount') }}</dt>
              <dd class="text-sm font-medium text-red-600">-{{ selectedPromotions }} {{ $t('common.currency') }}</dd>
            </div>
            <div class="border-t border-gray-200 pt-2 flex justify-between">
              <dt class="text-base font-medium text-gray-900">{{ $t('cart.total') }}</dt>
              <dd class="text-base font-medium text-gray-900">{{ selectedTotal }} {{ $t('common.currency') }}</dd>
            </div>
          </dl>

          <!-- 收货地址信息 (仅当选中了实物商品时显示) -->
          <div v-if="hasRequiresShipping" class="mt-6 border-t border-gray-200 pt-4">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-sm font-medium text-gray-900">{{ $t('cart.shipping_info') }}</h3>
              <button @click="showShippingModal = true" class="text-sm text-blue-600 hover:text-blue-800">
                {{ shippingInfo.recipient ? $t('cart.edit_shipping') : $t('cart.add_shipping') }}
              </button>
            </div>

            <div v-if="shippingInfo.recipient" class="bg-gray-50 p-3 rounded-md">
              <p class="text-sm text-gray-700">{{ shippingInfo.recipient }} | {{ shippingInfo.fullPhoneNumber ||
                shippingInfo.phone }}</p>
              <p class="text-sm text-gray-700 mt-1">{{ shippingInfo.formattedAddress }}</p>
              <p v-if="shippingInfo.note" class="text-sm text-gray-500 mt-1">{{ $t('shipping.note') }}: {{
                shippingInfo.note }}</p>
            </div>
            <div v-else class="text-sm text-gray-500">
              {{ $t('cart.no_shipping_info') }}
            </div>
          </div>

          <div class="mt-6">
            <button @click="checkout"
              class="w-full bg-blue-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              :disabled="!hasSelectedItems" :class="{ 'opacity-50 cursor-not-allowed': !hasSelectedItems }">
              {{ hasSelectedItems?  $t('cart.checkout') : $t('cart.select_items_notice') }}
            </button>
          </div>
        </div>
      </div>

      <!-- 收货地址模态框 -->
      <div v-if="showShippingModal"
        class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto">
        <div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 overflow-hidden my-8">
          <div class="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">{{ $t('cart.shipping_info') }}</h3>
            <button @click="showShippingModal = false" class="text-gray-400 hover:text-gray-500">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="px-4 py-5 sm:p-6 max-h-[80vh] overflow-y-auto">
            <ShippingInfoForm :initialValue="shippingInfo" @save="handleShippingInfoSave"
              @cancel="showShippingModal = false" />
          </div>
        </div>
      </div>

      <!-- 确认提示模态框 -->
      <div v-if="showConfirmModal"
        class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden my-8">
          <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">{{ confirmTitle }}</h3>
          </div>
          <div class="px-4 py-5 sm:p-6 max-h-[80vh] overflow-y-auto">
            <p class="text-sm text-gray-500">{{ confirmMessage }}</p>
            <div class="mt-5 sm:mt-6 flex space-x-3">
              <button @click="confirmCancel"
                class="flex-1 inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm">
                {{ $t('common.cancel') }}
              </button>
              <button @click="confirmOk"
                class="flex-1 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm">
                {{ $t('common.confirm') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 订单信息模态框 -->
      <div v-if="showOrderModal"
        class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto">
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 overflow-hidden my-8">
          <div class="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">{{ $t('cart.order_info') }}</h3>
            <button @click="showOrderModal = false" class="text-gray-400 hover:text-gray-500">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="px-4 py-5 sm:p-6 max-h-[80vh] overflow-y-auto">
            <div class="mb-6 bg-blue-50 p-4 rounded-md border border-blue-200">
              <h4 class="text-md font-medium text-blue-800 mb-2">{{ $t('cart.order_submission_guide') }}</h4>
              <p class="text-sm text-blue-700 mb-2">{{ $t('cart.order_guide_step1') }}</p>
              <p class="text-sm text-blue-700 mb-2">{{ $t('cart.order_guide_step2') }}</p>
              <p class="text-sm text-blue-700">{{ $t('cart.order_guide_step3') }}</p>
            </div>

            <div class="bg-gray-50 p-4 rounded-md mb-4">
              <div class="flex justify-between items-center mb-2">
                <h4 class="text-md font-medium text-gray-700">{{ $t('cart.order_details') }}</h4>
                <span class="text-sm text-gray-500">{{ $t('cart.order_id') }}: {{ orderId }}</span>
              </div>
              <div class="border-t border-gray-200 pt-2">
                <pre
                  class="whitespace-pre-wrap text-sm overflow-auto max-h-[400px] font-mono bg-gray-100 p-3 rounded">{{ orderInfo }}</pre>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button @click="copyOrderInfo"
                class="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                {{ $t('cart.copy_order_info') }}
              </button>
              <a :href="githubIssueUrl" target="_blank"
                class="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900">
                <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path fill-rule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clip-rule="evenodd" />
                </svg>
                {{ $t('cart.create_github_issue') }}
              </a>
            </div>

            <div v-if="copySuccess" class="mt-3 text-center text-sm text-green-600">
              {{ $t('cart.copy_success') }}
            </div>

            <div class="mt-6 pt-4 border-t border-gray-200">
              <button @click="clearSelectedItemsAndCloseModal"
                class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ $t('cart.complete_order') }}
              </button>
              <p class="mt-2 text-xs text-center text-gray-500">
                {{ $t('cart.complete_order_note') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore, useCartStore } from '@/store'
import ShippingInfoForm from '@/components/ShippingInfoForm.vue'
import placeholderImage from '@/assets/placeholder.png';

const { t } = useI18n()

const store = useStore()
const cartStore = useCartStore()

const products = computed(() => {
  return cartStore.carts.map(c => {
      const product = store.products.find(p => p.id === c.id)!
      return {
        ...product,
        quantity: c.quantity,
        selected: c.selected
      }
    })
})

// 订单信息相关状态
const showOrderModal = ref(false)
const orderInfo = ref('')
const copySuccess = ref(false)
const githubIssueUrl = ref('')
const orderId = ref('')

// 收货地址信息
const shippingInfo = ref({
  country: '',
  recipient: '',
  phone: '',
  postalCode: '',
  state: '',
  city: '',
  address1: '',
  address2: '',
  note: '',
  formattedAddress: '',
  fullPhoneNumber: ''
})

// 收货地址模态框
const showShippingModal = ref(false)

// 确认提示模态框
const showConfirmModal = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmCallback = ref<(() => void) | null>(null)

// 商品选择相关状态
const showTypeConflictAlert = ref(false)

const hasRequiresShipping = computed(() => {
  return products.value.some(item => item.selected && item.requires_shipping)
})


// 检查是否有选中的商品
const hasSelectedItems = computed(() => {
  return cartStore.carts.some(item => item.selected)
})

// 检查是否所有商品都被选中
const isAllSelected = computed(() => {
  return cartStore.carts.length > 0 && cartStore.carts.every(item => item.selected)
})

// 获取选中的商品
const selectedItems = computed(() => {
  return products.value.filter(item => item.selected)
})


// 计算选中商品的小计
const selectedSubtotal = computed(() => {
  return selectedItems.value.reduce((total, item) => {
    return total + item.price * item.quantity
  }, 0).toFixed(2)
})

const promotionsText = (item: Product) => {
  if(item.promotions?.discount_percent){
    return [`- ${item.promotions.discount_percent}%`]
  }else if(item.promotions?.tier_pricing){
    return item.promotions.tier_pricing.map(item=>item.description)
  }else if(item.promotions?.threshold_discounts){
    return item.promotions.threshold_discounts.map(item=>item.description)
  }else{
    return []
  }
}

// 计算选中商品的优惠
const selectedPromotions = computed(() => {
  return selectedItems.value.reduce((total, item) => {
    const {amount} = cartStore.promotions(item,item.quantity)
    return total + amount
  },0).toFixed(2)
})

// 计算选中商品的总计
const selectedTotal = computed(() => {
  return (parseFloat(selectedSubtotal.value) - parseFloat(selectedPromotions.value)).toFixed(2)
})

// 组件挂载时加载购物车数据
onMounted(() => {
  cartStore.carts.forEach(item => {
    item.selected = true
  })

})

// 监听模态框状态，控制body滚动
watch([showShippingModal, showConfirmModal, showOrderModal], ([shipping, confirm, order]) => {
  if (shipping || confirm || order) {
    // 打开任意模态框时禁止body滚动
    document.body.style.overflow = 'hidden'
  } else {
    // 所有模态框都关闭时恢复body滚动
    document.body.style.overflow = ''
  }
})

// 组件卸载时恢复body滚动
onUnmounted(() => {
  document.body.style.overflow = ''
})

// 处理图片加载错误
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  if (target && !target.src.endsWith(placeholderImage)) {
    target.src = placeholderImage;
  }
}

// 增加商品数量
const increaseQuantity = (index: number) => {
  const item = cartStore.carts[index]
  item.quantity++
  cartStore.save()
}

// 减少商品数量
const decreaseQuantity = (index: number) => {
  const item = cartStore.carts[index]
  if (item.quantity > 1) {
    item.quantity--
    cartStore.save()
  }
}

// 移除商品
const removeItem = (index: number) => {
  const item = cartStore.carts[index]
  cartStore.remove(item.id)

}

// 清空购物车
const clearCart = () => {
  cartStore.clear()
}

// 选择/取消选择所有商品
const toggleSelectAll = (selected: boolean) => {
  cartStore.carts.forEach(item => {
    item.selected = selected
  })
  showTypeConflictAlert.value = false
}

// 选择/取消选择单个商品
const toggleItemSelection = (id: string, selected: boolean) => {
  const item = cartStore.carts.find(i => i.id === id)
  if (!item) return
  item.selected = selected
  showTypeConflictAlert.value = false
  
}

// 显示确认模态框
const showConfirm = (title: string, message: string, callback: () => void) => {
  confirmTitle.value = title
  confirmMessage.value = message
  confirmCallback.value = callback
  showConfirmModal.value = true
}

// 确认模态框确定按钮
const confirmOk = () => {
  showConfirmModal.value = false
  if (confirmCallback.value) {
    confirmCallback.value()
  }
}

// 确认模态框取消按钮
const confirmCancel = () => {
  showConfirmModal.value = false
}

// 处理收货信息保存
const handleShippingInfoSave = (info: any) => {
  shippingInfo.value = info
  showShippingModal.value = false
}

// 结账 - 生成订单信息并显示模态框
const checkout = () => {
  // 检查是否有选中的商品
  if (!hasSelectedItems.value) {
    showConfirm(
      t('cart.checkout'),
      t('cart.select_items_notice'),
      () => { /* 不做任何操作 */ }
    )
    return
  }

  // 验证收货信息
  if (hasRequiresShipping.value) {
    if (!shippingInfo.value.recipient || !shippingInfo.value.phone || !shippingInfo.value.address1) {
      showConfirm(
        t('cart.shipping_info_incomplete'),
        t('cart.shipping_info_required'),
        () => { showShippingModal.value = true }
      )
      return
    }
  }
  
  // 准备订单摘要信息
  const summary = {
    subtotal: selectedSubtotal.value,
    discount: selectedPromotions.value,
    total: selectedTotal.value,
  };

  const _products: OrderItem[] = selectedItems.value.map(item => {
    const { type, amount, description } = cartStore.promotions(item,item.quantity)
    return {
      id: item.id,
      category_id: item.category_id,
      name: item.name,
      price: item.price.toFixed(2),
      quantity: item.quantity,
      subtotal: (item.price * item.quantity).toFixed(2),
      promotions: amount > 0 ? { type, amount: amount.toFixed(2), description } : {},
      merchant_id: item.merchant_id,
      distribution_percent: item.distribution_percent
    }
  })
  const result = store.submitOrder(_products,summary,hasRequiresShipping.value ? shippingInfo.value : null)
  
  
  // 保存订单信息到本地，以便后续查询
  //localStorage.setItem('lastOrderId', result.orderId);
  
  orderId.value = result.orderId
  githubIssueUrl.value = result.issueUrl;
  orderInfo.value = result.issueBody;
  showOrderModal.value = true;
}

// 清除已选商品
const clearSelectedItems = () => {
  products.value.forEach(item => {
    if (item.selected) {
      cartStore.remove(item.id);
    }
  });
}

// 复制订单信息
const copyOrderInfo = () => {
  navigator.clipboard.writeText(orderInfo.value).then(() => {
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 3000)
  }).catch(err => {
    console.error('无法复制文本: ', err)
  })
}

// 清除已选商品并关闭模态框
const clearSelectedItemsAndCloseModal = () => {
  clearSelectedItems();
  showOrderModal.value = false;
}


</script>
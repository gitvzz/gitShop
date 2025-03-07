<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">分销商管理面板</h1>
    
    <!-- 登录表单 -->
    <div v-if="!isLoggedIn" class="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto">
      <h2 class="text-xl font-semibold mb-4">分销商登录</h2>
      
      <div v-if="loginError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ loginError }}
      </div>
      
      <form @submit.prevent="login">
        <div class="mb-4">
          <label for="distributorId" class="block text-sm font-medium text-gray-700 mb-1">分销商ID</label>
          <input 
            type="text" 
            id="distributorId" 
            v-model="loginForm.distributorId" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>
        
        <div class="mb-6">
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input 
            type="password" 
            id="password" 
            v-model="loginForm.password" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>
        
        <button 
          type="submit" 
          class="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          :disabled="isLoading"
        >
          {{ isLoading ? '登录中...' : '登录' }}
        </button>
      </form>
    </div>
    
    <!-- 分销商面板 -->
    <div v-else>
      <div class="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold">分销商信息</h2>
            <button 
              @click="logout" 
              class="text-sm text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              退出登录
            </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500">分销商ID</p>
              <p class="font-medium">{{ distributorInfo.id }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">姓名</p>
              <p class="font-medium">{{ distributorInfo.name }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">电子邮件</p>
              <p class="font-medium">{{ distributorInfo.email }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">加入日期</p>
              <p class="font-medium">{{ formatDate(distributorInfo.joinDate) }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-gray-50 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">佣金比例</p>
              <p class="text-lg font-bold text-primary-600">{{ distributorInfo.commissionRate }}%</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">总收入</p>
              <p class="text-lg font-bold text-green-600">{{ distributorInfo.totalEarnings }} CNY</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 推广链接 -->
      <div class="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4">您的推广链接</h2>
        <p class="text-sm text-gray-600 mb-4">
          使用以下链接推广产品，当客户通过您的链接购买时，您将获得佣金。
        </p>
        
        <div v-for="product in products" :key="product.id" class="mb-4 p-4 border border-gray-200 rounded-lg">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium">{{ product.name }}</h3>
              <p class="text-sm text-gray-600">价格: {{ product.price }} {{ product.currency }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-600">佣金: {{ calculateCommission(product) }} {{ product.currency }}</p>
            </div>
          </div>
          
          <div class="mt-3">
            <div class="flex">
              <input 
                type="text" 
                readonly 
                :value="generateAffiliateLink(product.id)" 
                class="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              <button 
                @click="copyToClipboard(generateAffiliateLink(product.id))" 
                class="bg-gray-100 px-4 py-2 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200 focus:outline-none"
              >
                复制
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 销售记录 -->
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold">销售记录</h2>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">订单ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">产品</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金额</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">佣金</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="salesRecords.length === 0">
                <td colspan="6" class="px-6 py-4 text-center text-gray-500">暂无销售记录</td>
              </tr>
              <tr v-for="record in salesRecords" :key="record.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ record.id }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ record.productName }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(record.date) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ record.amount }} {{ record.currency }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ record.commission }} {{ record.currency }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="{
                      'bg-green-100 text-green-800': record.status === 'completed',
                      'bg-yellow-100 text-yellow-800': record.status === 'pending',
                      'bg-red-100 text-red-800': record.status === 'cancelled'
                    }"
                  >
                    {{ getStatusText(record.status) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useDistributorStore } from '@/store'
import { useProductsStore } from '@/store'
import type { Product } from '@/store/products'

interface LoginForm {
  distributorId: string
  password: string
}

interface SalesRecord {
  id: string
  productName: string
  date: string
  amount: number
  currency: string
  commission: number
  status: 'completed' | 'pending' | 'cancelled'
}

export default defineComponent({
  name: 'DistributorPanel',
  
  setup() {
    const distributorStore = useDistributorStore()
    const productsStore = useProductsStore()
    
    const isLoading = ref(false)
    const loginError = ref<string | null>(null)
    const loginForm = ref<LoginForm>({
      distributorId: '',
      password: ''
    })
    
    const isLoggedIn = computed(() => distributorStore.isLoggedIn)
    const distributorInfo = computed(() => distributorStore.distributorInfo)
    const products = computed(() => productsStore.products)
    const salesRecords = ref<SalesRecord[]>([])
    
    // 模拟登录
    const login = async () => {
      isLoading.value = true
      loginError.value = null
      
      try {
        await distributorStore.login(loginForm.value.distributorId, loginForm.value.password)
        // 登录成功后加载销售记录
        loadSalesRecords()
      } catch (error) {
        loginError.value = '登录失败，请检查您的分销商ID和密码'
        console.error('Login error:', error)
      } finally {
        isLoading.value = false
      }
    }
    
    // 退出登录
    const logout = () => {
      distributorStore.logout()
    }
    
    // 格式化日期
    const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN')
    }
    
    // 计算佣金
    const calculateCommission = (product: Product) => {
      const commission = product.price * (distributorInfo.value.commissionRate / 100)
      return commission.toFixed(2)
    }
    
    // 生成推广链接
    const generateAffiliateLink = (productId: string) => {
      return `${window.location.origin}/#/product/${productId}?ref=${distributorInfo.value.id}`
    }
    
    // 复制到剪贴板
    const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text)
        .then(() => {
          alert('链接已复制到剪贴板')
        })
        .catch(err => {
          console.error('无法复制链接:', err)
        })
    }
    
    // 获取状态文本
    const getStatusText = (status: string) => {
      switch (status) {
        case 'completed':
          return '已完成'
        case 'pending':
          return '处理中'
        case 'cancelled':
          return '已取消'
        default:
          return status
      }
    }
    
    // 加载销售记录
    const loadSalesRecords = () => {
      // 模拟数据
      salesRecords.value = [
        {
          id: 'ORD-001',
          productName: '开发者工具包',
          date: '2023-05-15',
          amount: 299,
          currency: 'CNY',
          commission: 29.9,
          status: 'completed'
        },
        {
          id: 'ORD-002',
          productName: '云服务器',
          date: '2023-05-20',
          amount: 599,
          currency: 'CNY',
          commission: 59.9,
          status: 'completed'
        },
        {
          id: 'ORD-003',
          productName: '编程课程',
          date: '2023-06-01',
          amount: 399,
          currency: 'CNY',
          commission: 39.9,
          status: 'pending'
        }
      ]
    }
    
    // 组件挂载时加载产品数据
    onMounted(async () => {
      if (productsStore.products.length === 0) {
        await productsStore.fetchProducts()
      }
      
      // 如果已登录，加载销售记录
      if (isLoggedIn.value) {
        loadSalesRecords()
      }
    })
    
    return {
      isLoading,
      loginError,
      loginForm,
      isLoggedIn,
      distributorInfo,
      products,
      salesRecords,
      login,
      logout,
      formatDate,
      calculateCommission,
      generateAffiliateLink,
      copyToClipboard,
      getStatusText
    }
  }
})
</script>

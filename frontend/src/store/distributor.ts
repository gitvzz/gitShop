import { defineStore } from 'pinia'

// 定义分销商信息类型
export interface DistributorInfo {
  id: string
  name: string
  email: string
  joinDate: string
  commissionRate: number
  totalEarnings: number
}

// 定义分销记录类型
export interface DistributionRecord {
  id: string
  date: string
  productId: string
  productName: string
  amount: number
  commission: number
  status: 'pending' | 'completed' | 'failed'
}

// 定义分销商状态
interface DistributorState {
  isLoggedIn: boolean
  distributorInfo: DistributorInfo
  distributionRecords: DistributionRecord[]
  distributorCode: string | null
  isDistributor: boolean
  loading: boolean
  error: string | null
}

export const useDistributorStore = defineStore('distributor', {
  state: () => ({
    isLoggedIn: false,
    distributorInfo: {
      id: '',
      name: '',
      email: '',
      joinDate: '',
      commissionRate: 0,
      totalEarnings: 0
    } as DistributorInfo
  }),
  
  getters: {
    // 获取分销商信息
    getDistributorInfo: (state) => state.distributorInfo,
    
    // 获取分销记录
    getDistributionRecords: (state) => state.distributionRecords,
    
    // 获取分销商代码
    getDistributorCode: (state) => state.distributorCode,
    
    // 是否是分销商
    getIsDistributor: (state) => state.isDistributor,
    
    // 获取总销售额
    getTotalSales: (state) => state.distributorInfo?.totalSales || 0,
    
    // 获取总佣金
    getTotalCommission: (state) => state.distributorInfo?.totalCommission || 0
  },
  
  actions: {
    // 检查URL中是否有分销代码
    checkDistributorCodeInUrl() {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('ref')
        
        if (code) {
          this.setDistributorCode(code)
        }
      }
    },
    
    // 设置分销代码
    setDistributorCode(code: string) {
      this.distributorCode = code
      
      // 存储到本地存储，以便后续使用
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('distributorCode', code)
      }
    },
    
    // 从本地存储中获取分销代码
    getDistributorCodeFromStorage() {
      if (typeof localStorage !== 'undefined') {
        const code = localStorage.getItem('distributorCode')
        if (code) {
          this.distributorCode = code
        }
      }
    },
    
    // 加载分销商信息
    async fetchDistributorInfo(username: string) {
      this.loading = true
      this.error = null
      
      try {
        // 在实际项目中，这里应该是从API获取数据
        // 但在这个演示项目中，我们模拟数据
        // const response = await axios.get(`/api/distributor/${username}`)
        // this.distributorInfo = response.data
        
        // 模拟数据
        this.distributorInfo = {
          code: `${username}-${Math.random().toString(36).substring(2, 8)}`,
          username,
          totalSales: Math.floor(Math.random() * 10000),
          totalCommission: Math.floor(Math.random() * 1000),
          level: '普通分销商',
          referrals: Math.floor(Math.random() * 20)
        }
        
        this.isDistributor = true
        
        // 模拟分销记录
        this.distributionRecords = Array(5).fill(null).map((_, index) => ({
          id: `record-${index}`,
          date: new Date(Date.now() - index * 86400000).toISOString().split('T')[0],
          productId: `p00${index + 1}`,
          productName: `商品 ${index + 1}`,
          amount: Math.floor(Math.random() * 500) + 100,
          commission: Math.floor(Math.random() * 50) + 10,
          status: ['pending', 'completed', 'failed'][Math.floor(Math.random() * 3)] as 'pending' | 'completed' | 'failed'
        }))
      } catch (error) {
        this.error = '加载分销商信息失败'
        console.error('Error fetching distributor info:', error)
      } finally {
        this.loading = false
      }
    },
    
    // 申请成为分销商
    async applyForDistributor(username: string) {
      this.loading = true
      this.error = null
      
      try {
        // 在实际项目中，这里应该是向API发送请求
        // 但在这个演示项目中，我们直接模拟成功
        // await axios.post('/api/distributor/apply', { username })
        
        // 模拟延迟
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 设置分销商信息
        await this.fetchDistributorInfo(username)
        
        return true
      } catch (error) {
        this.error = '申请分销商失败'
        console.error('Error applying for distributor:', error)
        return false
      } finally {
        this.loading = false
      }
    },
    
    async login(distributorId: string, password: string) {
      // 在实际应用中，这里应该是调用API进行身份验证
      // 为了演示，我们使用模拟数据
      
      return new Promise<void>((resolve, reject) => {
        // 模拟网络延迟
        setTimeout(() => {
          // 简单的验证逻辑
          if (distributorId === 'demo' && password === 'password') {
            this.isLoggedIn = true
            this.distributorInfo = {
              id: 'demo',
              name: '演示分销商',
              email: 'demo@example.com',
              joinDate: '2023-01-15',
              commissionRate: 10,
              totalEarnings: 129.7
            }
            resolve()
          } else {
            reject(new Error('Invalid credentials'))
          }
        }, 500)
      })
    },
    
    logout() {
      this.isLoggedIn = false
      this.distributorInfo = {
        id: '',
        name: '',
        email: '',
        joinDate: '',
        commissionRate: 0,
        totalEarnings: 0
      }
    }
  }
})

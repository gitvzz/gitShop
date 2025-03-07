import { defineStore } from 'pinia'
import axios from 'axios'
import config from '@/config';
import { encrypt, md5, generateOrderId } from '@/utils';


export type Locale = 'en' | 'zh'

export type StringOrObject = string | Record<Locale, string>

export interface Image {
  src: string
  alt: string
}

export interface CategoryFull<T = StringOrObject> {
  id: string
  name: T
  description: T
  image: Image
}

export interface Category extends CategoryFull<string> { }

// 定义商品类型
export interface ProductFull<T = StringOrObject> {
  id: string
  name: T
  description: T
  price: number
  currency: string
  images: Image[]
  category_id: string
  requires_shipping?: boolean
  features: T[]
  stock: number
  rating: number
  reviews: number
  tags?: T[]
  related_products?: string[]
  promotions?: {
    discount_percent?: number
    tier_pricing?: Array<{
      min_quantity: number
      discount_percent: number
      description: T
    }>
    threshold_discounts?: Array<{
      threshold: number
      discount_amount: number
      description: T
    }>
  }
  merchant_id?: string
}

export interface Product extends ProductFull<string> {
  main_image: Image
  discountPrice?: number
}

export interface CartItem {
  id: string;
  quantity: number;
  selected?: boolean;
}

export interface CartProduct extends Product {
  quantity: number;
  selected?: boolean;
}

export interface State {
  locale: string
  category_full: CategoryFull[]
  product_full: ProductFull[]
  carts: CartItem[]
  loading: boolean
  error: string | null
  distributor_id?: string
  privateKey?: string
  publicKey: string
}

const getValue = (value: StringOrObject, locale: string) => {
  if (typeof value === 'string') {
    return value
  }
  return value[locale as Locale] || Object.values(value)[0]
}

export const useStore = defineStore('store', {
  state: () => <State>({
    locale: 'en',
    category_full: [],
    product_full: [],
    carts: [],
    loading: false,
    error: null,
    distributor_id: undefined,
    publicKey: config.app.publicKey,
    privateKey: config.app.privateKey
  }),

  getters: {
    githubUrl(): string {
      return `https://github.com/${config.github.username}/${config.github.repository}`
    },
    categories(state): Category[] {
      return state.category_full.map(c => ({
        ...c,
        name: getValue(c.name, state.locale),
        description: getValue(c.description, state.locale)
      }))
    },
    products(state): Product[] {
      return state.product_full.map(p => ({
        ...p,
        name: getValue(p.name, state.locale),
        description: getValue(p.description, state.locale),
        features: p.features.map(f => getValue(f, state.locale)),
        tags: p.tags ? p.tags.map(t => getValue(t, state.locale)) : undefined,
        main_image: p.images.length > 0 ? p.images[0] : { src: '', alt: '' },
        discountPrice: p.promotions?.discount_percent ? parseFloat((p.price * (1 - p.promotions.discount_percent! / 100)).toFixed(2)) : undefined,
        promotions: p.promotions ? {
          discount_percent: p.promotions.discount_percent,
          tier_pricing: p.promotions.tier_pricing ? p.promotions.tier_pricing.map(tp => ({
            ...tp,
            description: getValue(tp.description, state.locale)
          })).filter((_, index) => index < 2).sort((a, b) => b.min_quantity - a.min_quantity) : undefined,
          threshold_discounts: p.promotions.threshold_discounts ? p.promotions.threshold_discounts.map(td => ({
            ...td,
            description: getValue(td.description, state.locale)
          })).filter((_, index) => index < 2).sort((a, b) => b.threshold - a.threshold) : undefined,
        } : undefined
      }))
    },
    cardProducts(): CartProduct[] {
      return this.carts.map(c => {
        const product = this.products.find(p => p.id === c.id)!
        return {
          ...product,
          quantity: c.quantity,
          selected: c.selected
        }
      })
    }
  },

  actions: {
    async initData() {
      if (this.product_full.length > 0) {
        return
      }
      this.loading = true
      try {
        const categoriesRes = await axios.get('/products/index.json')
        for (const category of categoriesRes.data.items) {
          const productsRes = await axios.get(`/products/${category.id}.json`)
          if (productsRes.data) {
            const products = productsRes.data.map((product: Product) => {
              const images = (product.images || []).map(i => typeof i === 'string' ? { src: i, alt: product.name } : Object.assign({ alt: product.name }, i))
              return { ...product, category_id: category.id, images }
            })
            this.product_full.push(...products)
            this.category_full.push(category)
          }
        }
        this.loadCart()
      } catch (error) {
        console.error('initData:', error)
      } finally {
        this.loading = false
      }
    },

    loadCart() {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        try {
          this.carts = JSON.parse(savedCart).reduce((lst: any[], item: any) => {
            const product = this.products.find(p => p.id === item.id)
            if (product) {
              lst.push(item)
            }
            return lst
          }, [] as any[])
        } catch (e) {
          console.error('Failed to parse cart from localStorage:', e)
        }
      }
    },

    // 保存购物车到本地存储
    saveCart() {
      const items = this.carts.map(item => ({ id: item.id, quantity: item.quantity }))
      localStorage.setItem('cart', JSON.stringify(items))
    },

    // 检查商品是否在购物车中
    isInCart(id: string): boolean {
      return this.carts.some(item => item.id === id)
    },

    // 添加商品到购物车
    addItem(product: Product) {
      const existingItem = this.carts.find(i => i.id === product.id)

      if (existingItem) {
        existingItem.quantity += 1
      } else {
        this.carts.push({ id: product.id, quantity: 1 })
      }
      this.saveCart()
    },

    // 从购物车移除商品
    removeItem(id: string) {
      const index = this.carts.findIndex(i => i.id === id)
      if (index !== -1) {
        this.carts.splice(index, 1)
        this.saveCart()
      }
    },

    // 清空购物车
    clearCart() {
      this.carts = []
      this.saveCart()
    },

    computeItemDiscount(item: CartProduct) {
      let amount = 0
      let type = ''
      let description = ''
      const quantity = item.quantity
      if (item.promotions?.discount_percent) {
        amount = (item.price - (item.discountPrice || item.price)) * quantity
        type = 'discount_percent'
        description = `${item.promotions.discount_percent}% discount`
      } else if (item.promotions?.tier_pricing) {
        // 阶梯价格优惠
        const tier_item = item.promotions.tier_pricing.find(({ min_quantity }) => {
          return quantity >= min_quantity
        })
        if (tier_item) {
          amount = item.price * quantity * (tier_item.discount_percent / 100)
          type = 'tier_pricing'
          description = tier_item.description
        }
      } else if (item.promotions?.threshold_discounts) {
        // 满减优惠
        const threshold_item = item.promotions.threshold_discounts.find(({ threshold }) => {
          return (quantity * item.price) >= threshold
        })
        if (threshold_item) {
          amount = threshold_item.discount_amount
          type = 'threshold_discount'
          description = threshold_item.description
        }
      }
      return { amount, type, description }
    },

    submitOrder(items: CartProduct[], summary: { subtotal: string, discount: string, total: string }, shippingInfo?: any) {
      const orderId = generateOrderId()

      const orderData = {
        orderId,
        timestamp: new Date().toISOString(),
        items: items.map(item => {
          const { type, amount, description } = this.computeItemDiscount(item)
          return {
            id: item.id,
            name: item.name,
            price: item.price.toFixed(2),
            quantity: item.quantity,
            subtotal: (item.price * item.quantity).toFixed(2),
            appliedDiscount: amount > 0 ? { type, amount: amount.toFixed(2), description } : null,
            merchant_id: item.merchant_id,
            distributor_id: this.distributor_id
          }
        }),
        summary
      }
      console.log('准备加密的订单数据:', orderData);
      const encryptedOrderData = encrypt(orderData, this.publicKey);
      //console.log('加密后的订单数据:', encryptedOrderData);

      console.log('准备加密的收货数据:', shippingInfo);
      const encryptedShippingData = shippingInfo ? encrypt(shippingInfo, this.publicKey) : null;
      //console.log('加密后的收货数据:', encryptedShippingData);

      const issueTitle = `Order ${orderId}`;

      // 生成商品列表
      const productList = items.map(item => {
        return `- [${item.name}](${this.githubUrl}/#/product/${item.id}${this.distributor_id ? `?ref=${this.distributor_id}` : ''}) x${item.quantity}`;
      }).join('\n');

      // 基本Issue正文
      let issueBody = `# Order ${orderId}`
      if (this.distributor_id) {
        issueBody += `\nDistributor ID: ${this.distributor_id}`
      }
      issueBody += `

## Products
${productList}

## Order Data
\`\`\`
[ENCRYPTED_ORDER_DATA]
${encryptedOrderData}
[/ENCRYPTED_ORDER_DATA]
\`\`\`
`;

      // 如果有收货信息，添加到正文
      if (encryptedShippingData) {
        issueBody += `
## Shipping Data
\`\`\`
[ENCRYPTED_SHIPPING_DATA]
${encryptedShippingData}
[/ENCRYPTED_SHIPPING_DATA]
\`\`\`
`;
      }

      // 添加说明信息
      issueBody += `
---
*This order was generated automatically by GitShop. Please do not edit this issue manually.*
`;

      // 生成订单内容的MD5签名
      const contentToSign = issueTitle + issueBody;
      const signature = md5(contentToSign);

      // 将签名添加到issueBody
      issueBody += `## MD5:\`${signature}\`
`;
      console.log(issueTitle)
      console.log(issueBody);
      const encodedBody = encodeURIComponent(issueBody);
      const encodedTitle = encodeURIComponent(issueTitle);
      const issueUrl = `${this.githubUrl}/issues/new?title=${encodedTitle}&labels=order&body=${encodedBody}`;
      return { orderId, issueUrl, issueTitle, issueBody }
    }
  }
})

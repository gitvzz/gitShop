import { defineStore } from 'pinia'
import axios from 'axios'
import config from '@/config';
import { encrypt, md5 } from '@/utils';
import { useCartStore } from './cart';

const getValue = (value: StringOrObject, locale: Locale) => {
  if (typeof value === 'string') {
    return value
  }
  return value[locale] || Object.values(value)[0]
}

export const useStore = defineStore('store', {
  state: () => <State>({
    locale: 'en',
    category_full: [],
    product_full: [],
    loading: false,
    error: null,
    distributor_id: undefined,
    publicKey: config.app.publicKey
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
      return state.product_full.map(p => {
        const discount_price = p.promotions?.discount_percent ? parseFloat((p.price * (1 - p.promotions.discount_percent! / 100)).toFixed(2)) : undefined
        return {
          ...p,
          name: getValue(p.name, state.locale),
          description: getValue(p.description, state.locale),
          features: p.features.map(f => getValue(f, state.locale)),
          tags: p.tags ? p.tags.map(t => getValue(t, state.locale)) : undefined,
          main_image: p.images[0],
          discount_price,
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
        }
      })
    },
    
  },

  actions: {
    async initData() {
      if (this.product_full.length > 0) {
        return
      }
      this.loading = true
      try {
        const categoriesRes = await axios.get(`${import.meta.env.BASE_URL}products/index.json`)
        for (const category of categoriesRes.data.items) {
          const productsRes = await axios.get(`${import.meta.env.BASE_URL}products/${category.id}.json`)
          if (productsRes.data) {
            const products = productsRes.data.filter((p:any) => p.images && p.images.length > 0).map((product: Product) => {
              const images = product.images.map(i => typeof i === 'string' ? { src: i, alt: product.name } : Object.assign({ alt: product.name }, i))
              return { ...product, category_id: category.id, images }
            })
            if (products.length > 0) {
              this.product_full.push(...products)
              this.category_full.push(category)
            }
          }
        }
        const cartStore = useCartStore()
        cartStore.load(id => this.products.some(p => p.id === id))
      } catch (error) {
        console.error('initData:', error)
      } finally {
        this.loading = false
      }
    },

  
    submitOrder(items: OrderItem[], summary: { subtotal: string, discount: string, total: string }, shippingInfo?: any) {
      const date = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
      const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase()
      const orderId = `ORDER-${dateStr}-${randomStr}`

      const orderData = {
        orderId,
        timestamp: new Date().toISOString(),
        items,
        summary
      }
      console.log('准备加密的订单数据:', orderData);
      const encryptedOrderData = encrypt(orderData, this.publicKey);
      //console.log('加密后的订单数据:', encryptedOrderData);

      console.log('准备加密的收货数据:', shippingInfo);
      const encryptedShippingData = shippingInfo ? encrypt(shippingInfo, this.publicKey) : null;
      //console.log('加密后的收货数据:', encryptedShippingData);

      const issueTitle = `Order ${orderId}`;
      const templates = [`# Order ${orderId}`]
      if (this.distributor_id) {
        templates.push(`Distributor ID: ${this.distributor_id}`)
      }

      // 生成商品列表
      const url = `https://${config.github.username}.github.io/${config.github.repository}`
      const productList = items.map(item => {
        return `- [${item.name}](${url}/#/product/${item.id}${this.distributor_id ? `?ref=${this.distributor_id}` : ''}) x${item.quantity}`;
      }).join('\n');

      templates.push(`\n## Products\n${productList}`)

      templates.push(`\n## Order Data\n[ENCRYPTED_ORDER_DATA]\n${encryptedOrderData}\n[/ENCRYPTED_ORDER_DATA]`)

      if (shippingInfo) {
        templates.push(`\n## Shipping Data\n[ENCRYPTED_SHIPPING_DATA]\n${encryptedShippingData}\n[/ENCRYPTED_SHIPPING_DATA]`)
      }

      templates.push(`\n---`)
      templates.push(`*This order was generated automatically by GitShop. Please do not edit this issue manually.*`)

      let issueBody = templates.join('\n')
      const signature = md5(issueTitle+issueBody);
      templates.push(`MD5:${signature}`)

      issueBody = templates.join('\n')

      const encodedBody = encodeURIComponent(issueBody);
      const encodedTitle = encodeURIComponent(issueTitle);
      const issueUrl = `${this.githubUrl}/issues/new?title=${encodedTitle}&labels=order&body=${encodedBody}`;
      return { orderId, issueUrl, issueTitle, issueBody }

    }
  }
})

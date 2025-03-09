import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
    state: () => ({
        carts: [] as CartItem[]
    }),
    actions: {
        load(exist: (id: string) => boolean) {
            const savedCart = localStorage.getItem('cart')
            if (savedCart) {
                try {
                    this.carts = JSON.parse(savedCart).reduce((lst: any[], item: any) => {
                        if (exist(item.id)) {
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
        save() {
            const items = this.carts.map(item => ({ id: item.id, quantity: item.quantity }))
            localStorage.setItem('cart', JSON.stringify(items))
        },

        // 检查商品是否在购物车中
        isInCart(id: string): boolean {
            return this.carts.some(item => item.id === id)
        },

        // 添加商品到购物车
        add(product: Product) {
            const existingItem = this.carts.find(i => i.id === product.id)

            if (existingItem) {
                existingItem.quantity += 1
            } else {
                this.carts.push({ id: product.id, quantity: 1 })
            }
            this.save()
        },

        // 从购物车移除商品
        remove(id: string) {
            const index = this.carts.findIndex(i => i.id === id)
            if (index !== -1) {
                this.carts.splice(index, 1)
                this.save()
            }
        },

        // 清空购物车
        clear() {
            this.carts = []
            this.save()
        },

        promotions(item: Product, quantity: number) {
            let amount = 0
            let type = ''
            let description = ''
            if (item.promotions?.discount_percent) {
              amount = (item.price - (item.discount_price || item.price)) * quantity
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
    }
})


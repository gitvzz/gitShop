// 全局类型定义

declare global {
  type Locale = 'en' | 'zh'

  type StringOrObject = string | Record<Locale, string>

  interface Image {
    src: string
    alt: string
  }

  interface CategoryFull<T = StringOrObject> {
    id: string
    name: T
    description: T
    image: Image
  }

  interface Category extends CategoryFull<string> { }

  // 定义商品类型
  interface ProductFull<T = StringOrObject> {
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

  interface Product extends ProductFull<string> {
    main_image: Image
    discount_price?: number
  }

  interface CartItem {
    id: string;
    quantity: number;
    selected?: boolean;
  }

  interface OrderItem {
    id: string;
    name: string;
    price: string;
    quantity: number;
    subtotal: string;
    promotions: {
      type?: string;
      amount?: string;
      description?: string;
    };
    merchant_id?: string;
    distributor_id?: string;
  }

  interface State {
    locale: Locale
    category_full: CategoryFull[]
    product_full: ProductFull[]
    loading: boolean
    error: string | null
    distributor_id?: string
    privateKey?: string
    publicKey: string
  }
}

// 为了使 TypeScript 将此文件视为模块而非脚本，需要添加一个空的 export
export {} 
// 中文翻译
const zhMessages = {
  nav: {
    home: '首页',
    products: '商品',
    distributor: '分销商'
  },
  footer: {
    about: '关于我们',
    description: 'GitShop是一个基于GitHub的开源电子商务解决方案，专为程序员设计。',
    links: '链接',
    about_us: '关于我们',
    terms: '使用条款',
    contact: '联系我们',
    contact_info: '有任何问题或建议，请通过GitHub Issues联系我们。',
    rights: '保留所有权利。'
  },
  home: {
    hero: {
      title: 'GitShop 商城',
      subtitle: '基于GitHub的开源电子商务解决方案',
      description: '购买高质量数字产品，支持开发者，加入我们的开源社区。',
      browse: '浏览商品',
      become_distributor: '成为分销商'
    },
    featured_categories: {
      title: '精选分类',
      empty: '暂无精选分类'
    },
    featured_products: {
      title: '精选商品',
      empty: '暂无精选商品'
    },
    all_products: {
      title: '所有商品',
      empty: '暂无商品'
    },
    about: {
      title: '关于GitShop',
      subtitle: '基于GitHub的开源电子商务解决方案',
      description: 'GitShop是一个创新的电子商务平台，利用GitHub基础设施处理订单和分销。',
      features: {
        open_source: {
          title: '开源',
          description: '所有代码都是开源的，您可以查看、修改和贡献。我们相信透明度和社区协作。'
        },
        secure: {
          title: '安全加密',
          description: '所有用户信息都经过加密，确保您的数据安全。我们使用行业标准加密技术。'
        },
        distribution: {
          title: '分销系统',
          description: '成为分销商，推广产品并赚取佣金。我们的分销系统易于使用，帮助您赚取额外收入。'
        },
        fast_delivery: {
          title: '快速交付',
          description: '数字产品在购买后立即可用，无需等待运输。立即获取您的产品。'
        }
      }
    }
  },
  product: {
    discount: '折扣',
    reviews: '评论',
    features: '特点',
    add_to_cart: '加入购物车',
    remove_from_cart: '从购物车中移除',
    added_to_cart: '已将 {name} 添加到购物车',
    removed_from_cart: '已将 {name} 从购物车中移除',
    buy_now: '立即购买',
    related_products: '相关商品',
    no_related_products: '暂无相关商品',
    description: '商品描述',
    digital_product: '数字商品',
    physical_product: '实物商品',
    delivery_info: '配送信息',
    delivery_method: '配送方式',
    delivery_time: '配送时间',
    stock: '库存',
    in_stock: '有货',
    out_of_stock: '缺货',
    not_found: '商品未找到',
    not_found_message: '抱歉，您查找的商品不存在或已下架',
    browse_products: '浏览其他商品',
    back_to_home: '返回首页',
    type: '商品类型',
    additional_info: '额外信息',
    seller_info: '卖家信息',
    official_store: '官方店铺',
    contact_seller: '联系卖家',
    guarantees: '安全保障',
    secure_payment: '安全支付',
    authentic_guarantee: '正品保障',
    customer_support: '客户服务',
    tags: '标签',
    weight: '重量',
    dimensions: '尺寸',
    access_type: '访问方式',
    duration: '时长',
    validity_period: '有效期',
    origin: '产地',
    shelf_life: '保质期',
    storage: '存储方式',
    prerequisites: '前置要求',
    language: '语言',
    instructor: '讲师',
    certification: '认证',
    promotions: '优惠活动'
  },
  products: {
    title: '所有商品',
    all_products: '所有商品',
    filter_by_category: '按分类筛选',
    all_categories: '所有分类',
    sort_by: '排序方式',
    sort_options: {
      price_low_high: '价格: 从低到高',
      price_high_low: '价格: 从高到低',
      newest: '最新',
      popularity: '人气'
    },
    no_products: '没有找到符合条件的商品',
    view_all_products: '查看所有商品',
    items_count: '件商品',
    previous: '上一页',
    next: '下一页',
    browse_all_description: '浏览我们的全部商品，找到适合您的优质产品',
    price_range: '价格区间',
    apply_filter: '应用筛选',
    reset_filter: '重置筛选',
    in_stock_only: '仅显示有货',
    product_type: '商品类型',
    digital: '数字产品',
    physical: '实物产品',
    rating_above: '评分高于'
  },
  cart: {
    title: '购物车',
    empty: '购物车为空',
    empty_message: '您的购物车中没有商品，现在去选购吧！',
    go_back: '返回',
    items: '购物车商品',
    clear: '清空购物车',
    total: '总计',
    subtotal: '小计',
    discount: '优惠',
    checkout: '提交订单',
    summary: '订单摘要',
    order_info: '订单信息',
    copy_order_info: '复制订单信息',
    create_github_issue: '创建GitHub Issue',
    copy_success: '已复制到剪贴板！',
    order_submission_guide: '如何提交订单',
    order_guide_step1: '1. 点击下方的"创建GitHub Issue"按钮，打开一个包含您订单详情的新GitHub issue。',
    order_guide_step2: '2. 如果需要，请登录GitHub（提交订单需要GitHub账户）。',
    order_guide_step3: '3. 检查预填充的信息，然后点击"Submit new issue"完成订单提交。',
    order_details: '订单详情',
    order_id: '订单编号',
    complete_order: '完成订单并清空购物车',
    complete_order_note: '提交GitHub issue后点击此按钮。',
    mixed_products_notice: '您的购物车中同时包含实物商品和数字商品，这两种类型的商品需要分开下单。',
    shipping_info: '收货信息',
    select_all: '全选',
    deselect_all: '取消全选',
    select_items_notice: '请选择要购买的商品',
    type_conflict_notice: '不能同时选择不同类型的商品，请先取消选择当前商品',
    no_shipping_info: '暂无收货信息，请点击右侧按钮添加',
    shipping_info_incomplete: '收货信息不完整',
    shipping_info_required: '您选择了实物商品，需要填写完整的收货信息才能提交订单',
    add_shipping: '添加收货信息',
    edit_shipping: '修改收货信息'
  },
  common: {
    loading: '加载中...',
    error: '加载失败',
    currency: 'USDT',
    yes: '是',
    no: '否',
    cancel: '取消',
    confirm: '确定',
    save: '保存',
    notfoundpage: '页面未找到',
    backtohome: '返回首页'
  },
  shipping: {
    country: '国家/地区',
    select_country: '选择国家/地区',
    no_countries_found: '未找到国家',
    recipient: '收件人',
    recipient_required: '请输入收件人姓名',
    phone: '电话号码',
    phone_required: '请输入电话号码',
    phone_invalid: '电话号码格式不正确',
    postal_code: '邮政编码',
    postal_code_required: '请输入邮政编码',
    state: '省/州',
    state_required: '请输入省/州',
    city: '城市',
    city_required: '请输入城市',
    address1: '详细地址',
    address1_required: '请输入详细地址',
    address2: '详细地址 (可选)',
    note: '备注',
    country_required: '请选择国家/地区',
    save_for_later: '保存收件信息到本地，下次自动填写'
  }
}

export default zhMessages 
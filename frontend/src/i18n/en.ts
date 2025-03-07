// 英文翻译
const enMessages = {
  nav: {
    home: 'Home',
    products: 'Products',
    distributor: 'Distributor'
  },
  footer: {
    about: 'About Us',
    description: 'GitShop is an open-source e-commerce solution based on GitHub, designed for developers.',
    links: 'Links',
    about_us: 'About Us',
    terms: 'Terms of Use',
    contact: 'Contact Us',
    contact_info: 'For any questions or suggestions, please contact us via GitHub Issues.',
    rights: 'All rights reserved.'
  },
  home: {
    hero: {
      title: 'GitShop Marketplace',
      subtitle: 'Open-source e-commerce solution based on GitHub',
      description: 'Purchase high-quality digital products, support developers, and join our open-source community.',
      browse: 'Browse Products',
      become_distributor: 'Become a Distributor'
    },
    featured_categories: {
      title: 'Featured Categories',
      empty: 'No featured categories available'
    },
    featured_products: {
      title: 'Featured Products',
      empty: 'No featured products available'
    },
    all_products: {
      title: 'All Products',
      empty: 'No products available'
    },
    about: {
      title: 'About GitShop',
      subtitle: 'Open-source e-commerce solution based on GitHub',
      description: 'GitShop is an innovative e-commerce platform that leverages GitHub infrastructure to handle orders and distribution.',
      features: {
        open_source: {
          title: 'Open Source',
          description: 'All code is open source, allowing you to view, modify, and contribute. We believe in transparency and community collaboration.'
        },
        secure: {
          title: 'Secure Encryption',
          description: 'All user information is encrypted to ensure your data is secure. We use industry-standard encryption technology.'
        },
        distribution: {
          title: 'Distribution System',
          description: 'Become a distributor, promote products, and earn commissions. Our distribution system is easy to use and helps you earn extra income.'
        },
        fast_delivery: {
          title: 'Fast Delivery',
          description: 'Digital products are available immediately after purchase, with no need to wait for shipping. Get access to your products instantly.'
        }
      }
    }
  },
  product: {
    discount: 'Discount',
    reviews: 'Reviews',
    features: 'Features',
    add_to_cart: 'Add to Cart',
    remove_from_cart: 'Remove from Cart',
    added_to_cart: '{name} has been added to your cart',
    removed_from_cart: '{name} has been removed from your cart',
    buy_now: 'Buy Now',
    related_products: 'Related Products',
    no_related_products: 'No related products',
    description: 'Product Description',
    digital_product: 'Digital Product',
    physical_product: 'Physical Product',
    delivery_info: 'Delivery Information',
    delivery_method: 'Delivery Method',
    delivery_time: 'Delivery Time',
    stock: 'Stock',
    in_stock: 'In Stock',
    out_of_stock: 'Out of Stock',
    not_found: 'Product Not Found',
    not_found_message: 'Sorry, the product you are looking for does not exist or has been removed',
    browse_products: 'Browse Products',
    back_to_home: 'Back to Home',
    type: 'Product Type',
    additional_info: 'Additional Information',
    seller_info: 'Seller Information',
    official_store: 'Official Store',
    contact_seller: 'Contact Seller',
    guarantees: 'Guarantees',
    secure_payment: 'Secure Payment',
    authentic_guarantee: 'Authentic Guarantee',
    customer_support: 'Customer Support',
    tags: 'Tags',
    weight: 'Weight',
    dimensions: 'Dimensions',
    access_type: 'Access Type',
    duration: 'Duration',
    validity_period: 'Validity Period',
    origin: 'Origin',
    shelf_life: 'Shelf Life',
    storage: 'Storage',
    prerequisites: 'Prerequisites',
    language: 'Language',
    instructor: 'Instructor',
    certification: 'Certification',
    promotions: 'Promotions'
  },
  products: {
    title: 'All Products',
    all_products: 'All Products',
    filter_by_category: 'Filter by Category',
    all_categories: 'All Categories',
    sort_by: 'Sort by',
    sort_options: {
      price_low_high: 'Price: Low to High',
      price_high_low: 'Price: High to Low',
      newest: 'Newest',
      popularity: 'Popularity'
    },
    no_products: 'No products found matching your criteria',
    view_all_products: 'View All Products',
    items_count: 'items',
    previous: 'Previous',
    next: 'Next',
    browse_all_description: 'Browse our complete collection of products to find what you need',
    price_range: 'Price Range',
    apply_filter: 'Apply Filter',
    reset_filter: 'Reset Filter',
    in_stock_only: 'In Stock Only',
    product_type: 'Product Type',
    digital: 'Digital',
    physical: 'Physical',
    rating_above: 'Rating Above'
  },
  cart: {
    title: 'Shopping Cart',
    empty: 'Your cart is empty',
    empty_message: 'You have no items in your shopping cart. Start shopping now!',
    go_back: 'Go Back',
    items: 'Cart Items',
    clear: 'Clear Cart',
    total: 'Total',
    subtotal: 'Subtotal',
    discount: 'Discount',
    checkout: 'Submit Order',
    summary: 'Order Summary',
    order_info: 'Order Information',
    copy_order_info: 'Copy Order Info',
    create_github_issue: 'Create GitHub Issue',
    copy_success: 'Copied to clipboard!',
    order_submission_guide: 'How to Submit Your Order',
    order_guide_step1: '1. Click the "Create GitHub Issue" button below to open a new GitHub issue with your order details.',
    order_guide_step2: '2. Sign in to GitHub if prompted (you need a GitHub account to submit an order).',
    order_guide_step3: '3. Review the pre-filled information and click "Submit new issue" to complete your order.',
    order_details: 'Order Details',
    order_id: 'Order ID',
    complete_order: 'Complete Order & Clear Cart',
    complete_order_note: 'Click this button after you have submitted your GitHub issue.',
    mixed_products_notice: 'Your cart contains both physical and digital products. These two types of products need to be ordered separately.',
    shipping_info: 'Shipping Information',
    select_all: 'Select All',
    deselect_all: 'Deselect All',
    select_items_notice: 'Please select items to purchase',
    type_conflict_notice: 'Cannot select different types of products at the same time, please deselect current items first',
    no_shipping_info: 'No shipping information yet, please click the button on the right to add',
    shipping_info_incomplete: 'Shipping Information Incomplete',
    shipping_info_required: 'You have selected physical products, complete shipping information is required to submit the order',
    add_shipping: 'Add Shipping Info',
    edit_shipping: 'Edit Shipping Info'
  },
  common: {
    loading: 'Loading...',
    error: 'Failed to load',
    currency: 'USDT',
    yes: 'Yes',
    no: 'No',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    notfoundpage: 'Page Not Found',
    backtohome: 'Back to Home'
  },
  shipping: {
    country: 'Country',
    select_country: 'Select Country',
    no_countries_found: 'No countries found',
    recipient: 'Recipient',
    recipient_required: 'Please enter recipient name',
    phone: 'Phone Number',
    phone_required: 'Please enter phone number',
    phone_invalid: 'Invalid phone number format',
    postal_code: 'Postal Code',
    postal_code_required: 'Please enter postal code',
    state: 'State/Province',
    state_required: 'Please enter state/province',
    city: 'City',
    city_required: 'Please enter city',
    address1: 'Address Line 1',
    address1_required: 'Please enter address',
    address2: 'Address Line 2 (Optional)',
    note: 'Notes',
    country_required: 'Please select a country',
    save_for_later: 'Save shipping information locally for next time'
  }
}

export default enMessages 
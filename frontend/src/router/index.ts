import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/views/Home.vue'

// 添加调试信息，查看路由配置
console.log('路由配置初始化');

const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/category/:id?',
      name: 'category',
      component: () => import('@/views/Category.vue')
    },
    {
      path: '/product/:id',
      name: 'product',
      component: () => import('@/views/Product.vue'),
      // 添加路由进入前的钩子
      beforeEnter: (to, from, next) => {
        console.log('进入产品详情页面，参数:', to.params);
        next();
      }
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('@/views/Cart.vue')
    },
    {
      path: '/distributor',
      name: 'distributor',
      component: () => import('@/views/DistributorPanel.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFound.vue')
    }
  ]
})

export default router 
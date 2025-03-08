import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// 根据环境变量动态设置 base 路径
// 在开发环境中使用 '/'，在生产环境中使用 '/gitShop/'
const base = process.env.NODE_ENV === 'production' ? '/gitShop/' : '/'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base,  // 使用动态设置的 base 路径
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true
  }
}) 
import { createI18n } from 'vue-i18n'
import zhMessages from './zh'
import enMessages from './en'

// 创建i18n实例
const i18n = createI18n({
  legacy: false, // 使用Composition API模式
  locale: 'zh', // 默认语言
  fallbackLocale: 'en', // 回退语言
  messages: {
    zh: zhMessages,
    en: enMessages
  }
})

export default i18n 
<template>
  <div class="shipping-info-form">
    <div class="space-y-4">
      <!-- 国家/地区选择（自定义下拉菜单） -->
      <div>
        <label for="country" class="block text-sm font-medium text-gray-700">{{ $t('shipping.country') }} *</label>
        <div class="relative mt-1">
          <button 
            type="button" 
            @click="toggleCountryDropdown"
            class="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <span class="block truncate">
              {{ formData.country ? countries[formData.country as keyof typeof countries]?.name : $t('shipping.select_country') }}
            </span>
            <span class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </span>
          </button>
          
          <div 
            v-if="showCountryDropdown" 
            class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-96 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
          >
            <input 
              type="text" 
              v-model="countrySearchQuery" 
              :placeholder="$t('shipping.select_country')"
              class="w-full px-4 py-2 border-b border-gray-200 focus:outline-none"
              @click.stop
            />
            <div class="max-h-80 overflow-y-auto">
              <div
                v-for="(country, code) in filteredCountries" 
                :key="code" 
                @click="selectCountry(code)"
                class="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50"
                :class="{'bg-blue-50': formData.country === code}"
              >
                <span class="block truncate">{{ country.name }}</span>
                <span v-if="formData.country === code" class="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </span>
              </div>
              <div v-if="Object.keys(filteredCountries).length === 0" class="py-2 px-3 text-gray-500 text-center">
                {{ $t('shipping.no_countries_found') }}
              </div>
            </div>
          </div>
        </div>
        <p v-if="errors.country" class="mt-1 text-sm text-red-600">{{ errors.country }}</p>
      </div>
      
      <!-- 收件人姓名 -->
      <div>
        <label for="recipient" class="block text-sm font-medium text-gray-700">{{ $t('shipping.recipient') }} *</label>
        <input 
          type="text" 
          id="recipient" 
          v-model="formData.recipient" 
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          @blur="validateField('recipient')"
        >
        <p v-if="errors.recipient" class="mt-1 text-sm text-red-600">{{ errors.recipient }}</p>
      </div>
      
      <!-- 电话号码 -->
      <div>
        <label for="phone" class="block text-sm font-medium text-gray-700">{{ $t('shipping.phone') }} *</label>
        <div class="flex">
          <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
            {{ phonePrefix }}
          </span>
          <input 
            type="tel" 
            id="phone" 
            v-model="formData.phone" 
            class="flex-1 block w-full border border-gray-300 rounded-r-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            @input="formatPhoneNumber"
            @blur="validateField('phone')"
          >
        </div>
        <p v-if="errors.phone" class="mt-1 text-sm text-red-600">{{ errors.phone }}</p>
      </div>
      
      <!-- 邮政编码 -->
      <div v-if="countryConfig.fields.includes('postalCode')">
        <label for="postalCode" class="block text-sm font-medium text-gray-700">
          {{ countryConfig.labels.postalCode || $t('shipping.postal_code') }}
          <span v-if="countryConfig.required.includes('postalCode')">*</span>
        </label>
        <input 
          type="text" 
          id="postalCode" 
          v-model="formData.postalCode" 
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          @blur="validateField('postalCode')"
        >
        <p v-if="errors.postalCode" class="mt-1 text-sm text-red-600">{{ errors.postalCode }}</p>
      </div>
      
      <!-- 州/省/区 -->
      <div v-if="countryConfig.fields.includes('state')">
        <label for="state" class="block text-sm font-medium text-gray-700">
          {{ countryConfig.labels.state || $t('shipping.state') }}
          <span v-if="countryConfig.required.includes('state')">*</span>
        </label>
        <input 
          type="text" 
          id="state" 
          v-model="formData.state" 
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          @blur="validateField('state')"
        >
        <p v-if="errors.state" class="mt-1 text-sm text-red-600">{{ errors.state }}</p>
      </div>
      
      <!-- 城市 -->
      <div v-if="countryConfig.fields.includes('city')">
        <label for="city" class="block text-sm font-medium text-gray-700">
          {{ countryConfig.labels.city || $t('shipping.city') }}
          <span v-if="countryConfig.required.includes('city')">*</span>
        </label>
        <input 
          type="text" 
          id="city" 
          v-model="formData.city" 
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          @blur="validateField('city')"
        >
        <p v-if="errors.city" class="mt-1 text-sm text-red-600">{{ errors.city }}</p>
      </div>
      
      <!-- 详细地址1 -->
      <div>
        <label for="address1" class="block text-sm font-medium text-gray-700">{{ $t('shipping.address1') }} *</label>
        <input 
          type="text" 
          id="address1" 
          v-model="formData.address1" 
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          @blur="validateField('address1')"
        >
        <p v-if="errors.address1" class="mt-1 text-sm text-red-600">{{ errors.address1 }}</p>
      </div>
      
      <!-- 详细地址2 -->
      <div v-if="countryConfig.fields.includes('address2')">
        <label for="address2" class="block text-sm font-medium text-gray-700">
          {{ $t('shipping.address2') }}
        </label>
        <input 
          type="text" 
          id="address2" 
          v-model="formData.address2" 
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
      </div>
      
      <!-- 备注 -->
      <div>
        <label for="note" class="block text-sm font-medium text-gray-700">{{ $t('shipping.note') }}</label>
        <textarea 
          id="note" 
          v-model="formData.note" 
          rows="2" 
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        ></textarea>
      </div>
    </div>
    
    <!-- 按钮 -->
    <div class="mt-5 sm:mt-6">
      <!-- 保存收件信息选项 -->
      <div class="flex items-center mb-4">
        <input 
          type="checkbox" 
          id="saveForLater" 
          v-model="saveForLater" 
          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        >
        <label for="saveForLater" class="ml-2 block text-sm text-gray-700">
          {{ $t('shipping.save_for_later') }}
        </label>
      </div>
      
      <button 
        @click="saveShippingInfo" 
        class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
      >
        {{ $t('common.save') }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, reactive, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { parsePhoneNumberFromString, AsYouType, CountryCode } from 'libphonenumber-js'
import { countries } from 'countries-list'

// 类型定义
interface CountryConfig {
  fields: string[];
  required: string[];
  labels: Record<string, string>;
  example: string;
}

interface CountryConfigs {
  [key: string]: CountryConfig;
}

interface ShippingFormData {
  country: string;
  recipient: string;
  phone: string;
  postalCode: string;
  state: string;
  city: string;
  address1: string;
  address2: string;
  note: string;
  [key: string]: string;
}

interface ShippingFormErrors {
  country: string;
  recipient: string;
  phone: string;
  postalCode: string;
  state: string;
  city: string;
  address1: string;
  [key: string]: string;
}

// 国家配置
const countryConfigs: CountryConfigs = {
  US: {
    fields: ['postalCode', 'state', 'city', 'address1', 'address2'],
    required: ['postalCode', 'state', 'city', 'address1'],
    labels: {
      state: 'State',
      postalCode: 'ZIP Code'
    },
    example: ''
  },
  CN: {
    fields: ['state', 'city', 'address1'],
    required: ['state', 'city', 'address1'],
    labels: {
      state: '省/州',
      city: '城市'
    },
    example: ''
  },
  JP: {
    fields: ['postalCode', 'state', 'city', 'address1'],
    required: ['postalCode', 'state', 'city', 'address1'],
    labels: {
      state: 'Prefecture',
      postalCode: 'Postal Code'
    },
    example: ''
  },
  GB: {
    fields: ['postalCode', 'city', 'address1', 'address2'],
    required: ['postalCode', 'city', 'address1'],
    labels: {
      postalCode: 'Postcode'
    },
    example: ''
  },
  DE: {
    fields: ['postalCode', 'city', 'address1', 'address2'],
    required: ['postalCode', 'city', 'address1'],
    labels: {
      postalCode: 'PLZ'
    },
    example: ''
  },
  // 默认配置
  DEFAULT: {
    fields: ['postalCode', 'state', 'city', 'address1', 'address2'],
    required: ['city', 'address1'],
    labels: {
      state: 'State/Province',
      postalCode: 'Postal Code'
    },
    example: ''
  }
}

export default defineComponent({
  name: 'ShippingInfoForm',
  
  props: {
    initialValue: {
      type: Object,
      default: () => ({})
    }
  },
  
  emits: ['save', 'cancel'],
  
  setup(props, { emit }) {
    const { t } = useI18n()
    
    // 表单数据
    const formData = reactive<ShippingFormData>({
      country: props.initialValue.country || '',
      recipient: props.initialValue.recipient || '',
      phone: props.initialValue.phone || '',
      postalCode: props.initialValue.postalCode || '',
      state: props.initialValue.state || '',
      city: props.initialValue.city || '',
      address1: props.initialValue.address1 || '',
      address2: props.initialValue.address2 || '',
      note: props.initialValue.note || ''
    })
    
    // 是否保存收件信息
    const saveForLater = ref(false)
    
    // 错误信息
    const errors = reactive<ShippingFormErrors>({
      country: '',
      recipient: '',
      phone: '',
      postalCode: '',
      state: '',
      city: '',
      address1: ''
    })
    
    // 国家下拉菜单状态
    const showCountryDropdown = ref(false)
    const countrySearchQuery = ref('')
    
    // 过滤后的国家列表
    const filteredCountries = computed(() => {
      if (!countrySearchQuery.value) return countries
      
      const query = countrySearchQuery.value.toLowerCase()
      const result: Record<string, any> = {}
      
      Object.entries(countries).forEach(([code, country]) => {
        if (country.name.toLowerCase().includes(query) || 
            code.toLowerCase().includes(query) || 
            (country.native && country.native.toLowerCase().includes(query))) {
          result[code] = country
        }
      })
      
      return result
    })
    
    // 切换国家下拉菜单
    const toggleCountryDropdown = () => {
      showCountryDropdown.value = !showCountryDropdown.value
      if (showCountryDropdown.value) {
        countrySearchQuery.value = ''
      }
    }
    
    // 选择国家
    const selectCountry = (code: string) => {
      formData.country = code
      showCountryDropdown.value = false
      handleCountryChange()
    }
    
    // 点击外部关闭下拉菜单
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (showCountryDropdown.value && !target.closest('.relative')) {
        showCountryDropdown.value = false
      }
    }
    
    // 挂载和卸载事件监听器
    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
      
      // 只有当没有初始值时才从本地存储加载
      if (!props.initialValue.recipient) {
        const savedInfo = localStorage.getItem('shippingInfo')
        if (savedInfo) {
          const parsedInfo = JSON.parse(savedInfo)
          Object.keys(formData).forEach(key => {
            if (parsedInfo[key]) {
              formData[key] = parsedInfo[key]
            }
          })
        }
      }
    })
    
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })
    
    // 获取国家配置
    const countryConfig = computed(() => {
      return countryConfigs[formData.country as keyof typeof countryConfigs] || countryConfigs.DEFAULT
    })
    
    // 获取电话号码前缀
    const phonePrefix = computed(() => {
      if (!formData.country) return ''
      const country = countries[formData.country as keyof typeof countries]
      return country ? `+${country.phone}` : ''
    })
    
    // 处理国家变更
    const handleCountryChange = () => {
      // 清除错误
      Object.keys(errors).forEach(key => {
        errors[key as keyof ShippingFormErrors] = ''
      })
      
      // 格式化电话号码
      formatPhoneNumber()
    }
    
    // 格式化电话号码
    const formatPhoneNumber = () => {
      if (!formData.country || !formData.phone) return
      
      try {
        const formatter = new AsYouType(formData.country as CountryCode)
        formData.phone = formatter.input(formData.phone)
      } catch (error) {
        console.error('电话号码格式化错误:', error)
      }
    }
    
    // 验证字段
    const validateField = (field: keyof ShippingFormErrors) => {
      errors[field] = ''
      
      switch (field) {
        case 'country':
          if (!formData.country) {
            errors.country = t('shipping.country_required')
          }
          break
          
        case 'recipient':
          if (!formData.recipient) {
            errors.recipient = t('shipping.recipient_required')
          }
          break
          
        case 'phone':
          if (!formData.phone) {
            errors.phone = t('shipping.phone_required')
          } else if (formData.country) {
            try {
              const phoneNumber = parsePhoneNumberFromString(formData.phone, formData.country as CountryCode)
              if (phoneNumber && !phoneNumber.isValid()) {
                errors.phone = t('shipping.phone_invalid')
              }
            } catch (error) {
              console.error('电话号码验证错误:', error)
            }
          }
          break
          
        case 'postalCode':
          if (countryConfig.value.required.includes('postalCode') && !formData.postalCode) {
            errors.postalCode = t('shipping.postal_code_required')
          }
          break
          
        case 'state':
          if (countryConfig.value.required.includes('state') && !formData.state) {
            errors.state = t('shipping.state_required')
          }
          break
          
        case 'city':
          if (countryConfig.value.required.includes('city') && !formData.city) {
            errors.city = t('shipping.city_required')
          }
          break
          
        case 'address1':
          if (!formData.address1) {
            errors.address1 = t('shipping.address1_required')
          }
          break
      }
    }
    
    // 验证所有字段
    const validateAll = () => {
      validateField('country')
      validateField('recipient')
      validateField('phone')
      validateField('postalCode')
      validateField('state')
      validateField('city')
      validateField('address1')
      
      // 检查是否有错误
      return !Object.values(errors).some(error => error)
    }
    
    // 保存收货信息
    const saveShippingInfo = () => {
      if (validateAll()) {
        // 格式化地址为单一字符串（用于显示）
        let formattedAddress = ''
        
        if (formData.state) {
          formattedAddress += formData.state
        }
        
        if (formData.city) {
          formattedAddress += formattedAddress ? ', ' + formData.city : formData.city
        }
        
        if (formData.postalCode) {
          formattedAddress += ' ' + formData.postalCode
        }
        
        if (formData.address1) {
          formattedAddress += formattedAddress ? ', ' + formData.address1 : formData.address1
        }
        
        if (formData.address2) {
          formattedAddress += ', ' + formData.address2
        }
        
        const countryName = formData.country ? countries[formData.country as keyof typeof countries]?.name : ''
        if (countryName) {
          formattedAddress += ', ' + countryName
        }
        
        // 完整电话号码（包含国际区号）
        const fullPhoneNumber = phonePrefix.value + ' ' + formData.phone
        
        // 如果用户选择了保存收件信息，则保存到本地存储
        if (saveForLater.value) {
          localStorage.setItem('shippingInfo', JSON.stringify({
            ...formData,
            formattedAddress,
            fullPhoneNumber
          }))
        }
        
        // 发送完整的收货信息
        emit('save', {
          ...formData,
          formattedAddress,
          fullPhoneNumber
        })
      }
    }
    
    return {
      formData,
      errors,
      countries,
      countryConfig,
      phonePrefix,
      showCountryDropdown,
      countrySearchQuery,
      filteredCountries,
      saveForLater,
      toggleCountryDropdown,
      selectCountry,
      handleCountryChange,
      formatPhoneNumber,
      validateField,
      saveShippingInfo
    }
  }
})
</script>

<style scoped>
.max-h-40 {
  max-height: 10rem;
}
</style> 
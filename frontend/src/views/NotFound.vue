<template>
  <div class="flex flex-col items-center justify-center py-20">
    <h1 class="text-4xl font-bold text-gray-800 mb-4">404</h1>
    <p class="text-xl text-gray-600 mb-8">{{ t('common.notfoundpage') }}</p>
    <router-link to="/" class="btn-primary">
      {{ t('common.backtohome') }}
    </router-link>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

</script> 
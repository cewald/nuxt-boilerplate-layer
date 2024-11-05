<script setup lang="ts">
const { localeProperties, locale, locales, defaultLocale } = useI18n()
console.error(localeProperties.value, locale.value, locales.value, defaultLocale)
</script>

<template>
  <div>
    {{ $t('welcome') }}
  </div>
</template>

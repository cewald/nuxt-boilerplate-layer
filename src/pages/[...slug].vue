<script setup lang="ts">
import { useQuotesStore } from '@/stores/quotes'

const route = useRoute()
const { t } = useI18n()
const { fetchQuote } = useQuotesStore()

const quote = await fetchQuote(parseInt(route.params.slug[0]))

if (!quote) {
  throw showError({
    statusCode: 404,
    message: t('Quote not found'),
  })
}

useHead({
  title: quote?.author || 'Unknown',
  meta: [
    { name: 'description', content: quote?.quote },
  ],
})

definePageMeta({
  validate: async route => {
    return /^\d+$/.test(route.params.slug[0])
  },
})
</script>

<template>
  <div
    v-if="quote"
    class="px-10 md:mx-auto md:w-1/2 md:px-0"
  >
    <h1 class="sr-only">
      {{ $t('Lorem Ipsum') }}:
    </h1>
    <div class="mb-4 w-full text-4xl italic">
      "{{ quote.quote }}"
    </div>
    <div class="text-lg">
      – {{ quote.author }}
    </div>
  </div>
</template>

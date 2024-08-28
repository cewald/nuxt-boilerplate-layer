export type Quote = { quote: string, author: string, id: number }

export const useQuotesStore = defineStore('quotes', () => {
  const quotes = ref<Quote[]>([])

  async function fetchQuote(id: number) {
    const existing = quotes.value.find(q => q.id === id)
    if (existing) return Promise.resolve(existing)

    return await useFetch<Quote>(
      `https://dummyjson.com/quotes/${id}`,
      { pick: [ 'quote', 'author', 'id' ] }
    ).then(quote => {
      if (!quote.error.value && quote.data.value) {
        quotes.value.push(quote.data.value)
        return quote.data.value
      }

      return null
    })
  }

  return { quotes, fetchQuote }
})

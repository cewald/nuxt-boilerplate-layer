import StoryblokClient from 'storyblok-js-client'

let api: StoryblokClient

export const useStoryblokApiStore = defineStore('storyblok', () => {
  const cv = ref<number>(Date.now())
  const { storyblok } = useAppConfig()
  const { accessToken, region } = storyblok

  /**
   * This is a simple way to get the current locale and language from the i18n module if it exists
   * and mock its output if it doesn't. This is useful for the Storyblok API to know which language
   * is currently being used in the application. I didn't want to make the i18n module a dependency,
   * but still this should be considered.
   */
  const { locale, localeProperties, defaultLocale } = typeof useI18n === 'function'
    ? useI18n()
    : { locale: ref('en'), localeProperties: ref({ language: 'en-US' }), defaultLocale: 'en' }

  const language = computed(() => locale.value === defaultLocale ? 'default' : localeProperties.value.language)

  if (!api) {
    api = new StoryblokClient({
      accessToken,
      region,
      cache: { type: 'memory', clear: 'auto' },
    })
  }

  const requestDefaults = computed<SbStoryParams>(() => ({
    language: language.value?.toLowerCase(),
    version: import.meta.env.DEV === true ? 'draft' : 'published',
    cv: cv.value,
  }))

  return { api, requestDefaults, cv, language }
})

export const SbStoreUtilityFactory = <C = SbComponentType<string>>({
  path = '',
  items,
  notFound,
}: {
  path?: string
  items: Ref<SbStoryData<C>[]>
  notFound: Ref<string[]>
}) => {
  const SbApiStore = useStoryblokApiStore()
  const { api } = SbApiStore
  const { cv, requestDefaults } = toRefs(SbApiStore)

  /**
   * This is just a proxy method of the Storyblok API getStories method.
   * It will load stories from the Storyblok API and store them in the items ref.
   * But will not look after them in the store before.
   */
  const load = async (params: SbStoriesParams = {}) => {
    return api?.getStories({
      ...requestDefaults.value,
      cv: cv.value,
      starts_with: path,
      ...params,
    }).then(resp => {
      cv.value = resp?.data.cv
      items.value = (resp as SbStories<C>).data.stories
      return items.value
    })
  }

  const filterItemsBy = (value: string | string[], key: keyof typeof items.value[number] = 'slug') =>
    items.value?.filter(i => (Array.isArray(value) ? value.includes(i[key]) : i[key] === value)
      && i['lang'] === requestDefaults.value.language)

  const loadBySlug = async (slug: string) => {
    const checkIfExists = filterItemsBy(slug)
    if (checkIfExists.length > 0) return Promise.resolve(checkIfExists)

    const checkIfNotFound = notFound.value?.find(s => s === slug)
    if (checkIfNotFound) return Promise.reject(new Error('Not found'))

    return api?.getStory(`${path}/${slug}`, {
      ...requestDefaults.value,
      cv: cv.value,
    }).then(resp => {
      cv.value = resp?.data.cv
      const story = (resp as SbStory<C>).data.story
      items.value?.push(story)
      return story
    }).catch(err => {
      if (err.status !== 404) {
        console.error('Storyblok returned an error:', JSON.stringify(err))
      }

      notFound.value?.push(slug)
      return Promise.reject(new Error('Not found'))
    })
  }

  const loadBySlugs = async (slugs: string[]) => {
    const existing = filterItemsBy(slugs)
    if (existing.length === slugs.length) return Promise.resolve(existing)

    const checkNotFound = notFound.value?.filter(s => slugs.includes(s))
    if (slugs.length - existing.length === checkNotFound.length) {
      return Promise.reject(new Error(`Items "${checkNotFound.join('", "')}" already in not found list`))
    }

    const searchForSlugs = slugs.filter(s => !checkNotFound.includes(s) && !existing.find(e => e.slug === s))

    return api?.getStories({
      ...requestDefaults.value,
      cv: cv.value,
      by_slugs: searchForSlugs.join(','),
      starts_with: path,
    }).then(resp => {
      cv.value = resp?.data.cv
      const stories = (resp as SbStories<C>).data.stories
      items.value?.push(...stories)
      notFound.value?.push(...searchForSlugs.filter(s => !stories.find(st => st.slug === s)))
      return stories
    }).catch(err => {
      if (err.status !== 404) {
        console.error('Storyblok returned an error:', JSON.stringify(err))
      }

      notFound.value?.push(...searchForSlugs)
      return Promise.reject(new Error('Not found'))
    })
  }

  return { load, loadBySlug, loadBySlugs, filterItemsBy }
}

export const SbStoreFactory = <Component extends SbComponentType<string>>(storeName: string) => {
  return defineStore(storeName, () => {
    const items = ref<SbStoryData<Component>[]>([])
    const notFound = ref<string[]>([])
    const { load, loadBySlug, loadBySlugs, filterItemsBy }
      = SbStoreUtilityFactory<Component>({
        items: (items as unknown as Ref<SbStoryData<Component>[]>),
        notFound,
      })

    return { items, notFound, load, loadBySlug, loadBySlugs, filterItemsBy }
  })
}

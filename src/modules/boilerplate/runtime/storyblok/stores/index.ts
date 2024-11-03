import StoryblokClient from 'storyblok-js-client'

let api: StoryblokClient

export const useStoryblokApiStore = defineStore('storyblok', () => {
  const cv = ref<number>(Date.now())
  const { storyblok } = useAppConfig()
  const { accessToken, region } = storyblok

  const { locale, localeProperties, defaultLocale } = useI18n()
  const language = computed(() => locale.value === defaultLocale ? 'default' : localeProperties.value.language)

  if (!api) {
    api = new StoryblokClient({
      accessToken,
      region,
      cache: { type: 'memory', clear: 'auto' },
    })
  }

  const requestDefaults = computed<SbStoryParams>(() => ({
    language: language.value,
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
  const { api, requestDefaults } = SbApiStore
  const { cv } = toRefs(SbApiStore)

  const load = async (params: SbStoriesParams = {}) => {
    return api?.getStories({
      ...requestDefaults,
      cv: cv.value,
      starts_with: path,
      ...params,
    }).then(resp => {
      cv.value = resp?.data.cv
      items.value = (resp as SbStories<C>).data.stories
      return items.value
    })
  }

  const loadBySlug = async (slug: string) => {
    const checkIfExists = items.value?.find(s => s.slug === slug)
    if (checkIfExists) return Promise.resolve(checkIfExists)

    const checkIfNotFound = notFound.value?.find(s => s === slug)
    if (checkIfNotFound) return Promise.reject(new Error('Not found'))

    return api?.getStory(`${path}/${slug}`, {
      ...requestDefaults,
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
    const existing = items.value?.filter(s => slugs.includes(s.slug))
    if (existing.length === slugs.length) return Promise.resolve(existing)

    const checkNotFound = notFound.value?.filter(s => slugs.includes(s))
    if (slugs.length - existing.length === checkNotFound.length) {
      return Promise.reject(new Error(`Items "${checkNotFound.join('", "')}" already in not found list`))
    }

    const searchForSlugs = slugs.filter(s => !checkNotFound.includes(s) && !existing.find(e => e.slug === s))

    return api?.getStories({
      ...requestDefaults,
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

  return { load, loadBySlug, loadBySlugs }
}

export const SbStoreFactory = <Component extends SbComponentType<string>>(storeName: string) => {
  return defineStore(storeName, () => {
    const items = ref<SbStoryData<Component>[]>([])
    const notFound = ref<string[]>([])
    const { load, loadBySlug, loadBySlugs }
      = SbStoreUtilityFactory<Component>({
        items: (items as unknown as Ref<SbStoryData<Component>[]>),
        notFound,
      })

    return { items, notFound, load, loadBySlug, loadBySlugs }
  })
}

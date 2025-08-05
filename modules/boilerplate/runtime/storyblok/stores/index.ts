import StoryblokClient from 'storyblok-js-client'
import type { SbComponentNames } from '../types/storyblok.components.content'

let api: StoryblokClient

export const useStoryblokApiStore = defineStore('storyblok', () => {
  const cv = ref<number>(Date.now())
  const { storyblok } = useAppConfig()
  const { accessToken, region, editorMode, draftMode } = storyblok

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
    language: language.value?.toLowerCase(),
    version: draftMode || editorMode ? 'draft' : 'published',
    cv: cv.value,
    resolve_links: 'url',
  }))

  return { api, requestDefaults, cv, language }
})

export const SbStoreUtilityFactory = <C = SbComponentType<string>>({
  path = '',
  items,
  notFound,
  components,
}: {
  path?: string
  components?: SbComponentNames[]
  items: Ref<SbStoryData<C>[]>
  notFound: Ref<string[]>
}) => {
  const SbApiStore = useStoryblokApiStore()
  const { api } = SbApiStore
  const { cv, requestDefaults } = toRefs(SbApiStore)

  // Component filter query for requests
  const filter_query = components && components?.length > 0
    ? { filter_query: { component: { in: components.join(',') } } }
    : {}

  /**
   * This is just a proxy method of the Storyblok API getStories method.
   * It will load stories from the Storyblok API and store them in the items ref.
   * But will not look after them in the store before.
   */
  const load = async (params: SbStoriesParams = {}, crawlAll = false): Promise<SbStoryData<C>[]> => {
    const page = crawlAll ? params?.page || 1 : undefined
    const per_page = crawlAll ? params?.per_page || 100 : undefined

    return api?.getStories({
      ...requestDefaults.value,
      cv: cv.value,
      starts_with: path,
      page,
      per_page,
      ...useDeepMerge(filter_query, params),
    }).then(async resp => {
      cv.value = resp?.data.cv
      const respItems = (resp as SbStories<C>).data.stories

      if (crawlAll && items.value.length > 0 && page === 1) {
        items.value = respItems
      } else if (!crawlAll) {
        items.value = respItems
      } else {
        items.value.push(...respItems)
      }

      if (crawlAll && page && respItems.length > 0 && resp.total > items.value.length) {
        return await load({ ...params, page: page + 1 }, crawlAll)
      }

      return items.value
    })
  }

  const loadAll = async (params: SbStoriesParams = {}) => load(params, true)

  const itemsBy = (value: string | string[], key: keyof typeof items.value[number] = 'slug') =>
    computed(() => items.value?.filter(i => (Array.isArray(value) ? value.includes(i[key]) : i[key] === value)
      && i['lang'] === requestDefaults.value.language))

  const loadByUid = async (uid: string) => {
    const checkIfExists = itemsBy(uid, 'uuid')
    if (checkIfExists.value.length > 0) return Promise.resolve(checkIfExists.value[0])

    const checkIfNotFound = notFound.value?.find(s => s === uid)
    if (checkIfNotFound) return Promise.reject(new Error('Not found'))

    return api?.getStory(`${uid}`, {
      ...requestDefaults.value,
      find_by: 'uuid',
      cv: cv.value,
    }).then(resp => {
      if (components
        && components.length > 0
        && resp.data.story.content?.component
        && !components.includes(resp.data.story.content.component as SbComponentNames)) {
        throw new Error('Not found')
      }

      cv.value = resp?.data.cv
      const story = (resp as SbStory<C>).data.story
      items.value?.push(story)
      return story
    }).catch(err => {
      if (err.status !== 404) {
        console.error('Storyblok returned an error:', JSON.stringify(err))
      }

      notFound.value?.push(uid)
      return Promise.reject(new Error('Not found'))
    })
  }

  const loadBySlug = async (slug: string) => {
    const checkIfExists = itemsBy(slug)
    if (checkIfExists.value.length > 0) return Promise.resolve(checkIfExists.value[0])

    const checkIfNotFound = notFound.value?.find(s => s === slug)
    if (checkIfNotFound) return Promise.reject(new Error('Not found'))

    return api?.getStory(`${path}/${slug}`, {
      ...requestDefaults.value,
      cv: cv.value,
    }).then(resp => {
      if (components
        && components.length > 0
        && resp.data.story.content?.component
        && !components.includes(resp.data.story.content.component as SbComponentNames)) {
        throw new Error('Not found')
      }

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
    const existing = itemsBy(slugs)
    if (existing.value.length === slugs.length) return Promise.resolve(existing)

    const checkNotFound = notFound.value?.filter(s => slugs.includes(s))
    if (slugs.length - existing.value.length === checkNotFound.length) {
      return Promise.reject(new Error(`Items "${checkNotFound.join('", "')}" already in not found list`))
    }

    const searchForSlugs = slugs.filter(s => !checkNotFound.includes(s) && !existing.value.find(e => e.slug === s))

    return api?.getStories({
      ...requestDefaults.value,
      cv: cv.value,
      by_slugs: searchForSlugs.join(','),
      starts_with: path,
      ...filter_query,
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

  return { load, loadAll, loadByUid, loadBySlug, loadBySlugs, itemsBy }
}

export const SbStoreFactory = <Component extends SbComponentType<string>>(
  storeName: string,
  options: {
    path?: string
    components?: SbComponentNames[]
  } = {}
) => {
  const { path, components } = options
  return defineStore(storeName, () => {
    const items = ref<SbStoryData<Component>[]>([])
    const notFound = ref<string[]>([])
    const { load, loadAll, loadBySlug, loadByUid, loadBySlugs, itemsBy }
      = SbStoreUtilityFactory<Component>({
        path,
        components,
        items: (items as unknown as Ref<SbStoryData<Component>[]>),
        notFound,
      })

    return { items, notFound, load, loadAll, loadByUid, loadBySlug, loadBySlugs, itemsBy }
  })
}

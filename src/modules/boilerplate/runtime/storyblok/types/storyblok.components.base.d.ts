import type { ISbComponentType, ISbStoryData, ISbRichtext, ISbLinkURLObject } from 'storyblok-js-client'

export type SbComponentType = ISbComponentType
export type SbStoryData = ISbStoryData
export type SbRichText = ISbRichtext

export type SbImage = {
  id: number
  alt: string
  name: string
  focus: string
  title: string
  source: string
  copyright: string
  filename: string
  fieldtype: 'asset' | string
  meta_data: object
  is_external_url: boolean
}

export type SbLink = {
  id: string
  url: string
  linktype: 'url' | 'story'
  fieldtype: 'multilink'
  cached_url: string
}

export interface ISbStory<Content = SbComponentType<string>> {
  data: {
    cv: number
    links: (SbStoryData<Content> | ISbLinkURLObject)[]
    rels: SbStoryData<Content>[]
    story: SbStoryData<Content>
  }
  headers: unknown
}

export interface ISbStories<Content = SbComponentType<string>> {
  data: {
    cv: number
    links: (SbStoryData<Content> | ISbLinkURLObject)[]
    rels: SbStoryData<Content>[]
    stories: SbStoryData<Content>[]
  }
  perPage: number
  total: number
  headers: unknown
}

export type SbComponent<
  Name extends string,
  Options extends Record<string, unknown>
> = SbComponentType<Name> & Options

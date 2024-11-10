import type { VNode } from 'vue'
import type { StoryblokRichTextNode } from '@storyblok/richtext'

import type {
  ISbComponentType,
  ISbStoryData,
  ISbLinkURLObject,
  ISbStoryParams,
  ISbStoriesParams,
} from 'storyblok-js-client'

export type SbStoryParams = ISbStoryParams
export type SbStoriesParams = ISbStoriesParams

export interface SbStory<Content = SbComponentType<string>> {
  data: {
    cv: number
    links: (SbStoryData<Content> | ISbLinkURLObject)[]
    rels: SbStoryData<Content>[]
    story: SbStoryData<Content>
  }
  headers: unknown
}

export interface SbStories<Content = SbComponentType<string>> {
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

export type SbComponentType<T> = ISbComponentType<T>
export type SbStoryData<C> = ISbStoryData<C>
export type SbRichText<T = VNode> = StoryblokRichTextNode<T>

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
  linktype: 'url' | 'story' | 'email'
  url: string
  anchor?: string
  email?: string
  cached_url: string
  fieldtype: 'multilink'
  cached_url: string
}

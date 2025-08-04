import type { VNode } from 'vue'
import type { StoryblokRichTextNode, LinkTypes } from '@storyblok/richtext'

import type {
  ISbComponentType,
  ISbStoryData,
  ISbLinkURLObject,
  ISbStoryParams,
  ISbStoriesParams,
} from 'storyblok-js-client'

export type SbStoryParams = ISbStoryParams
export type SbStoriesParams = ISbStoriesParams

export interface SbStory<Content = SbComponentType<string>, Rels = SbComponents, Links = SbComponents> {
  data: {
    cv: number
    links: (SbStoryData<Links> | ISbLinkURLObject)[]
    rels: SbStoryData<Rels>[]
    story: SbStoryData<Content>
  }
  headers: unknown
}

export interface SbStories<Content = SbComponentType<string>, Rels = SbComponents, Links = SbComponents> {
  data: {
    cv: number
    links: (SbStoryData<Links> | ISbLinkURLObject)[]
    rels: SbStoryData<Rels>[]
    stories: SbStoryData<Content>[]
  }
  perPage: number
  total: number
  headers: unknown
}

export type SbComponent<
  Name extends string,
  Options extends Record<string, unknown>
> = SbComponentType<Name> & Options & { _uid: string, component: Name }

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
  linktype: LinkTypes
  fieldtype: 'multilink'
  id: string
  cached_url: string
  url: string
  anchor?: string
  email?: string
  target?: string
  story?: SbLinkStory
}

export type SbLinkStory = {
  name: string
  id: number
  uuid: string
  slug: string
  url: string
  full_slug: string
  _stopResolving: boolean
}

export type SbTable = {
  tbody: SbTableRow[]
  thead: SbTableHead[]
  fieldtype: 'table'
}

export type SbTableRow = {
  _uid: string
  body: SbTableCol[]
  component: '_table_row'
}

export type SbTableHead = {
  _uid: string
  value: string
  component: '_table_head'
}

export type SbTableCol = {
  _uid: string
  value: string
  component: '_table_col'
}

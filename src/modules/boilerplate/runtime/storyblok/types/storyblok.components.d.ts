declare global {

  export type {
    ISbComponentType as SbComponentType,
    ISbStoryData as SbStoryData,
    ISbRichtext as SbRichText,
  } from 'storyblok-js-client'

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

  export type SbComponentNavigationItemInternal = SbComponent<'link_internal', {
    title: string
    path: string
  }>

  export type SbComponentNavigationItemExternal = SbComponent<'link_external', {
    title: string
    path: string
  }>

  export type SbComponentNavigationItemMailTo = SbComponent<'link_mailto', {
    title: string
    email: string
  }>

  export type SbComponentLink = SbComponentNavigationItemInternal
    | SbComponentNavigationItemExternal
    | SbComponentNavigationItemMailTo
}

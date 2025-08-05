import type { SbComponent } from './storyblok.components.base'

export type SbComponentNames = 'contact_box'
  | 'image'
  | 'link'
  | 'link_external'
  | 'link_internal'
  | 'link_mailto'
  | 'page'
  | 'project'
  | 'project_artwork'
  | 'project_participant'
  | 'project_participant_logo'
  | 'project_participants'
  | 'project_program'
  | 'scroller'
  | 'settings'
  | 'soundcloud'
  | 'text'
  | 'vimeo'
  | 'youtube'
export type SbComponents = SbComponentContactBox
  | SbComponentImage
  | SbComponentLink
  | SbComponentLinkExternal
  | SbComponentLinkInternal
  | SbComponentLinkMailto
  | SbComponentPage
  | SbComponentProject
  | SbComponentProjectArtwork
  | SbComponentProjectParticipant
  | SbComponentProjectParticipantLogo
  | SbComponentProjectParticipants
  | SbComponentProjectProgram
  | SbComponentScroller
  | SbComponentSettings
  | SbComponentSoundcloud
  | SbComponentText
  | SbComponentVimeo
  | SbComponentYoutube
export type SbNestableComponentNames = 'contact_box'
  | 'image'
  | 'link'
  | 'link_external'
  | 'link_internal'
  | 'link_mailto'
  | 'project_artwork'
  | 'project_participant'
  | 'project_participant_logo'
  | 'project_participants'
  | 'project_program'
  | 'scroller'
  | 'soundcloud'
  | 'text'
  | 'vimeo'
  | 'youtube'
export type SbNestableComponents = SbComponentContactBox
  | SbComponentImage
  | SbComponentLink
  | SbComponentLinkExternal
  | SbComponentLinkInternal
  | SbComponentLinkMailto
  | SbComponentProjectArtwork
  | SbComponentProjectParticipant
  | SbComponentProjectParticipantLogo
  | SbComponentProjectParticipants
  | SbComponentProjectProgram
  | SbComponentScroller
  | SbComponentSoundcloud
  | SbComponentText
  | SbComponentVimeo
  | SbComponentYoutube
export type SbContentTypeComponentNames = 'page'
  | 'project'
  | 'settings'
export type SbContentTypeComponents = SbComponentPage
  | SbComponentProject
  | SbComponentSettings
export type SbComponentContactBox = SbComponent<'contact_box', {
  title: string
  address: string
  email: string
  instagram: string }>
export type SbComponentImage = SbComponent<'image', {
  image: SbImage
  preload: boolean }>
export type SbComponentLink = SbComponent<'link', {
  url: string
  class: string
  title: string }>
export type SbComponentLinkExternal = SbComponent<'link_external', {
  title: string
  path: string
  show_disabled: boolean }>
export type SbComponentLinkInternal = SbComponent<'link_internal', {
  title: string
  path: string
  show_disabled: boolean }>
export type SbComponentLinkMailto = SbComponent<'link_mailto', {
  title: string
  email: string }>
export type SbComponentPage = SbComponent<'page', {
  title: string
  hide_title: boolean
  body: (SbComponentContactBox
    | SbComponentImage
    | SbComponentLink
    | SbComponentScroller
    | SbComponentSoundcloud
    | SbComponentText
    | SbComponentVimeo
    | SbComponentYoutube)[]
  meta_title: string
  meta_description: string
  robots: 'index, follow' | 'index, nofollow' | 'noindex, nofollow' | 'noindex, follow' }>
export type SbComponentProject = SbComponent<'project', {
  title: string
  date_from: string
  date_to: string
  key_visual: SbImage
  key_visual_mobile: SbImage
  about: SbRichText
  additional_text: SbRichText
  disclaimer: SbRichText
  participants: (SbComponentProjectParticipants)[]
  participants_logos: (SbComponentProjectParticipantLogo)[]
  default_artwork_description: SbRichText
  artworks: (SbComponentProjectArtwork)[]
  program: (SbComponentProjectProgram)[]
  meta_title: string
  meta_description: string
  robots: 'index, follow' | 'index, nofollow' | 'noindex, nofollow' | 'noindex, follow' }>
export type SbComponentProjectArtwork = SbComponent<'project_artwork', {
  artwork: SbImage
  slug: string
  title: string
  description: SbRichText
  original: string
  additional_content: (SbComponentContactBox
    | SbComponentImage
    | SbComponentLink
    | SbComponentScroller
    | SbComponentSoundcloud
    | SbComponentText
    | SbComponentVimeo
    | SbComponentYoutube)[] }>
export type SbComponentProjectParticipant = SbComponent<'project_participant', {
  name: string
  link: string }>
export type SbComponentProjectParticipantLogo = SbComponent<'project_participant_logo', {
  image: SbImage
  link: string }>
export type SbComponentProjectParticipants = SbComponent<'project_participants', {
  group: string
  names: (SbComponentProjectParticipant)[]
  inline: boolean }>
export type SbComponentProjectProgram = SbComponent<'project_program', {
  title: string
  schedule: string
  description: SbRichText }>
export type SbComponentScroller = SbComponent<'scroller', {
  title: string
  text: string }>
export type SbComponentSettings = SbComponent<'settings', {
  navigation: (SbComponentLinkExternal
    | SbComponentLinkInternal
    | SbComponentLinkMailto)[]
  archive: (string)[]
  default_project: string
  meta_title: string
  meta_description: string
  robots: 'index, follow' | 'index, nofollow' | 'noindex, nofollow' | 'noindex, follow' }>
export type SbComponentSoundcloud = SbComponent<'soundcloud', {
  title: string
  placeholder: string
  url: string }>
export type SbComponentText = SbComponent<'text', {
  text: SbRichText
  ltr: boolean }>
export type SbComponentVimeo = SbComponent<'vimeo', {
  url: string
  title: string
  placeholder: string }>
export type SbComponentYoutube = SbComponent<'youtube', {
  url: string
  title: string
  placeholder: string }>

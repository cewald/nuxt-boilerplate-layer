import { h, createTextVNode } from 'vue'
import type { VNode } from 'vue'
import { nameToEmoji } from 'gemoji'

import {
  richTextResolver,
  MarkTypes as MarkTypesEnum,
  BlockTypes as BlockTypesEnum,
  LinkTypes as LinkTypesEnum,
} from '@storyblok/richtext'

import type {
  StoryblokRichTextOptions,
  StoryblokRichTextNodeResolver,
} from '@storyblok/richtext'

/**
 * The next types are copies from enums of the @storyblok/richtext package (MarkTypes, BlockTypes, TextTypes).
 * unfortunately, it is not possible to transform enum values into a string literal union type, that we
 * need in our code for sufficiant key validation. Thats way we have to copy the values here.
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const blockTypes = [
  'doc', 'heading', 'paragraph', 'blockquote', 'ordered_list', 'bullet_list',
  'list_item', 'code_block', 'horizontal_rule', 'hard_break', 'image',
  'emoji', 'blok',
] as const

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const markTypes = [
  'bold', 'strong', 'strike', 'underline', 'italic', 'code', 'link',
  'anchor', 'styled', 'superscript', 'subscript', 'textStyle', 'highlight',
] as const

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const textTypes = [ 'text' ] as const

export type MarkTypes = typeof markTypes[number]
export type BlockTypes = typeof blockTypes[number]
export type TextTypes = typeof textTypes[number]

const headingTypes = [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ] as const
export type HeadingTypes = typeof headingTypes[number]

export type NodesKeys = HeadingTypes | MarkTypes | BlockTypes | TextTypes
export type RteSchema = Partial<Record<NodesKeys, [string, string]>>
export type RteClasses = Partial<Record<NodesKeys, string>>

export const useSbRichTextResolver = (
  classes: RteClasses = {},
  LinkComponent?: ReturnType<typeof resolveComponent>,
  sbLanguageCodes: string[] = []
) => {
  const schemaMap: RteSchema = {
    [MarkTypesEnum.ITALIC]: [ 'em', 'font-italic' ],
    [MarkTypesEnum.BOLD]: [ 'strong', 'font-semibold' ],
    [MarkTypesEnum.STRONG]: [ 'strong', 'font-semibold' ],
    [MarkTypesEnum.UNDERLINE]: [ 'u', 'underline-offset-8' ],
    [MarkTypesEnum.STRIKE]: [ 's', 'line-through' ],
    [MarkTypesEnum.LINK]: [ 'a', 'underline underline-offset-8' ],
    [MarkTypesEnum.SUBSCRIPT]: [ 'sub', '' ],
    [MarkTypesEnum.SUPERSCRIPT]: [ 'super', '' ],
    [BlockTypesEnum.PARAGRAPH]: [ 'p', 'mb-8' ],
    [BlockTypesEnum.OL_LIST]: [ 'ol', 'list-decimal mb-8 ml-8' ],
    [BlockTypesEnum.UL_LIST]: [ 'ul', 'list-disc mb-8 ml-8' ],
    [BlockTypesEnum.LIST_ITEM]: [ 'li', '' ],
    [BlockTypesEnum.EMOJI]: [ 'span', '' ],
  }

  for (const key in classes) {
    if (Object.values(headingTypes).includes(key as HeadingTypes)) continue

    const tag = schemaMap[key as NodesKeys]?.[0]
    const classNames = classes[key as NodesKeys]
    if (!tag || !classNames) continue

    schemaMap[key as NodesKeys] = [ tag, classNames ]
  }

  const tailwindResolvers: Partial<Record<NodesKeys, StoryblokRichTextNodeResolver<VNode>>> = {}
  for (const key in schemaMap) {
    if (!schemaMap[key as NodesKeys]) continue
    const resolver: StoryblokRichTextNodeResolver<VNode> = node => {
      return h(
        schemaMap[key as NodesKeys]?.[0] || 'div',
        { ...node.attrs, class: schemaMap[key as NodesKeys]?.[1] },
        node.children || node.text
      )
    }
    tailwindResolvers[key as NodesKeys] = resolver
  }

  const rteOptions: StoryblokRichTextOptions<VNode> = {
    renderFn: h,
    textFn: createTextVNode,
    resolvers: {
      ...tailwindResolvers,
      [MarkTypesEnum.STYLED]: node => {
        return node.text as unknown as VNode
      },
      [MarkTypesEnum.TEXT_STYLE]: node => {
        return node.text as unknown as VNode
      },
      [BlockTypesEnum.HEADING]: node => {
        const { level, ...rest } = node.attrs || {}
        const attributes = { ...rest, class: classes[`h${level}` as NodesKeys] }
        return h(`h${level}`, attributes, node.children)
      },
      [MarkTypesEnum.LINK]: node => {
        const { anchor, linktype, href: href1, ...rest } = node.attrs || {}
        let { href } = node.attrs as { href: string } || {}

        if (anchor) {
          href = `${href}#${anchor}`
        } else if (linktype === LinkTypesEnum.EMAIL) {
          href = `mailto:${href}`
        }

        if (linktype === LinkTypesEnum.STORY) {
          // Storyblok links are prefixed with the language code, but the NuxtLink component is handling it anyways
          href = sbLanguageCodes.reduce((l, c) => l.replace(new RegExp(`^/${c}`), ''), href)
          return h(
            LinkComponent || 'a',
            { ...rest, href, class: schemaMap[node.type as NodesKeys]?.[1] },
            LinkComponent
              ? () => node.children || node.text
              : node.children || node.text
          )
        }

        return h(
          'a',
          { ...rest, href, class: schemaMap[node.type as NodesKeys]?.[1] },
          node.children || node.text
        )
      },
      [BlockTypesEnum.EMOJI]: node => {
        return h(
          schemaMap[node.type as NodesKeys]?.[0] || 'span',
          { class: schemaMap[node.type as NodesKeys]?.[1] },
          nameToEmoji[node.attrs?.name] || `:${node.attrs?.name}:`
        )
      },
    },
  }

  const render = <C extends VNode, T extends SbRichText<C>>(data: T) => {
    return richTextResolver(rteOptions).render(data)
  }

  return { render }
}

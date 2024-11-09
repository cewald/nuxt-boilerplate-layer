import { h, createTextVNode } from 'vue'
import type { VNode } from 'vue'

import {
  richTextResolver,
  MarkTypes,
  BlockTypes,
  LinkTypes,
} from '@storyblok/richtext'

import type {
  StoryblokRichTextOptions,
  StoryblokRichTextNodeResolver,
  StoryblokRichTextNodeTypes,
} from '@storyblok/richtext'

export type NodesKeys = StoryblokRichTextNodeTypes | HeadingTypes
export type RteSchema = Partial<Record<NodesKeys, [string, string]>>
export type RteClasses = Partial<Record<NodesKeys, string>>

export enum HeadingTypes {
  H1 = 'h1',
  H2 = 'h2',
  H3 = 'h3',
  H4 = 'h4',
  H5 = 'h5',
  H6 = 'h6'
}

export const useSbRichTextResolver = (
  classes: RteClasses = {},
  LinkComponent?: ReturnType<typeof resolveComponent>
) => {
  const schemaMap: RteSchema = {
    [MarkTypes.ITALIC]: [ 'em', 'font-italic' ],
    [MarkTypes.BOLD]: [ 'strong', 'font-semibold' ],
    [MarkTypes.STRONG]: [ 'strong', 'font-semibold' ],
    [MarkTypes.UNDERLINE]: [ 'u', 'underline-offset-8' ],
    [MarkTypes.STRIKE]: [ 's', 'line-through' ],
    [MarkTypes.LINK]: [ 'a', 'underline underline-offset-8' ],
    [BlockTypes.PARAGRAPH]: [ 'p', 'mb-8' ],
    [BlockTypes.OL_LIST]: [ 'ol', 'list-decimal list-inside' ],
    [BlockTypes.UL_LIST]: [ 'ul', 'list-disc list-inside' ],
  }

  for (const key in classes) {
    if (Object.values(HeadingTypes).includes(key as HeadingTypes)) continue

    const tag = schemaMap[key as NodesKeys]?.[0]
    const classNames = classes[key as NodesKeys]
    if (!tag || !classNames) continue

    schemaMap[key as NodesKeys] = [ tag, classNames ]
  }

  const tailwindResolvers: Partial<Record<NodesKeys, StoryblokRichTextNodeResolver<VNode>>> = {}
  for (const key in schemaMap) {
    if (!schemaMap[key as StoryblokRichTextNodeTypes]) continue
    const resolver: StoryblokRichTextNodeResolver<VNode> = node => {
      return h(
        schemaMap[key as StoryblokRichTextNodeTypes]?.[0] || 'div',
        { ...node.attrs, class: schemaMap[key as StoryblokRichTextNodeTypes]?.[1] },
        node.children || node.text
      )
    }
    tailwindResolvers[key as StoryblokRichTextNodeTypes] = resolver
  }

  const test: string = 'blok'
  schemaMap[test as NodesKeys] = [ 'div', '' ]

  const rteOptions: StoryblokRichTextOptions<VNode> = {
    renderFn: h,
    textFn: createTextVNode,
    resolvers: {
      ...tailwindResolvers,
      [MarkTypes.STYLED]: node => {
        return node.text as unknown as VNode
      },
      [MarkTypes.TEXT_STYLE]: node => {
        return node.text as unknown as VNode
      },
      [BlockTypes.HEADING]: node => {
        const { level, ...rest } = node.attrs || {}
        const attributes = { ...rest, class: classes[`h${level}` as NodesKeys] }
        return h(`h${level}`, attributes, node.children)
      },
      [MarkTypes.LINK]: node => {
        const { anchor, linktype, href: href1, ...rest } = node.attrs || {}
        let { href } = node.attrs || {}

        if (anchor) {
          href = `${href}#${anchor}`
        } else if (linktype === LinkTypes.EMAIL) {
          href = `mailto:${href}`
        }

        return h(
          linktype === LinkTypes.STORY ? LinkComponent || 'a' : 'a',
          { ...rest, href, class: schemaMap[node.type as NodesKeys]?.[1] },
          LinkComponent
            ? () => node.children || node.text
            : node.children || node.text
        )
      },
    },
  }

  const render = <C extends VNode, T extends SbRichText<C>>(data: T) => {
    return richTextResolver(rteOptions).render(data)
  }

  return { render }
}

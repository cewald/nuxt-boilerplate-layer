import { RichtextSchema, RichtextResolver } from 'storyblok-js-client'
import type { ISbRichtext, ISbNode } from 'storyblok-js-client'

export type RteClasses = {
  italic?: string
  strong?: string
  bold?: string
  strike?: string
  underline?: string
  paragraph?: string
  link?: string
  textStyle?: string
  heading?: Record<string, string>
}

export const useSbRichTextResolver = (classes: RteClasses = {}) => {
  const schema = cloneDeep(RichtextSchema)

  classes = {
    italic: 'font-italic',
    bold: 'font-semibold',
    strong: 'font-semibold',
    underline: 'underline-offset-8',
    strike: 'line-through',
    paragraph: 'mb-8',
    link: 'underline underline-offset-8',
    ...classes,
  }

  const tagMap: Record<string, string> = {
    italic: 'i',
    strong: 'strong',
    bold: 'strong',
    strike: 'strike',
    underline: 'u',
    paragraph: 'p',
    heading: 'h',
    link: 'a',
    textStyle: '',
  }

  for (const row of Object.entries(classes)) {
    const [ key, value ] = row as [ keyof RteClasses, RteClasses[keyof RteClasses]]
    const schemaKey: keyof (typeof schema) = Object.keys(schema.nodes).includes(key) ? 'nodes' : 'marks'
    const classValue = (n: ISbNode) => {
      if (typeof value === 'object' && n?.attrs?.level) {
        return value[n?.attrs?.level] ? { class: value[n?.attrs?.level] } : {}
      }
      return { class: value as string }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (schema as any)[schemaKey][key] = (n: ISbNode) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const orgResolved = (RichtextSchema as any)[schemaKey][key](n)

      if (key === 'link') {
        const { linktype } = n.attrs
        if (linktype === 'story') {
          (orgResolved?.tag[0] || {}).attrs.href = orgResolved?.tag[0]?.attrs.href
        } else {
          (orgResolved?.tag[0] || {}).attrs.target = '_blank'
        }
      }

      return { tag: [ {
        tag: `${tagMap[key] ?? orgResolved?.tag ?? 'p'}${n?.attrs?.level ?? ''}`,
        attrs: { ...orgResolved?.tag[0]?.attrs, ...classValue(n) } },
      ] }
    }
  }

  const rteResolver = new RichtextResolver(schema)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const render = (data?: ISbRichtext, options?: any) => {
    return rteResolver.render(data, options)
  }

  return { rteResolver, render }
}

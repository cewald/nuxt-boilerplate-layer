export const isRichTextEmpty = (rt: SbRichText) => {
  return !rt || !rt.content || !rt.content.length || (rt.content.length === 1 && !rt.content[0]?.content)
}

export default isRichTextEmpty

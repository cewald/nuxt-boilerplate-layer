export const useSbImage = () => {
  const filenameRegExp = (file: SbImage) => {
    const regex = /storyblok.com\/\w\/(?<id>\d+)\/(?<sizes>\d+x\d+)\/(\w+)(?<path>.*)$/m
    return (regex.exec(file.filename)?.groups as { id: string; sizes: string; path: string }) || null
  }

  const getFileDimenstions = (file: SbImage) => {
    const split = filenameRegExp(file)?.sizes.split('x')
    return { width: parseInt(split[0] || '0'), height: parseInt(split[1] || '0') }
  }

  const getPath = (width: number = 0, height: number = 0, image: SbImage, format?: string, quality?: number) => {
    if (isSVG(image)) return image.filename
    let filename = `${image.filename}/m/${width}x${height}`
    if (format || filename) {
      filename = `${filename}/filters`
    }
    if (format) {
      filename = `${filename}:format(${format})`
    }
    if (quality) {
      filename = `${filename}:quality(${quality})`
    }
    return filename
  }

  const getRatio = (width: number = 0, height: number = 0, ratio: string) => {
    const [oWidth, oHeight] = ratio.split(':').map(n => parseInt(n)) as [number, number]
    if (width === 0 && height === 0) return { width: oWidth, height: oHeight }
    if (height === 0 && width > 0) {
      return { width, height: Math.round((width / oWidth) * oHeight) }
    } else if (width === 0 && height > 0) {
      return { width: Math.round((height / oHeight) * oWidth), height }
    }
    return { width, height }
  }

  const isSVG = (file: SbImage) => /\.svg$/.test(file.filename)

  return { filenameRegExp, getFileDimenstions, getPath, getRatio, isSVG }
}

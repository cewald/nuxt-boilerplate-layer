export const getSbImageOrientation = (image: SbImage) => {
  const result = image.filename.match(/(\d{3,4})x(\d{3,4})/)?.slice(1) || [ '0', '0' ]
  const [ w, h ] = result.map(i => parseInt(i))
  if (!w || !h) {
    console.warn('Invalid image dimensions for:', image.filename, '. Defaulting to portrait orientation.')
    return 'portrait'
  }
  return w === h ? 'square' : (w > h ? 'landscape' : 'portrait')
}

export default getSbImageOrientation

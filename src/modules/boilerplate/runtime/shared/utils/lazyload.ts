export const lazyload = (picture: HTMLPictureElement, callback?: (p: typeof picture) => void) => {
  const observer = new IntersectionObserver(([ { isIntersecting } ]) => {
    if (isIntersecting) {
      ([ ...picture.children ] as (HTMLSourceElement | HTMLImageElement)[]).forEach(e => {
        e.src = e.dataset.srcset as string
        e.srcset = e.dataset.srcset as string
        delete e.dataset.src
        delete e.dataset.srcset

        e.classList.add('lazy')
        e.addEventListener('load', () => {
          e.classList.remove('lazy')
          e.classList.add('loaded')
          if (callback) callback(picture)
        })
      })
      observer.unobserve(picture)
    }
  })

  observer.observe(picture)
}

export default lazyload

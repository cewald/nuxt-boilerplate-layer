export const useLoadScript = (scriptUrl: string, windowKey?: string) => {
  const isReady = ref(false)
  const script = ref(scriptUrl)
  const key = ref(windowKey)
  const scriptTag = ref(document?.createElement('script'))

  function _loadScript(script: string, windowKey?: string) {
    return new Promise<boolean>(resolve => {
      if (!document) return resolve(false)
      if (windowKey && window[windowKey as keyof Window]) return resolve(true)
      scriptTag.value.async = true
      scriptTag.value.src = script
      scriptTag.value.onload = () => resolve(true)
      document?.body.appendChild(scriptTag.value)
    })
  }

  const loadScript = () => _loadScript(script.value, key.value)
    .then(status => isReady.value = status)

  onUnmounted(() => {
    scriptTag.value.remove()
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    if (key.value) delete window[key.value as keyof Window]
  })

  return { isReady, loadScript, _loadScript }
}

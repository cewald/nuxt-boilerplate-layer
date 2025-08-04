export const cloneDeep = function <T = Record<string, unknown>>(obj: T) {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  const clone: T = {} as T
  for (const key in obj) {
    clone[key] = cloneDeep(obj[key])
  }

  return clone
}

export default cloneDeep

import type { z, ZodObject, ZodRawShape, ZodType } from 'zod'
import deepEqual from 'fast-deep-equal'

export default function<T extends ZodRawShape>
(
  schema: ZodObject<T>,
  data: MaybeRefOrGetter<Record<string, unknown>>
) {
  type SchemaType = z.infer<ZodType<T>>
  type SchemaKeys = keyof SchemaType

  const isValid = ref(true)
  const errors = ref<Record<string, z.ZodIssue[]> | null>(null)
  const initialData = { ...toValue(data) }
  const isTouched = ref(false)

  const clearErrors = () => {
    errors.value = null
  }

  watch(() => toValue(data), () => {
    isTouched.value = !deepEqual(toValue(data), initialData)

    if (isValid.value) return
    validate()
  }, { deep: true })

  const validate = () => {
    clearErrors()

    const { success, error } = schema.safeParse(toValue(data))

    isValid.value = success

    if (!success) {
      const errCollector: Record<string, z.ZodIssue[]> = {}
      error.issues.forEach(issue => {
        issue.path.forEach(path => {
          if (!errCollector[path]) {
            errCollector[path] = [ issue ]
          } else {
            errCollector[path].push(issue)
          }
        })
      })

      errors.value = errCollector
    }

    return errors
  }

  const getError = (path: string) => {
    if (errors.value && errors.value[path]) {
      return errors.value[path][0]
    }
    return null
  }

  const errorMessages = computed(() => {
    if (errors.value) {
      const messages = new Map<string, string[]>()
      for (const key in errors.value) {
        messages.set(key, errors.value[key].map(err => err.message))
      }
      return messages
    }
    return null
  })

  function isRequired(key: SchemaKeys) {
    const keySchema = schema.shape
    return !keySchema[key].isOptional()
  }

  return {
    validate,
    errors,
    isTouched,
    isValid,
    isRequired,
    clearErrors,
    getError,
    errorMessages,
  }
}

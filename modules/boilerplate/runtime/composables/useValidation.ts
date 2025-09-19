import deepEqual from 'fast-deep-equal'
import type { z, ZodObject, ZodRawShape, ZodType } from 'zod'

export default function <T extends ZodRawShape>(schema: ZodObject<T>, data: MaybeRefOrGetter<Record<string, unknown>>) {
  type SchemaType = z.infer<ZodType<T>>
  type SchemaKeys = keyof SchemaType

  const isValid = ref(true)
  const errors = ref<Record<string, z.core.$ZodIssue[]> | null>(null)
  const initialData = { ...toValue(data) }
  const isTouched = ref(false)

  const clearErrors = () => {
    errors.value = null
  }

  watch(
    () => toValue(data),
    () => {
      isTouched.value = !deepEqual(toValue(data), initialData)

      if (isValid.value) return
      validate()
    },
    { deep: true },
  )

  const validate = () => {
    clearErrors()

    const { success, error } = schema.safeParse(toValue(data))

    isValid.value = success

    if (!success) {
      const errCollector: Record<string, z.ZodIssue[]> = {}
      error.issues.forEach(issue => {
        ;(issue.path as string[]).forEach(path => {
          if (!errCollector?.[path]) {
            errCollector[path] = [issue]
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
        if (!errors?.value?.[key]) continue
        messages.set(
          key,
          errors?.value?.[key]?.map(err => err.message),
        )
      }
      return messages
    }
    return null
  })

  /**
   * isOptional() got deprecated in Zod v4, so we need to use a workaround
   * to check if a field is required or not. We pick the field from the schema
   * and check if it is optional by trying to parse an undefined value.
   * @see https://github.com/settlemint/asset-tokenization-kit/pull/2882
   */
  function isRequired(field: SchemaKeys) {
    const mask = { [field as keyof SchemaKeys]: true as const } as { [K in SchemaKeys]: true }
    const fieldSchema = schema.pick(mask)
    const isOptional = fieldSchema.safeParse({
      [field]: undefined,
    }).success

    return !isOptional
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

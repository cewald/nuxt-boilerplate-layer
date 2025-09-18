export type ComplianceStates = 'accepted' | 'declined'

export const useDataCompliance = (options?: { maxAge?: number; key?: string }) => {
  const { maxAge = 60 * 60 * 24 * 14, key = 'data-compliance' } = options || {}

  const cookie = useCookie<ComplianceStates>(key, { maxAge })
  const compliance = useState<ComplianceStates>(key, () => cookie.value)

  const accept = () => {
    cookie.value = 'accepted'
    compliance.value = 'accepted'
  }

  const decline = () => {
    cookie.value = 'declined'
    compliance.value = 'declined'
  }

  const accepted = computed(() => compliance.value === 'accepted')
  const declined = computed(() => compliance.value === 'declined')
  const complied = computed(() => !!compliance.value)

  const watchCompliance = (handler: (v: typeof accepted, c: typeof complied) => void) => {
    const stop = watchEffect(() => {
      handler(accepted, complied)
    })
    return stop
  }

  return {
    cookie,
    compliance,
    complied,
    accepted,
    declined,
    accept,
    decline,
    watchCompliance,
  }
}

export default useDataCompliance

export type ComplianceStates = 'accepted' | 'declined'

export const useDataCompliance = () => {
  const cookie = useCookie<ComplianceStates>('data-compliance', { maxAge: 60 * 60 * 24 })
  const compliance = useState<ComplianceStates>('data-compliance', () => cookie.value)

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

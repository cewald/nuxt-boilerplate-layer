export const useDataCompliance = () => {
  const cookie = useCookie('data-compliance', { maxAge: 60 * 60 * 24 })
  const visible = useState('data-compliance', () => false)

  const toggleDialog = (value?: boolean) => visible.value = value ?? !visible.value

  const accept = () => {
    cookie.value = 'accepted'
  }

  const decline = () => {
    cookie.value = 'declined'
  }

  const accepted = computed(() => cookie.value === 'accepted')
  const declined = computed(() => cookie.value === 'declined')

  const watchAccept = (handler: (v: typeof accepted) => void) => {
    const stop = watchEffect(() => {
      handler(accepted)
    })
    return stop
  }

  return { cookie, accepted, declined, accept, decline, toggleDialog, dialogVisible: visible, watchAccept }
}

export default useDataCompliance

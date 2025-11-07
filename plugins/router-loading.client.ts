export default defineNuxtPlugin((nuxtApp) => {
  if (process.server) return
  const router = useRouter()
  const indicator = useLoadingIndicator()
  const loading = useState<boolean>('page-loading', () => false)
  let overlayTimer: any = null

  const stop = () => {
    indicator.finish()
    if (overlayTimer) { clearTimeout(overlayTimer); overlayTimer = null }
    setTimeout(() => (loading.value = false), 100)
  }

  router.beforeEach((_to, _from, next) => {
    indicator.start()
    overlayTimer = setTimeout(() => { loading.value = true }, 180)
    next()
  })

  router.afterEach(() => {
    stop()
  })

  router.onError(() => {
    stop()
  })

  nuxtApp.hook('app:error', () => {
    stop()
  })
})


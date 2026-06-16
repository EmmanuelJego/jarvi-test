import { createClient, type NhostClient } from '@nhost/nhost-js'
import { DEMO_CREDENTIALS } from '~/utils/constants'

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()

  const nhost: NhostClient = createClient({
    subdomain: config.public.nhostSubdomain as string,
    region: config.public.nhostRegion as string
  })

  // Sign in if needed
  if (!nhost.getUserSession()) {
    try {
      await nhost.auth.signInEmailPassword({
        email: DEMO_CREDENTIALS.email,
        password: DEMO_CREDENTIALS.password
      })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error('[nhost] Error during nhost authentication:', message)
    }
  }

  return {
    provide: {
      nhost
    }
  }
})

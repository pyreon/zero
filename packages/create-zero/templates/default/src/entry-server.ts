import { routes } from 'virtual:zero/routes'
import { createServer } from '@pyreon/zero'
import {
  cacheMiddleware,
  securityHeaders,
  varyEncoding,
} from '@pyreon/zero/cache'

export default createServer({
  routes,
  config: {
    ssr: { mode: 'stream' },
  },
  middleware: [
    securityHeaders(),
    cacheMiddleware({ staleWhileRevalidate: 120 }),
    varyEncoding(),
  ],
})

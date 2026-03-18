import './global.css'
import { routes } from 'virtual:zero/routes'
import { startClient } from '@pyreon/zero/client'
import { initDevtools } from '@pyreon/zero/devtools'

// Enable devtools in dev mode (controlled by zero({ devtools }) config)
if (__ZERO_DEVTOOLS__) {
  initDevtools()
}

startClient({ routes })

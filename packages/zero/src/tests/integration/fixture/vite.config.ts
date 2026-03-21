import pyreon from '@pyreon/vite-plugin'
import zero from '@pyreon/zero'

export default {
  plugins: [pyreon(), zero({ mode: 'ssr' })],
}

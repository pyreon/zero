import cac from 'cac'
import { build } from './commands/build'
import { dev } from './commands/dev'
import { preview } from './commands/preview'

const cli = cac('zero')

cli
  .command('[root]', 'Start dev server')
  .alias('dev')
  .option('--port <port>', 'Server port', { default: 3000 })
  .option('--host [host]', 'Server host')
  .option('--open', 'Open browser on start')
  .action(dev)

cli
  .command('build [root]', 'Build for production')
  .option('--mode <mode>', 'Rendering mode override')
  .action(build)

cli
  .command('preview [root]', 'Preview production build')
  .option('--port <port>', 'Server port', { default: 3000 })
  .option('--host [host]', 'Server host')
  .action(preview)

cli.help()
cli.version('0.0.1')
cli.parse()

import { startBot } from './bot'
import { startServer } from './server'

const setup = async () => {
  await startBot()
  await startServer()
}

setup()

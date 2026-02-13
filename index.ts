import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { fromTypes, openapi } from '@elysiajs/openapi'
import { logger as elysiaLogger } from '@bogeychan/elysia-logger'
import { CONFIG } from '@/config'
import { loggerConfig } from '@/core/logger'
import { onError } from '@/http/middlewares/error'
import { textRoutes } from '@/http/routes/text'
import { imageRoutes } from '@/http/routes/image'
import { audioRoutes } from '@/http/routes/auidio'

export const app = new Elysia()
  .use(cors({ origin: '*' }))
  .use(elysiaLogger(loggerConfig))
  .use(openapi({ references: fromTypes() }))
  .onError(onError)
  .use(textRoutes)
  .use(imageRoutes)
  .use(audioRoutes)
  .listen(CONFIG.PORT)

console.log(`🚀 API running on http://localhost:${CONFIG.PORT}`)

import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { fromTypes, openapi } from '@elysiajs/openapi'
import { logger as elysiaLogger } from '@bogeychan/elysia-logger'
import { env } from '@/env'
import { loggerConfig } from '@/core/logger'
import { onError } from '@/http/middlewares/error'
import { textRoutes } from '@/http/routes/text'
import { imageRoutes } from '@/http/routes/image'
import { audioRoutes } from '@/http/routes/audio'
import { transcriptionRoutes } from '@/http/routes/transcription'

const apiV1 = new Elysia({ prefix: '/api/v1' })
  .use(cors({ origin: '*' }))
  .use(elysiaLogger(loggerConfig))
  .use(openapi({ references: fromTypes() }))
  .use(textRoutes)
  .use(imageRoutes)
  .use(audioRoutes)
  .use(transcriptionRoutes)

export const app = new Elysia().onError(onError).use(apiV1).listen(env.PORT)

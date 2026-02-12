// @/http/index.ts
import { Elysia } from 'elysia'
import { CONFIG } from '@/config'
import { textRoutes } from '@/http/routes/text'
import { imageRoutes } from '@/http/routes/image'
import { fromTypes, openapi } from '@elysiajs/openapi'
import { logger as elysiaLogger } from '@bogeychan/elysia-logger'
import { loggerConfig } from '@/core/logger'
export const app = new Elysia()
import { cors } from '@elysiajs/cors'

app.use(cors({ origin: '*' }))

app.use(elysiaLogger(loggerConfig))

app.use(
  openapi({
    references: fromTypes(),
  })
)
app.use(textRoutes)
app.use(imageRoutes)

app.listen(CONFIG.PORT)

console.log(`🚀 API running on http://localhost:${CONFIG.PORT}`)

import { Elysia } from 'elysia'

import { textController } from '@/http/controllers/text'
import { createResponseSchema } from '@/http/openapi/open-api'
import { generatedTextSchema, inputTextSchema } from '@/schemas/text'

export const textRoutes = new Elysia({ prefix: '/text' })
  .post(
    '/generate',
    async ({ body }) => {
      return await textController.generateText(body)
    },
    {
      body: inputTextSchema,
      response: {
        200: createResponseSchema(generatedTextSchema),
      },
    },
  )
  .post(
    '/stream',
    ({ body, set }) => {
      set.headers['content-type'] = 'text/event-stream'
      set.headers['cache-control'] = 'no-cache'

      const { stream } = textController.streamGenerateText(body)
      return stream
    },
    {
      body: inputTextSchema,
      response: undefined, // Streaming response does not have a fixed schema
    },
  )

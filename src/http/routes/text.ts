import { Elysia } from 'elysia'
import { createResponseSchema } from '@/http/openapi/open-api'
import { textController } from '@/http/controllers/text'
import { inputTextSchema, generatedTextSchema } from '@/schemas/text'
import { streamEventSchema } from '@/schemas/stream'
export const textRoutes = new Elysia({ prefix: '/text' })
  .post(
    '/generate',
    async ({ body }) => {
      const result = await textController.generateText({
        prompt: body.prompt,
      })

      return {
        success: true,
        data: {
          text: result.text,
          length: result.text.length,
          modelMetadata: result.modelMetadata,
        },
        error: null,
      }
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

      const { stream } = textController.streamGenerateText({
        prompt: body.prompt,
      })
      return stream
    },
    {
      body: inputTextSchema,
      response: undefined, // Streaming response does not have a fixed schema
    },
  )

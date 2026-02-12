import { createResponseSchema } from '@/http/openapi/open-api'
import { createRoute, z } from '@hono/zod-openapi'
import { generatedTextSchema } from '@/schemas/text'
export const generateTextRoute = createRoute({
  method: 'post',
  path: '/generate',
  summary: 'Generate text from a prompt',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            prompt: z.string().min(1, 'Prompt is required'),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: createResponseSchema(generatedTextSchema),
        },
      },
      description: 'Generated text response',
    },
  },
})

export const generateTextStreamRoute = createRoute({
  method: 'post',
  path: '/generate/stream',
  summary: 'Generate text from a prompt with streaming',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            prompt: z.string().min(1, 'Prompt is required'),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'text/plain': {
          schema: z.any(), // ← Esto permite streaming
        },
      },
      description: 'Stream of text chunks in plain text format',
    },
  },
})

import { createResponseSchema } from '@/http/openapi/open-api'
import { createRoute, z } from '@hono/zod-openapi'
import { generatedImageSchema } from '@/schemas/generated-image'

export const generateImageRoute = createRoute({
  method: 'post',
  path: '/generate',
  summary: 'Generate an image from a prompt',
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
          schema: createResponseSchema(generatedImageSchema),
        },
      },
      description: 'Get user by id',
    },
  },
})

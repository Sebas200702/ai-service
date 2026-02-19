import { Elysia } from 'elysia'
import { imageController } from '@/http/controllers/image'
import { createResponseSchema } from '@/http/openapi/open-api'
import { generatedImageSchema } from '@/schemas/image'
import { z } from 'zod'

const inputImageSchema = z.object({
  prompt: z.string(),
})

export const imageRoutes = new Elysia({ prefix: '/image' }).post(
  '/generate',
  async ({ body }) => {
    return await imageController.generateImage({ prompt: body.prompt })
  },
  {
    body: inputImageSchema,
    response: {
      200: createResponseSchema(generatedImageSchema),
    },
  }
)

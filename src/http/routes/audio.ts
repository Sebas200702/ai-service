import { audioController } from '@/http/controllers/audio'
import { Elysia } from 'elysia'
import { createResponseSchema } from '@/http/openapi/open-api'
import { generatedAudioSchema } from '@/schemas/generated-audio'
import { z } from 'zod'

const inputAudioSchema = z.object({
  prompt: z.string(),
})

export const audioRoutes = new Elysia({ prefix: '/audio' }).post(
  '/generate',
  async ({ body }) => {
    return await audioController.generateAudio({ prompt: body.prompt })
  },
  {
    body: inputAudioSchema,
    response: {
      200: createResponseSchema(generatedAudioSchema),
    },
  }
)

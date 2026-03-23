import { Elysia } from 'elysia'

import { audioController } from '@/http/controllers/audio'
import { createResponseSchema } from '@/http/openapi/open-api'
import { generatedAudioSchema, inputAudioSchema } from '@/schemas/audio'

export const audioRoutes = new Elysia({ prefix: '/audio' }).post(
  '/generate',
  async ({ body }) => {
    return await audioController.generateAudio(body)
  },
  {
    body: inputAudioSchema,
    response: {
      200: createResponseSchema(generatedAudioSchema),
    },
  }
)

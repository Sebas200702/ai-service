import { Elysia } from 'elysia'

import { transcriptionController } from '@/http/controllers/transcription'
import { createResponseSchema } from '@/http/openapi/open-api'
import {
  generatedTranscriptionSchema,
  inputTranscriptionSchema,
} from '@/schemas/transcription'

export const transcriptionRoutes = new Elysia({
  prefix: '/transcription',
}).post(
  '/transcribe',
  async ({ body }) => {
    return await transcriptionController.transcribeAudio(body)
  },
  {
    body: inputTranscriptionSchema,
    response: {
      200: createResponseSchema(generatedTranscriptionSchema),
    },
  },
)

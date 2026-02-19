
import { Elysia } from 'elysia'
import { createResponseSchema } from '@/http/openapi/open-api'
import { generatedTranscriptionSchema } from '@/schemas/transcription'
import { z } from 'zod'
import { transcriptionController } from '@/http/controllers/transcription'

const inputTrnascriptionSchema = z.object({
  audioFile: z
    .instanceof(File, { message: 'audioFile must be a File object' })
    .or(z.url({ message: 'audioFile must be a URL string' })),
})

export const transcriptionRoutes = new Elysia({ prefix: '/transcription' }).post(
  '/transcribe',
  async ({ body }) => {
    return await transcriptionController.transcribeAudio({
      audioFile: body.audioFile,
    })
  },
  {
    body: inputTrnascriptionSchema,
    response: {
      200: createResponseSchema(generatedTranscriptionSchema),
    },
  }
)

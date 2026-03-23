import { z } from 'zod'

import { requestSchema } from '@/schemas/request'

export const generatedTranscriptionSchema = z.object({
  text: z.string(),
  durationSeconds: z.number().positive(),
})
export const inputTranscriptionSchema = requestSchema.extend({
  audioFile: z.union([z.url(), z.instanceof(File)]),
})

export type InputTranscription = z.infer<typeof inputTranscriptionSchema>
export type GeneratedTranscription = z.infer<
  typeof generatedTranscriptionSchema
>

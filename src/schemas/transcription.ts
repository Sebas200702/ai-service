import { z } from 'zod'

export const generatedTranscriptionSchema = z.object({
  text: z.string(),
  durationSeconds: z.number().positive(),
})

export type GeneratedTranscription = z.infer<
  typeof generatedTranscriptionSchema
>

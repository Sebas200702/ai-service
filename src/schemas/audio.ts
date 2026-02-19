import { z } from 'zod'
export const generatedAudioSchema = z.object({
  audioUrl: z.url(),
  durationSeconds: z.number().positive(),
  format: z.string(),
})
export type GeneratedAudio = z.infer<typeof generatedAudioSchema>

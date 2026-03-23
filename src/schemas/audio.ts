import { z } from 'zod'

import type { requestSchema } from '@/schemas/request'

export const generatedAudioSchema = z.object({
  audioUrl: z.url(),
  durationSeconds: z.number().positive(),
  format: z.string(),
})
export type InputAudio = z.infer<typeof requestSchema>
export type GeneratedAudio = z.infer<typeof generatedAudioSchema>
export { requestSchema as inputAudioSchema } from '@/schemas/request'

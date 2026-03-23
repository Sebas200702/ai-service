import { z } from 'zod'

import type { requestSchema } from '@/schemas/request'

export const generatedImageSchema = z.object({
  imageUrl: z.url(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  altText: z.string(),
})

export type InputImage = z.infer<typeof requestSchema>
export type GeneratedImage = z.infer<typeof generatedImageSchema>

export { requestSchema as inputImageSchema } from '@/schemas/request'

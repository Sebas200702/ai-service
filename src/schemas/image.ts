import { z } from 'zod'

export const generatedImageSchema = z.object({
  imageUrl: z.url(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  altText: z.string(),
})
export type GeneratedImage = z.infer<typeof generatedImageSchema>

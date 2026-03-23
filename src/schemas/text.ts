import type { ModelMetadata } from '@/types'
import { z } from 'zod'

import { requestSchema } from '@/schemas/request'

export const generatedTextSchema = z.object({
  text: z.string(),
  length: z.number().int().positive(),
  modelMetadata: z.custom<ModelMetadata>().optional(),
})

export type GeneratedText = z.infer<typeof generatedTextSchema>
export type InputText = z.infer<typeof requestSchema>

export { requestSchema as inputTextSchema } from '@/schemas/request'

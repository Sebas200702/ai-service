
import type { ModelMetadata } from '@/types'
import { z } from 'zod'
export const generatedTextSchema = z.object({
  text: z.string(),
  length: z.number().int().positive(),
  modelMetadata: z.custom<ModelMetadata>().optional(),
})

export const inputTextSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
})
export type GeneratedText = z.infer<typeof generatedTextSchema>
export type InputText = z.infer<typeof inputTextSchema>

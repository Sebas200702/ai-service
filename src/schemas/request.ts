import { z } from 'zod'

export const requestSchema = z
  .object({
    prompt: z.string().min(1, 'Prompt is required'),
    mode: z.enum(['manual', 'orchestrated']),
    modelId: z.string().optional(),
    strategy: z.enum(['lowCost', 'lowLatency']).optional(),
  })
  .strict()
export type Request = z.infer<typeof requestSchema>

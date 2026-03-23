import { z } from 'zod'

export const createResponseSchema = <T extends z.ZodType>(schema: T) =>
  z.object({
    success: z.boolean(),
    data: schema.nullable(),
    error: z
      .object({
        code: z.string(),
        message: z.string(),
      })
      .nullable()
      .optional(),
    modelMetadata: z
      .object({
        modelId: z.string(),
        provider: z.string(),
        type: z.string(),
        execution: z
          .object({
            mode: z.enum(['manual', 'orchestrated']),
            strategy: z.enum(['manual', 'lowCost', 'lowLatency']),
            attemptCount: z.number().int().positive().optional(),
            attemptedModelIds: z.array(z.string()).optional(),
            latencyMs: z.number(),
            inputTokens: z.number().nullable(),
            outputTokens: z.number().nullable(),
            totalTokens: z.number().nullable(),
            totalCostUsd: z.number(),
            isCostEstimated: z.boolean(),
            fallbackUsed: z.boolean(),
            reason: z.string().nullable(),
            timestamp: z.number(),
            durationSeconds: z.number().optional(),
          })
          .optional(),
      })
      .optional(),
  })

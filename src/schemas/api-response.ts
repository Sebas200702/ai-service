import { z } from 'zod'

const responseDetailSchema = z.object({
  field: z.string(),
  message: z.string(),
})

export const executionMetadataSchema = z.object({
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

export const modelMetadataSchema = z.object({
  modelId: z.string(),
  provider: z.string(),
  type: z.string(),
  execution: executionMetadataSchema.optional(),
})

export const apiErrorSchema = z
  .object({
    code: z.string(),
    message: z.string(),
    details: z.array(responseDetailSchema).optional(),
  })
  .nullable()
  .optional()

export const createApiResponseSchema = <T extends z.ZodType>(schema: T) =>
  z.object({
    success: z.boolean(),
    data: schema.nullable(),
    error: apiErrorSchema,
    modelMetadata: modelMetadataSchema.nullable(),
  })

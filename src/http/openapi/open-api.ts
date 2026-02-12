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
  })


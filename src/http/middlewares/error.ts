import type { StatusMap } from 'elysia'
import { ZodError } from 'zod'

import type { ApiResponse } from '@/types'

type HttpStatus = keyof StatusMap

interface ErrorContext {
  service: string
  operation: string
  reason: string
  status?: HttpStatus
  metadata?: Record<string, unknown>
  cause?: unknown
}

export class AppError extends Error {
  public readonly status: HttpStatus
  public readonly code: string
  public readonly service: string
  public readonly operation: string
  public readonly metadata?: Record<string, unknown>
  public readonly timestamp: string

  constructor(ctx: ErrorContext) {
    super(ctx.reason)
    this.status = ctx.status ?? 'Internal Server Error'
    this.code = `${ctx.service}.${ctx.operation}`.toUpperCase()
    this.service = ctx.service
    this.operation = ctx.operation
    this.metadata = ctx.metadata
    this.timestamp = new Date().toISOString()

    if (ctx.cause) this.cause = ctx.cause
    Object.setPrototypeOf(this, AppError.prototype)
  }

  toJSON() {
    return {
      code: this.code,
      service: this.service,
      operation: this.operation,
      message: this.message,
      status: this.status,
      metadata: this.metadata,
      timestamp: this.timestamp,
      stack: this.stack,
    }
  }

  static BadRequest(
    service: string,
    operation: string,
    reason: string,
    metadata?: Record<string, unknown>
  ) {
    return new AppError({
      service,
      operation,
      reason,
      status: 'Bad Request',
      metadata,
    })
  }

  static Unauthorized(
    service: string,
    operation: string,
    reason = 'Unauthorized',
    metadata?: Record<string, unknown>
  ) {
    return new AppError({
      service,
      operation,
      reason,
      status: 'Unauthorized',
      metadata,
    })
  }

  static Forbidden(
    service: string,
    operation: string,
    reason = 'Forbidden',
    metadata?: Record<string, unknown>
  ) {
    return new AppError({
      service,
      operation,
      reason,
      status: 'Forbidden',
      metadata,
    })
  }

  static NotFound(
    service: string,
    operation: string,
    reason = 'Resource not found',
    metadata?: Record<string, unknown>
  ) {
    return new AppError({
      service,
      operation,
      reason,
      status: 'Not Found',
      metadata,
    })
  }

  static Conflict(
    service: string,
    operation: string,
    reason: string,
    metadata?: Record<string, unknown>
  ) {
    return new AppError({
      service,
      operation,
      reason,
      status: 'Conflict',
      metadata,
    })
  }

  static Internal(
    service: string,
    operation: string,
    reason = 'Internal server error',
    metadata?: Record<string, unknown>
  ) {
    return new AppError({
      service,
      operation,
      reason,
      status: 'Internal Server Error',
      metadata,
    })
  }
}

const errorResponse = (error: AppError): ApiResponse<null> => ({
  success: false,
  data: null,
  error: {
    code: error.code,
    message: error.message,
  },
  modelMetadata: null,
})

export const onError = ({
  code,
  error: err,
  set,
}: {
  code: string | number
  error: unknown
  set: { status?: number | HttpStatus }
}) => {
  if (code === 'VALIDATION') {
    set.status = 'Unprocessable Content'
    const parsed =
      typeof (err as Error).message === 'string'
        ? (() => {
            try {
              return JSON.parse((err as Error).message)
            } catch {
              return null
            }
          })()
        : null

    return {
      success: false,
      data: null,
      error: {
        code: 'VALIDATION.REQUEST',
        message: parsed?.message ?? 'Validation failed',
        details: parsed?.errors?.map(
          (e: { path?: string[]; message: string }) => ({
            field: ((e.path ?? []).join('.') || parsed?.property) ?? 'unknown',
            message: e.message,
          })
        ),
      },
      modelMetadata: null,
    } satisfies ApiResponse<null>
  }

  if (code === 'PARSE') {
    set.status = 'Bad Request'
    return {
      success: false,
      data: null,
      error: { code: 'REQUEST.MALFORMED_BODY', message: 'Malformed body' },
      modelMetadata: null,
    } satisfies ApiResponse<null>
  }

  if (code === 'NOT_FOUND') {
    set.status = 'Not Found'
    return {
      success: false,
      data: null,
      error: { code: 'REQUEST.NOT_FOUND', message: 'Route not found' },
      modelMetadata: null,
    } satisfies ApiResponse<null>
  }

  if (err instanceof AppError) {
    set.status = err.status
    return errorResponse(err)
  }

  if (err instanceof ZodError) {
    set.status = 'Unprocessable Content'
    return {
      success: false,
      data: null,
      error: {
        code: 'VALIDATION.SCHEMA',
        message: 'Validation failed',
        details: err.issues.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
      modelMetadata: null,
    } satisfies ApiResponse<null>
  }

  const message = err instanceof Error ? err.message : ''
  if (message.includes('ENOTFOUND') || message.includes('getaddrinfo')) {
    set.status = 'Service Unavailable'
    return {
      success: false,
      data: null,
      error: {
        code: 'INFRA.CONNECTION_FAILED',
        message: 'Database connection failed',
      },
      modelMetadata: null,
    } satisfies ApiResponse<null>
  }

  set.status = 'Internal Server Error'
  return {
    success: false,
    data: null,
    error: {
      code: 'UNKNOWN.UNHANDLED',
      message: 'An unexpected error occurred',
    },
    modelMetadata: null,
  } satisfies ApiResponse<null>
}

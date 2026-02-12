import { ZodError } from 'zod'

import type { ApiResponse } from '@/types'

export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly isOperational: boolean

  constructor(
    message: string,
    statusCode = 500,
    code = 'INTERNAL_SERVER_ERROR'
  ) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = true

    Object.setPrototypeOf(this, AppError.prototype)
  }

  static BadRequest(message: string, code = 'BAD_REQUEST') {
    return new AppError(message, 400, code)
  }

  static Unauthorized(message = 'Unauthorized', code = 'UNAUTHORIZED') {
    return new AppError(message, 401, code)
  }

  static Forbidden(message = 'Forbidden', code = 'FORBIDDEN') {
    return new AppError(message, 403, code)
  }

  static NotFound(message = 'Resource not found', code = 'NOT_FOUND') {
    return new AppError(message, 404, code)
  }

  static Conflict(message: string, code = 'CONFLICT') {
    return new AppError(message, 409, code)
  }

  static Internal(
    message = 'Internal Server Error',
    code = 'INTERNAL_SERVER_ERROR'
  ) {
    return new AppError(message, 500, code)
  }
}

export const onError = ({
  error: err,
  set,
}: {
  error: Error
  set: { status: number }
}) => {
  let statusCode = 500
  const response: ApiResponse<null> = {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
    data: null,
  }

  if (err instanceof AppError) {
    statusCode = err.statusCode
    response.error = {
      code: err.code,
      message: err.message,
    }
  } else if (err instanceof ZodError) {
    statusCode = 422
    response.error = {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: err.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    }
  } else if (err instanceof SyntaxError) {
    statusCode = 400
    response.error = {
      code: 'BAD_REQUEST',
      message: 'Malformed body',
    }
  } else if (
    (err as { message?: string }).message?.includes('ENOTFOUND') ||
    (err as { message?: string }).message?.includes('getaddrinfo')
  ) {
    statusCode = 503
    response.error = {
      code: 'SERVICE_UNAVAILABLE',
      message: 'Database connection failed',
    }
  }

  if (statusCode === 500) {
    console.error({ err }, '❌ Unhandled Error')
  }

  set.status = statusCode
  return response
}

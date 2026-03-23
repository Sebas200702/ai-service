import type { ApiResponse } from '@/types'
import { Elysia } from 'elysia'

export const requireJson = new Elysia({ name: 'require-json' }).onBeforeHandle(
  ({ request, set }) => {
    const method = request.method

    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const contentType = request.headers.get('content-type')

      if (!contentType?.includes('application/json')) {
        set.status = 415
        const response: ApiResponse<null> = {
          success: false,
          modelMetadata: null,
          data: null,
          error: {
            code: 'REQUEST.UNSUPPORTED_MEDIA_TYPE',
            message: 'Content-Type must be application/json',
          },
        }

        return response
      }
    }
  },
)

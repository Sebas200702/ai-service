import { Elysia } from 'elysia'

export const requireJson = new Elysia({ name: 'require-json' }).onBeforeHandle(
  ({ request, set }) => {
    const method = request.method

    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const contentType = request.headers.get('content-type')

      if (!contentType?.includes('application/json')) {
        set.status = 415
        return {
          success: false,
          error: 'Content-Type must be application/json',
          data: null,
        }
      }
    }
  }
)

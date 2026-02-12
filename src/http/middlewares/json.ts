import type { MiddlewareHandler } from 'hono'

export const requireJson: MiddlewareHandler = async (c, next) => {
  const method = c.req.method

  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    const contentType = c.req.header('content-type')

    if (!contentType?.includes('application/json')) {
      return c.json(
        {
          success: false,
          error: 'Content-Type must be application/json',
          data: null,
        },
        415,
      )
    }
  }

  await next()
}


import type { MiddlewareHandler } from 'hono'
import { AppError } from '@/http/middlewares/error'

export const normalizePath: MiddlewareHandler = async (c, next) => {
  try {
    const url = new URL(c.req.url)

    if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.slice(0, -1)
      return c.redirect(url.toString(), 308)
    }
  } catch (err) {
    console.error('Error normalizing path:', err)
    throw AppError.BadRequest('Invalid URL')
  }

  await next()
}

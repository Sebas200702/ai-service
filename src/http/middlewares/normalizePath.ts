import { Elysia, redirect } from 'elysia'
import { AppError } from '@/http/middlewares/error'

export const normalizePath = new Elysia({
  name: 'normalize-path',
}).onBeforeHandle(({ request, set }) => {
  try {
    const url = new URL(request.url)

    if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.slice(0, -1)
      set.status = 308
      return redirect(url.toString(), 308)
    }
  } catch (err) {
    console.error('Error normalizing path:', err)
    throw AppError.BadRequest('Invalid URL')
  }
})

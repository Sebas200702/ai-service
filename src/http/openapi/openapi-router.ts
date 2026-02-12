import { OpenAPIHono } from '@hono/zod-openapi'

export const createOpenApiRouter = () =>
  new OpenAPIHono({
    defaultHook: (result) => {
      if (!result.success) {
        // Rethrow the original ZodError so the global onError handler
        // can format and include `issues` details in the response.
        throw result.error
      }
    },
  })


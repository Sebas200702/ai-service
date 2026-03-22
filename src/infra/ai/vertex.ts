import { env } from '@/env'
import { createVertex } from '@ai-sdk/google-vertex'
export const vertex = createVertex({
  apiKey: env.VERTEX_API_KEY,
})

export const vertexModel = vertex('gemini-3-flash-preview')

export const vertexImageModel = vertex('gemini-3-pro-image-preview')

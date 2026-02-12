import { CONFIG } from '@/config'
import { createVertex } from '@ai-sdk/google-vertex'
export const vertex = createVertex({
  apiKey: CONFIG.VERTEX_API_KEY,
})

export const vertexModel = vertex('gemini-3-flash-preview')

export const vertexImageModel = vertex('gemini-3-pro-image-preview')


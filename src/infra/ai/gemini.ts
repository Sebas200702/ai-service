import { env } from '@/env'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

const google = createGoogleGenerativeAI({
  apiKey: env.GEMINI_API_KEY,
})

export const geminiModel = google('gemini-3-flash-preview')
export const geminiImageModel = google('gemini-3-pro-image-preview')

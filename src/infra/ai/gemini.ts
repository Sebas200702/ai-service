import { CONFIG } from '@/config'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

const google = createGoogleGenerativeAI({
  apiKey: CONFIG.GEMINI_API_KEY,
})

export const geminiModel = google('gemini-3-flash-preview')
export const geminiImageModel = google('gemini-3-pro-image-preview')


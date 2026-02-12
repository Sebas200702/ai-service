import { CONFIG } from '@/config'
import { createGroq } from '@ai-sdk/groq'

export const groq = createGroq({
  apiKey: CONFIG.GROQ_API_KEY,
})

export const groqModel = groq('qwen/qwen3-32b')
export const groqTranscriptionModel = groq.transcription('whisper-large-v3')


import { env } from '@/env'
import { createAssemblyAI } from '@ai-sdk/assemblyai'

export const assemblyai = createAssemblyAI({
  apiKey: env.ASSEMBLYAI_API_KEY,
})

export const assemblyaiTranscriptionModel = assemblyai.transcription('best')

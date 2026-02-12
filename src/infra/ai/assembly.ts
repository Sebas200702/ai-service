import { CONFIG } from '@/config'
import { createAssemblyAI } from '@ai-sdk/assemblyai'

export const assemblyai = createAssemblyAI({
  apiKey: CONFIG.ASSEMBLYAI_API_KEY,
})

export const assemblyaiTranscriptionModel = assemblyai.transcription('best')


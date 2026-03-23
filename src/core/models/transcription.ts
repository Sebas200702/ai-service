import { assemblyaiTranscriptionModel } from '@/infra/ai/assembly'
import { elevenlabsTranscriptionModel } from '@/infra/ai/eleven'
import { groqTranscriptionModel } from '@/infra/ai/groq'
import { transcriptionModelPricing } from '@/core/models/pricing'
import type { AIModelDescriptor } from '@/types'
import type { TranscriptionModel } from 'ai'

const baseTranscriptionModels: AIModelDescriptor<TranscriptionModel>[] = [
  {
    id: 'groq-whisper-large-v3',
    provider: 'groq',
    type: 'transcription',
    model: groqTranscriptionModel,
  },
  {
    id: 'assemblyai-standard',
    provider: 'assemblyai',
    type: 'transcription',
    model: assemblyaiTranscriptionModel,
  },
  {
    id: 'elevenlabs-standard-transcription',
    provider: 'elevenlabs',
    type: 'transcription',
    model: elevenlabsTranscriptionModel,
  },
]

export const transcriptionModels = baseTranscriptionModels.map((model) => ({
  ...model,
  pricing: transcriptionModelPricing[model.id] ?? undefined,
}))

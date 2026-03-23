import { audioModelPricing } from '@/core/models/pricing'
import { elevenlabsVoiceModel } from '@/infra/ai/eleven'
import type { AIModelDescriptor } from '@/types'
import type { SpeechModel } from 'ai'

const baseVoiceModels: AIModelDescriptor<SpeechModel>[] = [
  {
    id: 'elevenlabs-standard-voice',
    provider: 'elevenlabs',
    type: 'voice',
    model: elevenlabsVoiceModel,
  },
]

export const voiceModels = baseVoiceModels.map((model) => ({
  ...model,
  pricing: audioModelPricing[model.id] ?? undefined,
}))

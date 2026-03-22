import { env } from '@/env'
import { createElevenLabs } from '@ai-sdk/elevenlabs'

export const elevenlabs = createElevenLabs({
  apiKey: env.ELEVENLABS_API_KEY,
})
export const elevenlabsTranscriptionModel =
  elevenlabs.transcription('scribe_v1')
export const elevenlabsVoiceModel = elevenlabs.speech('eleven_v3')

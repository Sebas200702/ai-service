import { audioService } from '@/services/audio'
import type { GeneratedAudio } from '@/schemas/generated-audio'
import type { ApiResponse } from '@/types'

const generateAudio = async ({
  prompt,
  voiceId,
}: {
  prompt: string
  voiceId?: string
}) => {
  const { audio, modelMetadata } = await audioService.generate({
    prompt,
    voiceId,
  })
  const response: ApiResponse<GeneratedAudio> = {
    success: true,
    data: audio,
    error: null,
    modelMetadata: modelMetadata,
  }
  return response
}

export const audioController = {
  generateAudio,
}

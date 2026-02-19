import { audioService } from '@/services/audio'
import type { GeneratedAudio } from '@/schemas/audio'
import type { ApiResponse } from '@/types'

const generateAudio = async ({
  prompt,
  voiceId,
}: {
  prompt: string
  voiceId?: string
}) => {
  const { data, modelMetadata } = await audioService.generate({
    prompt,
    voiceId,
  })
  const response: ApiResponse<GeneratedAudio> = {
    success: true,
    data,
    error: null,
    modelMetadata: modelMetadata,
  }
  return response
}

export const audioController = {
  generateAudio,
}

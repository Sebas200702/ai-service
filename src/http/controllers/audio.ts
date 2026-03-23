import { audioService } from '@/services/audio'

import type { GeneratedAudio, InputAudio } from '@/schemas/audio'
import type { ApiResponse } from '@/types'

const generateAudio = async (input: InputAudio) => {
  const { data, modelMetadata } = await audioService.generate(input)
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

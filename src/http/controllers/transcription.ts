import type {
  GeneratedTranscription,
  InputTranscription,
} from '@/schemas/transcription'
import { transcriptionService } from '@/services/transcription'
import type { ApiResponse } from '@/types'

const transcribeAudio = async (input: InputTranscription) => {
  const { data, modelMetadata } = await transcriptionService.transcribe(input)
  const response: ApiResponse<GeneratedTranscription> = {
    success: true,
    data: data,
    error: null,
    modelMetadata: modelMetadata,
  }
  return response
}

export const transcriptionController = {
  transcribeAudio,
}

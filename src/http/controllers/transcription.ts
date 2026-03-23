import type { ApiResponse } from '@/types'
import type {
  GeneratedTranscription,
  InputTranscription,
} from '@/schemas/transcription'
import { transcriptionService } from '@/services/transcription'

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

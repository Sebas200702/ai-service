import type { ApiResponse } from '@/types'
import type { GeneratedTranscription } from '@/schemas/transcription'
import { transcriptionService } from '@/services/transcription'

const transcribeAudio = async ({ audioFile }: { audioFile: File | string }) => {
  const { data, modelMetadata } =
    await transcriptionService.transcribe(audioFile)
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

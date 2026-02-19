import type { StreamEvent } from '@/core/streaming/events'
import type { GeneratedText } from '@/schemas/text'
import type { GeneratedAudio } from '@/schemas/audio'
import type { GeneratedImage } from '@/schemas/image'
import type { GeneratedTranscription } from '@/schemas/transcription'

type AIModalities = 'text' | 'image' | 'voice' | 'transcription'
export interface AIModelDescriptor<T> {
  id: string
  provider: string
  type: AIModalities
  model: T
}

export interface ApiResponse<T> {
  success: boolean
  data: T | null
  error: ErrorData | null
  modelMetadata?: ModelMetadata
}

export interface ModelMetadata {
  modelId: string
  provider: string
  type: AIModalities
}

interface ErrorData {
  code: string
  message: string
  details?: {
    field: string
    message: string
  }[]
}

export enum LogLevel {
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
}

export interface StandardResult<T> {
  data: T
  modelMetadata: ModelMetadata
}

export type StandardTextResult = StandardResult<GeneratedText>
export type StandardImageResult = StandardResult<GeneratedImage>
export type StandardAudioResult = StandardResult<GeneratedAudio>
export type StandardTranscriptionResult = StandardResult<GeneratedTranscription>
export type TextStream = AsyncGenerator<StreamEvent>

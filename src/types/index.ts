import type { StreamEvent } from '@/core/streaming/events'
import type { GeneratedText } from '@/schemas/text'


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

export interface StandardTextResult {
  data: GeneratedText
  modelMetadata: ModelMetadata
}

export type TextStream = AsyncGenerator<StreamEvent>

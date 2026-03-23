import { parseBuffer } from 'music-metadata'

import { AppError } from '@/http/middlewares/error'

export const getAudioDuration = async (buffer: Buffer): Promise<number> => {
  const metadata = await parseBuffer(buffer)

  if (!metadata.format.duration) {
    throw new Error('Unable to read audio duration')
  }

  return metadata.format.duration
}

export const getAudioMetadata = async (buffer: Buffer) => {
  const metadata = await parseBuffer(buffer)

  if (!metadata.format.duration) {
    throw new Error('Unable to read audio metadata')
  }

  return {
    durationSeconds: metadata.format.duration,
    format: metadata.format.container ?? 'unknown',
    sampleRate: metadata.format.sampleRate,
    channels: metadata.format.numberOfChannels,
    bitrate: metadata.format.bitrate,
  }
}

const containerToExtension: Record<string, string> = {
  MPEG: 'mp3',
  'MPEG-4/AAC': 'mp4',
  'MPEG-4/ALAC': 'm4a',
  Ogg: 'ogg',
  FLAC: 'flac',
  WAVE: 'wav',
  WebM: 'webm',
  Matroska: 'mkv',
}

export const processAudio = async (
  buffer: Buffer
): Promise<{
  buffer: Buffer
  durationSeconds: number
  format: string
  fileName: string
}> => {
  const { durationSeconds, format } = await getAudioMetadata(buffer)
  const extension = containerToExtension[format] ?? format.toLowerCase()
  const fileName = `generated-audio-${Date.now()}.${extension}`

  return {
    buffer,
    durationSeconds,
    format,
    fileName,
  }
}

export const fetchAudioBuffer = async (url: string): Promise<Buffer> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new AppError({
      service: 'audio',
      operation: 'fetch',
      reason: `Failed to fetch audio from URL: ${response.statusText}`,
    })
  }
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

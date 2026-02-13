import {
  experimental_generateSpeech as generateSpeech,
  type GeneratedAudioFile,
} from 'ai'
import type { AITaskResult, ExecuteTextTaskInput } from '@/core/execution/types'

export const executeAudioTask = async ({
  model,
  messages,
}: ExecuteTextTaskInput): Promise<AITaskResult<GeneratedAudioFile>> => {
  const { audio } = await generateSpeech({
    model: model.model,
    text: messages.map((msg) => msg.content).join('\n'),
    voice: '21m00Tcm4TlvDq8ikWAM', 
    outputFormat: 'mp3',
  })
  return { result: audio, provider: model.provider, modelId: model.id }
}

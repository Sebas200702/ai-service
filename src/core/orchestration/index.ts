import { assemblyaiTranscriptionModel } from '@/infra/ai/assembly'
import {
  elevenlabsTranscriptionModel,
  elevenlabsVoiceModel,
} from '@/infra/ai/eleven'
import { geminiImageModel, geminiModel } from '@/infra/ai/gemini'
import { groqModel, groqTranscriptionModel } from '@/infra/ai/groq'
import { perplexityModel } from '@/infra/ai/perplexity'
import { vertexImageModel, vertexModel } from '@/infra/ai/vertex'
import {
  openRouterTextModel,
  openRouterTextModelV2,
  openRouterTextModelV3,
  openRouterTextModelV4,
} from '@/infra/ai/open-router'
import { cerebrasTextModel } from '@/infra/ai/cerebras'
import {
  githubTextModel,
  githubTextModelV2,
  githubTextModelV3,
} from '@/infra/ai/github'
import { nvidiaTextModel } from '@/infra/ai/nvidia'
import { nscaleImageModel } from '@/infra/ai/nscale'
import type { AIModelDescriptor } from '@/types'
import type {
  ImageModel,
  LanguageModel,
  SpeechModel,
  TranscriptionModel,
} from 'ai'
import { ollmTextModel } from '@/infra/ai/olm'
import { ministralTextModel } from '@/infra/ai/ministral'
import { cohereTextModel } from '@/infra/ai/cohere'

export const textModels: AIModelDescriptor<LanguageModel>[] = [
  {
    id: 'cohere-command-a-reasoning-08-2025',
    provider: 'cohere',
    type: 'text',
    model: cohereTextModel,
  },
  {
    id: 'github-gpt-4o',
    provider: 'github',
    type: 'text',
    model: githubTextModel,
  },
  {
    id: 'ministral-3.0',
    provider: 'ministral',
    type: 'text',
    model: ministralTextModel,
  },
  {
    id: 'github-llama-3.1-405b',
    provider: 'github',
    type: 'text',
    model: githubTextModelV2,
  },
  {
    id: 'github-mistral-large',
    provider: 'github',
    type: 'text',
    model: githubTextModelV3,
  },
  {
    id: 'arcee-ai/trinity-large-preview:free',
    provider: 'openrouter',
    type: 'text',
    model: openRouterTextModel,
  },
  {
    id: 'tngtech/deepseek-r1t2-chimera:free',
    provider: 'openrouter',
    type: 'text',
    model: openRouterTextModelV2,
  },
  {
    id: 'qwen/qwen3-next-80b-a3b-instruct:free',
    provider: 'openrouter',
    type: 'text',
    model: openRouterTextModelV3,
  },
  {
    id: 'nvidia-nemotron-70b',
    provider: 'nvidia',
    type: 'text',
    model: nvidiaTextModel,
  },
  {
    id: 'gpt-oss-120b',
    provider: 'cerebras',
    type: 'text',
    model: cerebrasTextModel,
  },
  {
    id: 'z-ai/glm-4.5-air:free',
    provider: 'openrouter',
    type: 'text',
    model: openRouterTextModelV4,
  },
  {
    id: 'perplexity-sonar-pro',
    provider: 'perplexity',
    type: 'text',
    model: perplexityModel,
  },
  {
    id: 'groq-qwen-32b',
    provider: 'groq',
    type: 'text',
    model: groqModel,
  },
  {
    id: 'phala-kimi-k2.5',
    provider: 'ollm',
    type: 'text',
    model: ollmTextModel,
  },

  {
    id: 'gemini-3-flash',
    provider: 'gemini',
    type: 'text',
    model: geminiModel,
  },
  {
    id: 'vertex-gemini-3.0',
    provider: 'vertex',
    type: 'text',
    model: vertexModel,
  },
]

export const imageModels: (
  | AIModelDescriptor<LanguageModel>
  | AIModelDescriptor<ImageModel>
  | AIModelDescriptor<string>
)[] = [
  {
    id: 'nscale-sdxl-lightning',
    provider: 'nscale',
    type: 'image',
    model: nscaleImageModel,
  },
  {
    id: 'qwen-image-2512',
    provider: 'apifree',
    type: 'image',
    model: 'apifree-qwen-image',
  },
  {
    id: 'gemini-3.0-image',
    provider: 'gemini',
    type: 'image',
    model: geminiImageModel,
  },
  {
    id: 'vertex-gemini-3.0-image',
    provider: 'vertex',
    type: 'image',
    model: vertexImageModel,
  },
]
export const transcriptionModels: AIModelDescriptor<TranscriptionModel>[] = [
  {
    id: 'groq-whisper-large-v3',
    provider: 'groq',
    type: 'transcription',
    model: groqTranscriptionModel,
  },
  {
    id: 'assemblyai-standard',
    provider: 'assemblyai',
    type: 'transcription',
    model: assemblyaiTranscriptionModel,
  },
  {
    id: 'elevenlabs-standard-transcription',
    provider: 'elevenlabs',
    type: 'transcription',
    model: elevenlabsTranscriptionModel,
  },
]
export const voiceModels: AIModelDescriptor<SpeechModel>[] = [
  {
    id: 'elevenlabs-standard-voice',
    provider: 'elevenlabs',
    type: 'voice',
    model: elevenlabsVoiceModel,
  },
]

function createRoundRobin<T>(models: T[]) {
  let index = 0
  return () => {
    if (!models.length) {
      throw new Error('No models available')
    }
    const model = models[index]
    index = (index + 1) % models.length
    return model
  }
}

export const getNextTextModel = createRoundRobin(textModels)
export const getNextImageModel = createRoundRobin(imageModels)
export const getNextTranscriptionModel = createRoundRobin(transcriptionModels)
export const getNextAudioModel = createRoundRobin(voiceModels)

import type { ModelPricingUsd } from '@/types'

export const textModelPricing: Record<string, ModelPricingUsd | null> = {
  'cohere-command-a-reasoning-08-2025': { input: 2.5, output: 10 },
  'github-gpt-4o': { input: 2.5, output: 10 },
  'ministral-3.0': { input: 0.4, output: 2 },
  'github-llama-3.1-405b': { input: 3.5, output: 3.5 },
  'github-openai-gpt-5': { input: 5, output: 15 },
  'arcee-ai/trinity-large-preview:free': { input: 0.05, output: 0.2 },
  'qwen/qwen3-next-80b-a3b-instruct:free': { input: 0.06, output: 0.2 },
  'nvidia-nemotron-70b': { input: 0.3, output: 0.3 },
  'qwen-3-235b-a22b-instruct-2507': { input: 0.6, output: 1.2 },
  'z-ai/glm-4.5-air:free': { input: 0.1, output: 0.3 },
  'perplexity-sonar-pro': { input: 3, output: 15 },
  'groq-qwen-32b': { input: 0.27, output: 0.27 },
  'phala-kimi-k2.5': { input: 0.5, output: 0.5 },
  'gemini-3-flash': { input: 0.35, output: 0.53 },
  'vertex-gemini-3.0': { input: 0.35, output: 0.53 },
}

export const imageModelPricing: Record<string, ModelPricingUsd | null> = {
  'nscale-sdxl-lightning': { input: 0, output: 0, perImage: 0.003 },
  'qwen-image-2512': { input: 0, output: 0, perImage: 0.01 },
  'gemini-3.0-image': { input: 0, output: 0, perImage: 0.04 },
  'vertex-gemini-3.0-image': { input: 0, output: 0, perImage: 0.04 },
}

export const audioModelPricing: Record<string, ModelPricingUsd | null> = {
  'elevenlabs-standard-voice': { input: 0, output: 0, perSecond: 0.003 },
}

export const transcriptionModelPricing: Record<string, ModelPricingUsd | null> =
  {
    'groq-whisper-large-v3': { input: 0, output: 0, perSecond: 0.0001 },
    'assemblyai-standard': { input: 0, output: 0, perSecond: 0.00037 },
    'elevenlabs-standard-transcription': {
      input: 0,
      output: 0,
      perSecond: 0.0004,
    },
  }

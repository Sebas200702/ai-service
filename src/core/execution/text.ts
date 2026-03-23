import { getFamilyFallbackCandidates } from '@/core/execution/fallback'
import type { AITaskResult, ExecuteTextTaskInput } from '@/core/execution/types'
import { generateText, streamText } from 'ai'

export const executeTextTask = async ({
  model,
  fallbackModels,
  messages,
}: ExecuteTextTaskInput): Promise<AITaskResult<string>> => {
  const candidates = getFamilyFallbackCandidates(model, fallbackModels)
  let lastError: unknown
  const attemptedModelIds: string[] = []

  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index]
    attemptedModelIds.push(candidate.id)

    try {
      const { text, usage } = await generateText({
        model: candidate.model,
        messages: messages ?? [],
      })

      return {
        result: text,
        provider: candidate.provider,
        modelId: candidate.id,
        pricing: candidate.pricing,
        fallbackUsed: index > 0 || attemptedModelIds.length > 1,
        fallbackReason:
          index > 0 && lastError instanceof Error ? lastError.message : null,
        attemptCount: index + 1,
        attemptedModelIds,
        usage: {
          promptTokens: usage.inputTokens ?? null,
          completionTokens: usage.outputTokens ?? null,
          totalTokens: usage.totalTokens ?? null,
        },
      }
    } catch (error) {
      lastError = error
      if (index === candidates.length - 1) {
        throw error
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('AI task failed')
}

export const executeStreamText = ({
  model,
  fallbackModels,
  messages,
}: ExecuteTextTaskInput) => {
  const candidates = getFamilyFallbackCandidates(model, fallbackModels)

  const createStream = () => {
    let lastError: unknown

    for (let index = 0; index < candidates.length; index += 1) {
      try {
        const { textStream } = streamText({
          model: candidates[index].model,
          messages: messages ?? [],
        })

        return textStream
      } catch (error) {
        lastError = error
        if (index === candidates.length - 1) {
          throw error
        }
      }
    }

    throw lastError instanceof Error ? lastError : new Error('AI task failed')
  }

  return createStream()
}

// services/text/index.ts
import { executeTextTask, executeStreamText } from '@/core/execution/text'
import { getNextTextModel } from '@/core/orchestration'
import type { StandardTextResult, TextStream } from '@/types'


export const textService = {
  async generate(prompt: string): Promise<StandardTextResult> {
    const model = getNextTextModel()
    if (!model) {
      throw new Error('No text models available')
    }

    const { result } = await executeTextTask({
      model,
      messages: [{ role: 'user', content: prompt }],
    })

    return {
      data: {
        text: result,
        length: result.length,
      },
      modelMetadata: {
        provider: model.provider,
        modelId: model.id,
        type: 'text',
      },
    }
  },

  async *stream(prompt: string): TextStream {
    const model = getNextTextModel()
    if (!model) {
      throw new Error('No text models available')
    }

    const modelMetadata = {
      provider: model.provider,
      modelId: model.id,
      type: 'text' as const,
    }

    yield { type: 'start', modelMetadata }

    const result = executeStreamText({
      model: model.model,
      messages: [{ role: 'user', content: prompt }],
    })

    for await (const chunk of result) {
      yield { type: 'delta', content: chunk }
    }

    yield { type: 'end' }
  },
}

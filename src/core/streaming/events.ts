export type StreamEvent =
  | {
      type: 'start'
      modelMetadata: {
        provider: string
        modelId: string
        type: 'text'
      }
    }
  | {
      type: 'delta'
      content: string
    }
  | {
      type: 'meta'
      usage?: {
        inputTokens?: number
        outputTokens?: number
      }
      costUsd?: number
    }
  | {
      type: 'end'
    }

import type { StreamEvent } from '@/core/streaming/events'

export function createEventStream(
  generator: AsyncGenerator<StreamEvent>,
): ReadableStream<string> {
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const event of generator) {
          controller.enqueue(`${JSON.stringify(event)}\n`)
        }
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    },
  })
}

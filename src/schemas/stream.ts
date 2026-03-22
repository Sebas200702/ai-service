import type { TextStream } from '@/types'
import { z } from 'zod'

export const streamEventSchema = z.custom<TextStream>(
  (val) => {
    return (
      val != null &&
      typeof val === 'object' &&
      typeof (val as { next: () => void }).next === 'function' &&
      typeof (val as { [Symbol.asyncIterator]: () => void })[
        Symbol.asyncIterator
      ] === 'function'
    )
  },
  {
    message: 'Debe ser un AsyncGenerator válido',
  }
)

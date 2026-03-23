import { env } from '@/env'
import { createOLLM } from '@ofoundation/ollm'

const ollm = createOLLM({
  apiKey: env.OLLM_API_KEY,
})

export const ollmTextModel = ollm.chatModel('phala/kimi-k2.5')

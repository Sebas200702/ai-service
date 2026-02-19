import { createOLLM } from '@ofoundation/ollm'
import { CONFIG } from '@/config'

const ollm = createOLLM({
  apiKey: CONFIG.OLLM_API_KEY,
})

export const ollmTextModel = ollm.chatModel('phala/kimi-k2.5')

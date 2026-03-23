import { config } from 'dotenv'
config()

export const env = {
  PORT: Number(process.env.PORT) || 3000,
  ASSEMBLYAI_API_KEY: process.env.ASSEMBLYAI_API_KEY || '',
  PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY || '',
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY || '',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  VERTEX_API_KEY: process.env.VERTEX_API_KEY || '',
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_KEY: process.env.SUPABASE_KEY || '',
  NODE_ENV: process.env.NODE_ENV || 'development',
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  CEREBRAS_API_KEY: process.env.CEREBRAS_API_KEY || '',
  HF_API_KEY: process.env.HF_API_KEY || '',
  OLLM_API_KEY: process.env.OLLM_API_KEY || '',
  AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY || '',
  GITHUB_MODELS_API_KEY: process.env.GITHUB_MODELS_API_KEY || '',
  NVIDIA_API_KEY: process.env.NVIDIA_API_KEY || '',
  MINISTRAL_API_KEY: process.env.MINISTRAL_API_KEY || '',
  APIFREE_API_KEY: process.env.APIFREE_API_KEY || '',
  NSCALE_API_KEY: process.env.NSCALE_API_KEY || '',
  COHERE_API_KEY: process.env.COHERE_API_KEY || '',
}

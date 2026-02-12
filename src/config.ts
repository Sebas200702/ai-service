import { config } from 'dotenv'
config()

export const CONFIG = {
  PORT: Number(process.env.PORT) || 3000,
  ASSEMBLYAI_API_KEY: process.env.ASSEMBLYAI_API_KEY || '',
  PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY || '',
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY || '',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  VERTEX_API_KEY: process.env.VERTEX_API_KEY || '',
  S3_ENTRY_ENDPOINT: process.env.S3_ENTRY_ENDPOINT || '',
  S3_PROJECT_ID: process.env.S3_PROJECT_ID || '',
  S3_API_KEY: process.env.S3_API_KEY || '',
  S3_BUCKET_ID: process.env.S3_BUCKET_ID || '',
  NODE_ENV: process.env.NODE_ENV || 'development',
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  CEREBRAS_API_KEY: process.env.CEREBRAS_API_KEY || '',
}

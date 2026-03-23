# Nexus IA: The Multimodal Intelligence Backbone

Nexus IA is a high-performance AI orchestrator built for the next generation of multimodal applications. It serves as a unified gateway to the world's most powerful AI models, providing a seamless, type-safe, and ultra-fast interface for developers.

Built with [Bun](https://bun.sh) and [Elysia](https://elysiajs.com), Nexus IA is engineered for sub-millisecond overhead and maximum scalability. Aggregates **16+ AI providers** behind a single REST interface with support for **text generation**, **image generation**, **audio synthesis (TTS)**, and **audio transcription**.

## Table of Contents

- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [API Structure](#api-structure)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [AI Providers & Models](#ai-providers--models)
- [Installation & Local Development](#installation--local-development)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Adding a New Provider](#adding-a-new-provider)
- [License](#license)

## Key Features

- **Multimodal Orchestration** — Unified access to text, image, audio, and transcription models
- **Provider Agnostic** — Seamlessly switch between Gemini, Groq, OpenAI, Cohere, and 11+ more
- **Strategy-Based Selection** — Automatic model orchestration by cost, latency, or manual selection
- **High Performance** — Powered by Bun for 3x faster startup times than Node.js
- **Fallback Intelligence** — Automatic failover across providers with attempt tracking and detailed metadata
- **Developer First** — Auto-generated OpenAPI/Swagger documentation with strict TypeScript type safety
- **Metrics & Analytics** — Built-in latency tracking, token usage monitoring, and cost estimation

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | [Bun](https://bun.sh) v1.0+ |
| **Framework** | [Elysia](https://elysiajs.com) |
| **AI SDK** | [Vercel AI SDK v6](https://ai-sdk.dev) |
| **Validation** | [Zod v4](https://zod.dev) |
| **Database** | [Supabase](https://supabase.com) (metrics & stats) |
| **Formatting** | [Biome](https://biomejs.dev) |

## Architecture

```mermaid
graph TD
    Client([HTTP Client]) -->|POST| Routes

    subgraph HTTP Layer
        Routes --> Controllers
        Controllers --> Services
    end

    subgraph Core
        Services --> Metrics[Metrics Recorder]
        Metrics --> Execution[Execution Layer]
        Services --> Orchestration[Orchestration<br/>Round-Robin]
        Orchestration -->|next model| Execution
    end

    subgraph Execution Strategies
        Execution -->|generateText| LLM[Language Models]
        Execution -->|generateImage| IMG[Image Models]
        Execution -->|generateSpeech| TTS[Speech Models]
        Execution -->|transcribe| STT[Transcription Models]
    end

    subgraph Providers ["AI Providers (16+)"]
        LLM --> GitHub & OpenRouter & Groq & Gemini & Vertex & NVIDIA & Cerebras & Perplexity & Mistral & oLLM & Cohere
        IMG --> nscale & APIFree & GeminiImg[Gemini] & VertexImg[Vertex]
        TTS --> ElevenTTS[ElevenLabs]
        STT --> GroqSTT[Groq] & AssemblyAI & ElevenSTT[ElevenLabs]
    end

    subgraph Post-Processing
        Services --> Sharp[Sharp<br/>WebP conversion]
        Services --> AudioProc[Audio Processor<br/>Metadata extraction]
    end

    Sharp --> Storage[(Appwrite S3<br/>File Storage)]
    AudioProc --> Storage
```

**Key patterns:**

- **Round-robin model selection** — each request cycles to the next available model in the pool, distributing load across providers.
- **Metrics recording** — wraps every execution call with latency tracking, token usage, and error metadata.
- **Streaming support** — text generation supports Server-Sent Events (SSE) via `ReadableStream`.
- **Three image strategies** — `generateImage` (OpenAI-compatible like nscale), `generateText` with image modalities (Gemini/Vertex), and custom async polling (APIFree).
- **Unified response format** — all endpoints return `{ success, data, error, modelMetadata }`.

## Project Structure

```
index.ts                        # Elysia app entry point
src/
├── env.ts                      # Environment variables (dotenv)
├── core/
│   ├── logger.ts               # Pino logger configuration
│   ├── execution/              # AI task execution layer with fallback support
│   │   ├── text.ts             # generateText / streamText
│   │   ├── image.ts            # generateImage / generateText (image) / custom
│   │   ├── audio.ts            # experimental_generateSpeech
│   │   ├── transcription.ts    # experimental_transcribe
│   │   ├── fallback.ts         # Fallback candidate selection & prioritization
│   │   └── types.d.ts          # Execution input/output types
│   ├── metrics/
│   │   ├── recorder.ts         # Latency, usage, cost metrics wrapper
│   │   └── types.d.ts          # Metrics types
│   ├── models/                 # Centralized model catalogs
│   │   ├── text.ts             # All text models with pricing
│   │   ├── image.ts            # All image models
│   │   ├── audio.ts            # Voice models
│   │   ├── transcription.ts    # Transcription models
│   │   ├── pricing.ts          # Pricing lookup tables
│   │   └── index.ts            # Model exports
│   ├── orchestration/          # Strategy-based selection
│   │   ├── index.ts            # Model registries + selection logic
│   │   ├── low-cost.ts         # Cost-based model ordering
│   │   └── low-latency.ts      # Latency-based model ordering
│   └── streaming/
│       ├── events.ts           # StreamEvent type definitions
│       └── stream-builder.ts   # ReadableStream from AsyncGenerator
├── http/
│   ├── controllers/            # Request handling + response formatting
│   │   ├── text.ts
│   │   ├── image.ts
│   │   ├── audio.ts
│   │   └── transcription.ts
│   ├── middlewares/
│   │   ├── error.ts            # Global error handler + AppError class
│   │   ├── json.ts             # Content-Type validation
│   │   └── normalizePath.ts    # Trailing slash redirect
│   ├── openapi/
│   │   └── open-api.ts         # Response schema factory
│   └── routes/
│       ├── text.ts
│       ├── image.ts
│       ├── audio.ts
│       └── transcription.ts
├── infra/
│   ├── ai/                     # AI provider configurations
│   │   ├── apifree.ts          # APIFree (Qwen image, async polling)
│   │   ├── assembly.ts         # AssemblyAI (transcription)
│   │   ├── cerebras.ts         # Cerebras (text)
│   │   ├── cohere.ts           # Cohere (text)
│   │   ├── eleven.ts           # ElevenLabs (TTS + transcription)
│   │   ├── gemini.ts           # Google Gemini (text + image)
│   │   ├── github.ts           # GitHub Models (text)
│   │   ├── groq.ts             # Groq (text + transcription)
│   │   ├── ministral.ts        # Mistral (text)
│   │   ├── nscale.ts           # nscale (image)
│   │   ├── nvidia.ts           # NVIDIA NIM (text)
│   │   ├── olm.ts              # oLLM (text)
│   │   ├── open-router.ts      # OpenRouter (text)
│   │   ├── perplexity.ts       # Perplexity (text)
│   │   └── vertex.ts           # Vertex AI (text + image)
│   ├── processors/
│   │   ├── audio.ts            # Audio metadata extraction + URL fetch
│   │   └── sharp.ts            # Image conversion to WebP
│   ├── storage/
│   │   └── index.ts            # File storage interface
│   └── supabase/
│       ├── client.ts           # Supabase client
│       ├── metrics.ts          # Metrics persistence
│       └── model-latency-stats.ts  # Latency stats management
├── schemas/                    # Zod v4 validation schemas
│   ├── request.ts              # Unified request schema
│   ├── audio.ts
│   ├── image.ts
│   ├── stream.ts
│   ├── text.ts
│   └── transcription.ts
├── services/                   # Business logic layer
│   ├── text.ts
│   ├── image.ts
│   ├── audio.ts
│   └── transcription.ts
└── types/
    └── index.ts                # Shared type definitions
```

## API Structure

**Base URL:** `https://nexus-ia.tech/api/v1` (production) or `http://localhost:3000/api/v1` (local)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/text` | `POST` | Advanced LLM orchestration (Groq, Gemini, and 14 more) |
| `/text/stream` | `POST` | Streaming text generation via Server-Sent Events |
| `/image` | `POST` | High-fidelity image generation |
| `/audio` | `POST` | Realistic Text-to-Speech (TTS) |
| `/transcription` | `POST` | Fast Speech-to-Text processing |
| `/swagger` | `GET` | Interactive OpenAPI documentation |

## API Endpoints

All endpoints return the standard response envelope:

```json
{
  "success": true,
  "data": { "..." },
  "error": null,
  "modelMetadata": {
    "provider": "gemini",
    "modelId": "gemini-3-flash",
    "type": "text"
  }
}
```

OpenAPI documentation is available at `/openapi` when the server is running.

---

### Text Generation

#### `POST /text/generate`

Generates text from a prompt using the next available text model.

| Field    | Type     | Required | Description     |
| -------- | -------- | -------- | --------------- |
| `prompt` | `string` | Yes      | Min 1 character |

**Response `data`:**

```json
{ "text": "...", "length": 42, "modelMetadata": { "..." } }
```

**cURL example:**

```bash
curl -X POST http://localhost:3000/text/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Explain quantum computing in 3 sentences"}'
```

---

#### `POST /text/stream`

Streams text generation via Server-Sent Events.

| Field    | Type     | Required |
| -------- | -------- | -------- |
| `prompt` | `string` | Yes      |

Returns `text/event-stream` with JSON-encoded `StreamEvent` objects:

```
{ "type": "start", "modelMetadata": { ... } }
{ "type": "delta", "content": "chunk of text" }    ← repeated
{ "type": "end" }
```

**cURL example:**

```bash
curl -N -X POST http://localhost:3000/text/stream \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Write a short story about AI"}'
```

---

### Image Generation

#### `POST /image/generate`

Generates an image, converts it to WebP, and uploads it to storage.

| Field    | Type     | Required |
| -------- | -------- | -------- |
| `prompt` | `string` | Yes      |

**Response `data`:**

```json
{
  "imageUrl": "https://...",
  "width": 1024,
  "height": 1024,
  "altText": "Generated image for prompt: ..."
}
```

**cURL example:**

```bash
curl -X POST http://localhost:3000/image/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A city skyline at sunset, digital art"}'
```

---

### Audio Generation (TTS)

#### `POST /audio/generate`

Generates speech from text using ElevenLabs and uploads to storage.

| Field     | Type     | Required | Description                              |
| --------- | -------- | -------- | ---------------------------------------- |
| `prompt`  | `string` | Yes      | Text to synthesize                       |
| `voiceId` | `string` | No       | ElevenLabs voice ID (defaults to Rachel) |

**Response `data`:**

```json
{
  "audioUrl": "https://...",
  "durationSeconds": 12.5,
  "format": "mp3"
}
```

**cURL example:**

```bash
curl -X POST http://localhost:3000/audio/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello world, this is a test of text to speech."}'
```

---

### Transcription

#### `POST /transcription/transcribe`

Transcribes audio from a file upload or a URL.

| Field       | Type            | Required | Description                     |
| ----------- | --------------- | -------- | ------------------------------- |
| `audioFile` | `File` or `URL` | Yes      | Audio file or URL to transcribe |

**Response `data`:**

```json
{
  "text": "Transcribed text content...",
  "durationSeconds": 30.2
}
```

**cURL examples:**

```bash
# File upload
curl -X POST http://localhost:3000/transcription/transcribe \
  -F "audioFile=@recording.mp3"

# URL
curl -X POST http://localhost:3000/transcription/transcribe \
  -H "Content-Type: application/json" \
  -d '{"audioFile": "https://example.com/audio.mp3"}'
```

---

## AI Providers & Models

### Text Models (16 — round-robin)

| Provider      | Model ID                                | SDK / Approach                |
| ------------- | --------------------------------------- | ----------------------------- |
| Cohere        | `command-a-reasoning-08-2025`           | `@ai-sdk/cohere`              |
| GitHub Models | `gpt-4o`                                | `@ai-sdk/openai-compatible`   |
| Mistral       | `mistral-large-latest`                  | `@ai-sdk/mistral`             |
| GitHub Models | `Meta-Llama-3.1-405B-Instruct`          | `@ai-sdk/openai-compatible`   |
| GitHub Models | `Mistral-large-2407`                    | `@ai-sdk/openai-compatible`   |
| OpenRouter    | `arcee-ai/trinity-large-preview:free`   | `@openrouter/ai-sdk-provider` |
| OpenRouter    | `tngtech/deepseek-r1t2-chimera:free`    | `@openrouter/ai-sdk-provider` |
| OpenRouter    | `qwen/qwen3-next-80b-a3b-instruct:free` | `@openrouter/ai-sdk-provider` |
| NVIDIA NIM    | `deepseek-ai/deepseek-v3.2`             | `@ai-sdk/openai-compatible`   |
| Cerebras      | `gpt-oss-120b`                          | `@ai-sdk/cerebras`            |
| OpenRouter    | `z-ai/glm-4.5-air:free`                 | `@openrouter/ai-sdk-provider` |
| Perplexity    | `sonar`                                 | `@ai-sdk/perplexity`          |
| Groq          | `qwen/qwen3-32b`                        | `@ai-sdk/groq`                |
| oLLM          | `phala/kimi-k2.5`                       | `@ofoundation/ollm`           |
| Google Gemini | `gemini-3-flash-preview`                | `@ai-sdk/google`              |
| Vertex AI     | `gemini-3-flash-preview`                | `@ai-sdk/google-vertex`       |

### Image Models (4 — round-robin)

| Provider      | Model ID                         | Approach                                                     |
| ------------- | -------------------------------- | ------------------------------------------------------------ |
| nscale        | `ByteDance/SDXL-Lightning-4step` | `@ai-sdk/openai-compatible` → `generateImage`                |
| APIFree       | `qwen/qwen-image-2512`           | Custom async fetch (submit + poll)                           |
| Google Gemini | `gemini-3-pro-image-preview`     | `@ai-sdk/google` → `generateText` with image modality        |
| Vertex AI     | `gemini-3-pro-image-preview`     | `@ai-sdk/google-vertex` → `generateText` with image modality |

### Transcription Models (3 — round-robin)

| Provider   | Model ID           | SDK                  |
| ---------- | ------------------ | -------------------- |
| Groq       | `whisper-large-v3` | `@ai-sdk/groq`       |
| AssemblyAI | `best`             | `@ai-sdk/assemblyai` |
| ElevenLabs | `scribe_v1`        | `@ai-sdk/elevenlabs` |

### Voice Models (1)

| Provider   | Model ID    | SDK                  |
| ---------- | ----------- | -------------------- |
| ElevenLabs | `eleven_v3` | `@ai-sdk/elevenlabs` |

## Installation & Local Development

### Prerequisites

- [Bun](https://bun.sh) v1.0+
- API keys from desired AI providers (see [Environment Variables](#environment-variables))

### Clone the Repository

```bash
git clone https://github.com/Sebas200702/ai-service.git
cd ai-service
```

### Install Dependencies

```bash
bun install
```

### Configure Environment Variables

Create a `.env` file in the project root based on the template:

```bash
cp .env.example .env  # if available, or create manually
```

Then populate with your API keys:

```env
PORT=3000
NODE_ENV=development

# AI Providers
GEMINI_API_KEY=your_key
VERTEX_API_KEY=your_key
GROQ_API_KEY=your_key
# Add other providers as needed (see Environment Variables section)
```

### Start Development Server

```bash
bun dev
```

Starts the server with watch mode at `http://localhost:3000`. Access OpenAPI docs at `http://localhost:3000/swagger`.

### Production Build

```bash
bun run build
bun run start
```

### Code Formatting & Linting

```bash
bun run format
```

Uses [Biome](https://biomejs.dev) for linting and formatting.

## Deployment

Nexus IA is containerized with Docker for seamless deployment across any cloud platform.

### Docker Build

```bash
docker build -t nexus-ia:latest .
```

The project uses a multi-stage Docker build to keep the image size optimized for fast deployments.

### Docker Run

```bash
docker run -p 3000:3000 \
  -e PORT=3000 \
  -e GEMINI_API_KEY=your_key \
  -e GROQ_API_KEY=your_key \
  # Add other env vars as needed
  nexus-ia:latest
```

### Cloud Deployment Options

- **Dokploy** — Automated CI/CD and deployment orchestration
- **Railway** — Simple deployment from Git with automatic SSL
- **Fly.io** — Global edge deployment with auto-scaling
- **Vercel** — Serverless deployment for edge functions
- **Docker Hub** — Push and deploy from container registry

> **Recommendation:** Use Dokploy or Railway for managed CI/CD and automatic HTTPS with Let's Encrypt certificates.

## Environment Variables

Create a `.env` file in the project root:

```env
# Server
PORT=3000
NODE_ENV=development

# AI Providers
GEMINI_API_KEY=
VERTEX_API_KEY=
GROQ_API_KEY=
PERPLEXITY_API_KEY=
CEREBRAS_API_KEY=
OPENROUTER_API_KEY=
NVIDIA_API_KEY=
GITHUB_MODELS_API_KEY=
MINISTRAL_API_KEY=
HF_API_KEY=
OLLM_API_KEY=
AI_GATEWAY_API_KEY=
APIFREE_API_KEY=
NSCALE_API_KEY=
COHERE_API_KEY=
ASSEMBLYAI_API_KEY=
ELEVENLABS_API_KEY=

# Storage (Appwrite S3-compatible)
S3_ENTRY_ENDPOINT=
S3_PROJECT_ID=
S3_API_KEY=
S3_IMAGE_BUCKET_ID=
S3_AUDIO_BUCKET_ID=
```

> **Note:** The service starts even if some API keys are missing — requests to those providers will simply fail on their turn in the round-robin rotation.

## Adding a New Provider

To add a new AI provider, follow these steps:

### 1. Create the provider file

Create a new file in `src/infra/ai/` (e.g., `src/infra/ai/my-provider.ts`):

```typescript
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { env } from '@/env'

const myProvider = createOpenAICompatible({
  name: 'my-provider',
  baseURL: 'https://api.my-provider.com/v1',
  headers: {
    Authorization: `Bearer ${env.MY_PROVIDER_API_KEY}`,
  },
})

// Export the model(s) you need:
export const myProviderTextModel = myProvider.chatModel('model-name')
// or: export const myProviderImageModel = myProvider.imageModel('model-name')
```

### 2. Add the API key to config

In `src/config.ts`, add your new key:

```typescript
MY_PROVIDER_API_KEY: process.env.MY_PROVIDER_API_KEY || '',
```

### 3. Register the model in orchestration

In `src/core/orchestration/index.ts`, import the model and add it to the appropriate array:

```typescript
import { myProviderTextModel } from '@/infra/ai/my-provider'

// Add to the relevant array (textModels, imageModels, etc.)
export const textModels: AIModelDescriptor<LanguageModel>[] = [
  // ... existing models
  {
    id: 'my-provider-model-name',
    provider: 'my-provider',
    type: 'text',
    model: myProviderTextModel,
  },
]
```

That's it. The model will automatically be included in the round-robin rotation.

> **For image models:** If the provider uses the OpenAI `images.generate` API (returns `b64_json`), use `.imageModel()` and it will go through the `generateImage` path. If it uses `generateText` with image modalities (like Gemini), export it as a `LanguageModel` instead.

## License

This project is open source and available under the MIT License. See the [LICENSE](LICENSE) file for details.

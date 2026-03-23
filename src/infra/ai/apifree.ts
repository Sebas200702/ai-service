import { env } from '@/env'

const APIFREE_BASE_URL = 'https://api.skycoding.ai'
const POLL_INTERVAL_MS = 2000
const MAX_POLL_ATTEMPTS = 60

interface ApifreeSubmitResponse {
  code: number
  code_msg: string
  resp_data: {
    request_id: string
  }
}

interface ApifreeResultResponse {
  code: number
  code_msg: string
  resp_data: {
    request_id: string
    status: 'queuing' | 'processing' | 'success' | 'error' | 'failed'
    image_list?: string[]
    error?: string
  }
}

async function submitImageRequest(prompt: string): Promise<string> {
  const response = await fetch(`${APIFREE_BASE_URL}/v1/image/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.APIFREE_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'qwen/qwen-image-2512',
      prompt,
      width: 1024,
      height: 1024,
      num_images: 1,
      num_inference_steps: 50,
    }),
  })

  const data = (await response.json()) as ApifreeSubmitResponse
  if (data.code !== 200) {
    throw new Error(`APIFree submit failed: ${data.code_msg}`)
  }
  return data.resp_data.request_id
}

async function pollForResult(requestId: string): Promise<string[]> {
  for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))

    const response = await fetch(
      `${APIFREE_BASE_URL}/v1/image/${requestId}/result`,
      {
        headers: {
          Authorization: `Bearer ${env.APIFREE_API_KEY}`,
        },
      },
    )

    const data = (await response.json()) as ApifreeResultResponse
    if (data.code !== 200) {
      throw new Error(`APIFree poll failed: ${data.code_msg}`)
    }

    const { status } = data.resp_data
    if (status === 'success') {
      return data.resp_data.image_list ?? []
    }
    if (status === 'error' || status === 'failed') {
      throw new Error(
        `APIFree generation failed: ${data.resp_data.error ?? 'Unknown error'}`,
      )
    }
  }
  throw new Error('APIFree generation timed out')
}

async function downloadImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url)
  const buffer = await response.arrayBuffer()
  return Buffer.from(buffer).toString('base64')
}

export async function generateApifreeImage(
  prompt: string,
): Promise<{ base64: string; mimeType: string }> {
  const requestId = await submitImageRequest(prompt)
  const imageUrls = await pollForResult(requestId)

  if (!imageUrls.length) {
    throw new Error('APIFree returned no images')
  }

  const firstUrl = imageUrls[0]
  if (!firstUrl) {
    throw new Error('APIFree returned empty image list')
  }

  const base64 = await downloadImageAsBase64(firstUrl)
  return { base64, mimeType: 'image/png' }
}

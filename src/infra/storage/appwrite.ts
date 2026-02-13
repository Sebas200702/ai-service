import { Client, Storage } from 'node-appwrite'
import { CONFIG } from '@/config'
import { InputFile } from 'node-appwrite/file'
import { randomUUID } from 'node:crypto'

const s3Client = new Client()
  .setEndpoint(CONFIG.S3_ENTRY_ENDPOINT)
  .setProject(CONFIG.S3_PROJECT_ID)
  .setKey(CONFIG.S3_API_KEY)

if (!CONFIG.S3_PROJECT_ID || !CONFIG.S3_API_KEY) {
  throw new Error(
    'Missing S3_PROJECT_ID or S3_API_KEY environment variables. Set S3_PROJECT_ID and S3_API_KEY in your .env.'
  )
}

export const storage = new Storage(s3Client)

export const createFile = async ({
  buffer,
  name,
  type,
}: {
  buffer: Buffer
  name: string
  type?: 'image' | 'audio'
}) => {
  const file = InputFile.fromBuffer(buffer, name)

  return storage.createFile({
    bucketId: getBucketIdForType(type ?? 'image'),
    fileId: randomUUID(),
    file,
  })
}
const getBucketIdForType = (type: 'image' | 'audio') => {
  if (type === 'image') {
    return CONFIG.S3_IMAGE_BUCKET_ID
  }

  return CONFIG.S3_AUDIO_BUCKET_ID
}

export const getPublicFilePreviewUrl = (
  fileId: string,
  type: 'image' | 'audio' = 'image'
) => {
  return `${CONFIG.S3_ENTRY_ENDPOINT}/storage/buckets/${getBucketIdForType(type)}/files/${fileId}/preview?project=${CONFIG.S3_PROJECT_ID}`
}

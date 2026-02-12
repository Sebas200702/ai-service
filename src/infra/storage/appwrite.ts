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
    'Missing S3_PROJECT_ID or S3_API_KEY environment variables. Set S3_PROJECT_ID and S3_API_KEY in your .env.',
  )
}

export const storage = new Storage(s3Client)

export const createFile = async ({
  buffer,
  name,
}: {
  buffer: Buffer
  name: string
}) => {
  const file = InputFile.fromBuffer(buffer, name)

  return storage.createFile({
    bucketId: CONFIG.S3_BUCKET_ID,
    fileId: randomUUID(),
    file,
  })
}

export const getPublicFilePreviewUrl = (fileId: string) => {
  return `${CONFIG.S3_ENTRY_ENDPOINT}/storage/buckets/${CONFIG.S3_BUCKET_ID}/files/${fileId}/preview?project=${CONFIG.S3_PROJECT_ID}`
}

import { supabase } from '@/infra/supabase/client'
import { AppError } from '@/http/middlewares/error'

export const createFile = async ({
  bucket,
  filePath,
  file,
}: {
  bucket: string
  filePath: string
  file: File
}) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    })
  if (error) {
    throw new AppError({
      service: 'storage',
      operation: 'upload',
      reason: error.message,
    })
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath)

  return { ...data, publicUrl: urlData.publicUrl }
}

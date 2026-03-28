import { randomBytes, createHash } from 'node:crypto'

import { supabase } from '@/infra/supabase/client'

export const generateApiKey = async (userId: string) => {
  const rawKey = `nx_${randomBytes(24).toString('hex')}`

  const keyHash = createHash('sha256').update(rawKey).digest('hex')

  const keyPreview = `${rawKey.slice(0, 5)}...${rawKey.slice(-4)}`

  await supabase.from('api_keys').insert({
    user_id: userId,
    key_hash: keyHash,
    key_preview: keyPreview,
  })

  return {
    apiKey: rawKey,
    keyPreview,
  }
}

export const validateApiKey = async (apiKey: string) => {
  const normalizedKey = apiKey.trim()

  if (!normalizedKey.startsWith('nx_')) {
    return null
  }

  try {
    const keyHash = createHash('sha256').update(normalizedKey).digest('hex')

    const { data, error } = await supabase
      .from('api_keys')
      .select('user_id')
      .eq('key_hash', keyHash)
      .maybeSingle()

    if (error || !data?.user_id) {
      return null
    }

    return { id: data.user_id }
  } catch {
    return null
  }
}

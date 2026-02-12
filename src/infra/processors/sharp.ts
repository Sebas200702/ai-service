import sharp from 'sharp'

export const getImageSize = async (buffer: Buffer) => {
  const metadata = await sharp(buffer).metadata()

  if (!metadata.width || !metadata.height) {
    throw new Error('Unable to read image dimensions')
  }

  return {
    width: metadata.width,
    height: metadata.height,
  }
}

export const proccesImage = async (
  buffer: Buffer,
  quality = 80
): Promise<{
  buffer: Buffer
  width: number
  height: number
  fileName: string
}> => {
  // Convert to WebP before uploading to ensure allowed extension
  const webpBuffer = await toWebp(buffer, quality)
  const fileName = `generated-image-${Date.now()}.webp`
  const { width, height } = await getImageSize(webpBuffer)
  return {
    buffer: webpBuffer,
    width,
    height,
    fileName,
  }
}
export const toWebp = async (buffer: Buffer, quality = 80) => {
  return sharp(buffer).webp({ quality }).toBuffer()
}

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

export const toWebp = async (buffer: Buffer, quality = 80) => {
  return sharp(buffer).webp({ quality }).toBuffer()
}


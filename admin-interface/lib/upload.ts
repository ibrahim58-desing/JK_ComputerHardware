import { writeFile, mkdir, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'products')
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']
const MAX_SIZE =
  parseInt(process.env.UPLOAD_MAX_SIZE_MB || '5', 10) * 1024 * 1024
// Product photos only ever render as card thumbnails or a detail-page
// preview — there's no reason to ship camera-resolution originals.
const MAX_DIMENSION = 1600
const WEBP_QUALITY = 82

const MAGIC_BYTES: Record<string, number[][]> = {
  '.jpg': [[0xff, 0xd8, 0xff]],
  '.jpeg': [[0xff, 0xd8, 0xff]],
  '.png': [[0x89, 0x50, 0x4e, 0x47]],
  '.webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header (WebP container)
}

async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }
}

function matchesMagicBytes(buffer: Buffer, ext: string): boolean {
  const signatures = MAGIC_BYTES[ext]
  if (!signatures) return false

  return signatures.some((sig) =>
    sig.every((byte, index) => buffer[index] === byte)
  )
}

function sanitizeFilename(name: string): string {
  return path.basename(name).replace(/[^a-zA-Z0-9._-]/g, '')
}

/**
 * Validate and save an uploaded image file.
 * Returns the public URL path for the saved image.
 */
export async function saveUploadedImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Allowed: jpg, jpeg, png, webp')
  }

  if (file.size > MAX_SIZE) {
    throw new Error('File too large. Maximum size is 5MB')
  }

  const originalExt = path.extname(sanitizeFilename(file.name)).toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(originalExt)) {
    throw new Error('Invalid file extension. Allowed: jpg, jpeg, png, webp')
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  if (!matchesMagicBytes(buffer, originalExt)) {
    throw new Error('File content does not match the declared image type')
  }

  await ensureUploadDir()

  // Re-encode every upload to a resized, compressed WebP — this also
  // strips EXIF/GPS metadata as a side effect (sharp doesn't copy it
  // forward unless explicitly asked to).
  const optimized = await sharp(buffer)
    .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer()

  const uniqueName = `${Date.now()}-${uuidv4()}.webp`
  const filePath = path.join(UPLOAD_DIR, uniqueName)

  // Prevent directory traversal
  const resolvedPath = path.resolve(filePath)
  const resolvedDir = path.resolve(UPLOAD_DIR)
  if (!resolvedPath.startsWith(resolvedDir)) {
    throw new Error('Invalid upload path')
  }

  await writeFile(resolvedPath, optimized)
  return `/uploads/products/${uniqueName}`
}

/**
 * Delete an uploaded image from disk.
 */
export async function deleteUploadedImage(imageUrl: string): Promise<void> {
  if (!imageUrl || !imageUrl.startsWith('/uploads/products/')) {
    return
  }

  const safeName = path.basename(imageUrl)
  const filePath = path.join(UPLOAD_DIR, safeName)
  const resolvedPath = path.resolve(filePath)
  const resolvedDir = path.resolve(UPLOAD_DIR)

  if (!resolvedPath.startsWith(resolvedDir)) {
    console.error('[Upload] Blocked path traversal attempt:', imageUrl)
    return
  }

  try {
    if (existsSync(resolvedPath)) {
      await unlink(resolvedPath)
    }
  } catch (error) {
    console.error('[Upload] Failed to delete file:', resolvedPath, error)
  }
}

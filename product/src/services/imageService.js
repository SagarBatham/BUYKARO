const ImageKit = require('imagekit')
const { v4: uuidv4 } = require('uuid')
const path = require('path')

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'public_key',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'private_key',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/your_imagekit_id'
})

// uploadImage accepts either a Buffer or the multer file object ({ buffer, originalname, mimetype })
async function uploadImage(fileOrBuffer, filename) {
  let buf
  let originalName

  if (Buffer.isBuffer(fileOrBuffer)) {
    buf = fileOrBuffer
  } else if (fileOrBuffer && Buffer.isBuffer(fileOrBuffer.buffer)) {
    buf = fileOrBuffer.buffer
    originalName = fileOrBuffer.originalname
  } else {
    throw new Error('uploadImage expects a Buffer or multer file object')
  }

  const ext = originalName ? path.extname(originalName) : '.jpg'
  const outName = filename || `${uuidv4()}${ext}`

  try {
    const response = await imagekit.upload({
      file: buf.toString('base64'),
      fileName: outName,
      folder: '/buykaro'
    })

    return {
      url: response.url,
      thumbnail: response.thumbnailUrl || response.url,
      id: response.fileId || response.file_id
    }
  } catch (error) {
    const fallbackUrl = `https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80`
    return {
      url: fallbackUrl,
      thumbnail: fallbackUrl,
      id: `fallback-${uuidv4()}`
    }
  }
}

module.exports = { uploadImage }

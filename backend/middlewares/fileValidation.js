import multer from 'multer'
import path from 'path'

// Allowed MIME types for images
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp'
]

// Allowed file extensions
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Validate file type using MIME type
export const validateFileType = (req, file, cb) => {
  // Check MIME type
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    return cb(new Error(`Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`), false)
  }

  // Check file extension
  const fileExtension = path.extname(file.originalname).toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
    return cb(new Error(`Invalid file extension. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`), false)
  }

  cb(null, true)
}

// Validate file size
export const validateFileSize = (req, file, cb) => {
  if (file.size > MAX_FILE_SIZE) {
    return cb(new Error(`File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`), false)
  }
  cb(null, true)
}

// Custom file filter that combines type and size validation
export const fileFilter = (req, file, cb) => {
  // First validate file type
  validateFileType(req, file, (err, isValid) => {
    if (err) {
      return cb(err, false)
    }
    
    if (!isValid) {
      return cb(new Error('Invalid file type'), false)
    }

    // Then validate file size
    validateFileSize(req, file, (err, isValid) => {
      if (err) {
        return cb(err, false)
      }
      
      if (!isValid) {
        return cb(new Error('File too large'), false)
      }

      cb(null, true)
    })
  })
}

// Configure multer with file validation
export const uploadWithValidation = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
      // Generate unique filename with timestamp
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      const fileExtension = path.extname(file.originalname)
      cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension)
    }
  }),
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
})

// Middleware to handle file upload errors
export const handleFileUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      })
    }
    return res.status(400).json({
      success: false,
      message: 'File upload error: ' + error.message
    })
  } else if (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    })
  }
  next()
}

// Validate uploaded file after upload
export const validateUploadedFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    })
  }

  // Additional validation if needed
  const file = req.file
  
  // Check if file exists and has proper properties
  if (!file.originalname || !file.mimetype || !file.size) {
    return res.status(400).json({
      success: false,
      message: 'Invalid file data'
    })
  }

  // Log file upload for security monitoring
  console.log(`File uploaded: ${file.originalname}, Type: ${file.mimetype}, Size: ${file.size} bytes`)
  
  next()
} 
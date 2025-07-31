import mongoSanitize from 'express-mongo-sanitize'
import xss from 'xss'

// Sanitize request body to prevent NoSQL injection
export const sanitizeBody = (req, res, next) => {
  if (req.body) {
    // Remove any keys that start with '$' or contain '.'
    const sanitized = {}
    for (const [key, value] of Object.entries(req.body)) {
      if (!key.startsWith('$') && !key.includes('.')) {
        sanitized[key] = value
      }
    }
    req.body = sanitized
  }
  next()
}

// Sanitize query parameters to prevent NoSQL injection
export const sanitizeQuery = (req, res, next) => {
  if (req.query) {
    const sanitized = {}
    for (const [key, value] of Object.entries(req.query)) {
      if (!key.startsWith('$') && !key.includes('.')) {
        sanitized[key] = value
      }
    }
    req.query = sanitized
  }
  next()
}

// Sanitize URL parameters to prevent NoSQL injection
export const sanitizeParams = (req, res, next) => {
  if (req.params) {
    const sanitized = {}
    for (const [key, value] of Object.entries(req.params)) {
      if (!key.startsWith('$') && !key.includes('.')) {
        sanitized[key] = value
      }
    }
    req.params = sanitized
  }
  next()
}

// Sanitize string inputs to prevent XSS
export const sanitizeString = (str) => {
  if (typeof str === 'string') {
    return xss(str.trim())
  }
  return str
}

// Sanitize object properties to prevent XSS
export const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  const sanitized = {}
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value)
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value)
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

// Comprehensive sanitization middleware
export const sanitizeAll = (req, res, next) => {
  // Sanitize body
  if (req.body) {
    // Remove any keys that start with '$' or contain '.'
    const sanitized = {}
    for (const [key, value] of Object.entries(req.body)) {
      if (!key.startsWith('$') && !key.includes('.')) {
        sanitized[key] = value
      }
    }
    req.body = sanitized
    req.body = sanitizeObject(req.body)
  }

  // Sanitize query
  if (req.query) {
    const sanitized = {}
    for (const [key, value] of Object.entries(req.query)) {
      if (!key.startsWith('$') && !key.includes('.')) {
        sanitized[key] = value
      }
    }
    req.query = sanitized
    req.query = sanitizeObject(req.query)
  }

  // Sanitize params
  if (req.params) {
    const sanitized = {}
    for (const [key, value] of Object.entries(req.params)) {
      if (!key.startsWith('$') && !key.includes('.')) {
        sanitized[key] = value
      }
    }
    req.params = sanitized
    req.params = sanitizeObject(req.params)
  }

  next()
}

// Sanitize specific fields for user input
export const sanitizeUserInput = (req, res, next) => {
  if (req.body) {
    // Sanitize common user input fields
    const fieldsToSanitize = ['name', 'email', 'phone', 'address']
    
    fieldsToSanitize.forEach(field => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        req.body[field] = sanitizeString(req.body[field])
      }
    })

    // Sanitize address object if it exists
    if (req.body.address && typeof req.body.address === 'object') {
      req.body.address = sanitizeObject(req.body.address)
    }
  }
  
  next()
} 
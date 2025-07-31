// Frontend password validation utilities
export const validatePasswordComplexity = (password, username = '') => {
  const errors = []
  
  // Check length (8-16 characters)
  if (password.length < 8 || password.length > 16) {
    errors.push('Password must be between 8 and 16 characters')
  }
  
  // Check for lowercase letters
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  // Check for uppercase letters
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  // Check for numbers
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  // Check for special characters
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  // Check if password is same as username
  if (username && password.toLowerCase() === username.toLowerCase()) {
    errors.push('Password cannot be the same as username')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Get password strength score (0-4)
export const getPasswordStrength = (password) => {
  let score = 0
  
  if (password.length >= 8) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++
  
  return score
}

// Get password strength label
export const getPasswordStrengthLabel = (score) => {
  switch (score) {
    case 0:
    case 1:
      return 'Very Weak'
    case 2:
      return 'Weak'
    case 3:
      return 'Medium'
    case 4:
      return 'Strong'
    case 5:
      return 'Very Strong'
    default:
      return 'Very Weak'
  }
}

// Get password strength color
export const getPasswordStrengthColor = (score) => {
  switch (score) {
    case 0:
    case 1:
      return '#ff4444' // Red
    case 2:
      return '#ff8800' // Orange
    case 3:
      return '#ffaa00' // Yellow
    case 4:
      return '#00aa00' // Green
    case 5:
      return '#008800' // Dark Green
    default:
      return '#ff4444' // Red
  }
} 
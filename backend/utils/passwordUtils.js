import bcrypt from 'bcrypt'

// Password complexity validation
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

// Check password strength score (0-4)
export const getPasswordStrength = (password) => {
  let score = 0
  
  if (password.length >= 8) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++
  
  return score
}

// Hash password with salt
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12) // Increased salt rounds for better security
  return await bcrypt.hash(password, salt)
}

// Compare password with hash
export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash)
}

// Check if password was previously used
export const checkPasswordHistory = async (password, previousPasswords) => {
  for (const hashedPassword of previousPasswords) {
    const isMatch = await bcrypt.compare(password, hashedPassword)
    if (isMatch) {
      return true // Password was previously used
    }
  }
  return false
}

// Update password history
export const updatePasswordHistory = async (newPassword, user) => {
  const hashedNewPassword = await hashPassword(newPassword)
  
  // Add current password to history
  const updatedHistory = [user.password, ...user.previousPasswords]
  
  // Keep only the last N passwords (default 5)
  const limitedHistory = updatedHistory.slice(0, user.passwordHistoryLimit - 1)
  
  return {
    newHashedPassword: hashedNewPassword,
    updatedHistory: limitedHistory
  }
}

// Generate session ID
export const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Calculate session expiry (30 days)
export const getSessionExpiry = () => {
  const expiry = new Date()
  expiry.setDate(expiry.getDate() + 30)
  return expiry
} 
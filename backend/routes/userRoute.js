import express from 'express'
import { 
  registerUser, 
  loginUser, 
  logoutUser,
  changePassword,
  verifyEmail,
  resendVerificationEmail,
  getProfile, 
  updateProfile, 
  bookAppointment, 
  listAppointment, 
  cancelAppointment 
} from '../controllers/userController.js'
import authUser from '../middlewares/authUser.js'
import { uploadWithValidation, validateUploadedFile, handleFileUploadError } from '../middlewares/fileValidation.js'
import { sanitizeUserInput } from '../middlewares/sanitize.js'

const userRouter = express.Router()

// Public routes
userRouter.post('/register', sanitizeUserInput, registerUser)
userRouter.post('/login', sanitizeUserInput, loginUser)
userRouter.post('/verify-email', sanitizeUserInput, verifyEmail)
userRouter.post('/resend-verification', sanitizeUserInput, resendVerificationEmail)

// Protected routes
userRouter.post('/logout', authUser, logoutUser)
userRouter.post('/change-password', authUser, sanitizeUserInput, changePassword)
userRouter.get('/get-profile', authUser, getProfile)
userRouter.post('/update-profile', 
  authUser, 
  sanitizeUserInput, 
  uploadWithValidation.single('image'), 
  validateUploadedFile,
  handleFileUploadError,
  updateProfile
)
userRouter.post('/book-appointment', authUser, sanitizeUserInput, bookAppointment)
userRouter.get('/appointments', authUser, listAppointment)
userRouter.post('/cancel-appointment', authUser, sanitizeUserInput, cancelAppointment)

export default userRouter
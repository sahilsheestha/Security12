import validator from 'validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'
import userModel from '../models/userModel.js'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'
import { 
  validatePasswordComplexity, 
  hashPassword, 
  comparePassword, 
  checkPasswordHistory, 
  updatePasswordHistory,
  generateSessionId,
  getSessionExpiry
} from '../utils/passwordUtils.js'
import { generateOTP, sendOTPEmail, sendPasswordResetEmail } from '../services/emailService.js'

// API to register user
const registerUser = async (req, res) => {

  try {

    const { name, email, password } = req.body

    if (!name || !password || !email) {
      return res.json({ success: false, message: 'Missing Details' })
    }

    // validating email format
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: 'Enter a valid email' })
    }

    // Enhanced password validation
    const passwordValidation = validatePasswordComplexity(password, email)
    if (!passwordValidation.isValid) {
      return res.json({ 
        success: false, 
        message: 'Password requirements not met',
        errors: passwordValidation.errors 
      })
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email })
    if (existingUser) {
      return res.json({ success: false, message: 'User already exists' })
    }

    // Hash password with enhanced security
    const hashedPassword = await hashPassword(password)

    // Generate email verification OTP
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    const userData = {
      name, 
      email, 
      password: hashedPassword,
      passwordCreated: new Date(),
      emailVerificationOTP: otp,
      emailVerificationExpires: otpExpiry
    }

    const newUser = new userModel(userData)
    const user = await newUser.save()

    // Send verification email
    const emailResult = await sendOTPEmail(email, otp)
    if (!emailResult.success) {
      console.error('Email sending failed:', emailResult.error)
      // Still create user but notify about email issue
      return res.json({ 
        success: true, 
        message: 'Account created but verification email could not be sent. Please contact support.',
        token: null,
        emailVerified: false
      })
    }

    // Generate session and JWT
    const sessionId = generateSessionId()
    const sessionExpiry = getSessionExpiry()
    const token = jwt.sign({ id: user._id, sessionId }, process.env.JWT_SECRET, { expiresIn: '30d' })

    // Store session in user document
    await userModel.findByIdAndUpdate(user._id, {
      $push: {
        activeSessions: {
          sessionId,
          token,
          createdAt: new Date(),
          expiresAt: sessionExpiry
        }
      },
      lastLogin: new Date()
    })

    // Set session in cookie
    req.session.userId = user._id
    req.session.sessionId = sessionId

    res.json({ 
      success: true, 
      token, 
      sessionId,
      message: 'Account created successfully! Please check your email for verification.',
      emailVerified: false
    })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }

}

// API to verify email
const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body

    const user = await userModel.findOne({ email })
    if (!user) {
      return res.json({ success: false, message: 'User not found' })
    }

    if (user.emailVerified) {
      return res.json({ success: false, message: 'Email already verified' })
    }

    if (!user.emailVerificationOTP || !user.emailVerificationExpires) {
      return res.json({ success: false, message: 'No verification code found' })
    }

    if (new Date() > user.emailVerificationExpires) {
      return res.json({ success: false, message: 'Verification code has expired' })
    }

    if (user.emailVerificationOTP !== otp) {
      return res.json({ success: false, message: 'Invalid verification code' })
    }

    // Mark email as verified
    await userModel.findByIdAndUpdate(user._id, {
      emailVerified: true,
      emailVerificationOTP: null,
      emailVerificationExpires: null
    })

    res.json({ success: true, message: 'Email verified successfully!' })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to resend verification email
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body

    const user = await userModel.findOne({ email })
    if (!user) {
      return res.json({ success: false, message: 'User not found' })
    }

    if (user.emailVerified) {
      return res.json({ success: false, message: 'Email already verified' })
    }

    // Generate new OTP
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await userModel.findByIdAndUpdate(user._id, {
      emailVerificationOTP: otp,
      emailVerificationExpires: otpExpiry
    })

    // Send new verification email
    const emailResult = await sendOTPEmail(email, otp)
    if (!emailResult.success) {
      return res.json({ success: false, message: 'Failed to send verification email' })
    }

    res.json({ success: true, message: 'Verification email sent successfully!' })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API for user login
const loginUser = async (req, res) => {

  try {

    const { email, password } = req.body
    const user = await userModel.findOne({ email })

    if (!user) {
      return res.json({ success: false, message: 'User does not exist' })
    }

    // Check if account is locked
    if (user.accountLocked && user.lockoutUntil && new Date() < user.lockoutUntil) {
      return res.json({ 
        success: false, 
        message: `Account is locked until ${user.lockoutUntil.toLocaleString()}` 
      })
    }

    // Check if account is locked but lockout period has expired
    if (user.accountLocked && user.lockoutUntil && new Date() >= user.lockoutUntil) {
      await userModel.findByIdAndUpdate(user._id, {
        accountLocked: false,
        failedLoginAttempts: 0,
        lockoutUntil: null
      })
    }

    const isMatch = await comparePassword(password, user.password)

    if (isMatch) {
      // Reset failed login attempts
      await userModel.findByIdAndUpdate(user._id, {
        failedLoginAttempts: 0,
        accountLocked: false,
        lockoutUntil: null,
        lastLogin: new Date()
      })

      // Generate new session
      const sessionId = generateSessionId()
      const sessionExpiry = getSessionExpiry()
      const token = jwt.sign({ id: user._id, sessionId }, process.env.JWT_SECRET, { expiresIn: '30d' })

      // Store session in user document
      await userModel.findByIdAndUpdate(user._id, {
        $push: {
          activeSessions: {
            sessionId,
            token,
            createdAt: new Date(),
            expiresAt: sessionExpiry
          }
        }
      })

      // Set session in cookie
      req.session.userId = user._id
      req.session.sessionId = sessionId

      res.json({ 
        success: true, 
        token, 
        sessionId,
        emailVerified: user.emailVerified
      })
    } else {
      // Increment failed login attempts
      const newFailedAttempts = (user.failedLoginAttempts || 0) + 1
      let lockoutUntil = null
      let accountLocked = false

      // Lock account after 5 failed attempts for 30 minutes
      if (newFailedAttempts >= 5) {
        lockoutUntil = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
        accountLocked = true
      }

      await userModel.findByIdAndUpdate(user._id, {
        failedLoginAttempts: newFailedAttempts,
        accountLocked,
        lockoutUntil
      })

      const remainingAttempts = 5 - newFailedAttempts
      res.json({ 
        success: false, 
        message: `Invalid credentials. ${remainingAttempts > 0 ? remainingAttempts + ' attempts remaining' : 'Account locked for 30 minutes'}` 
      })
    }

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }

}

// API to logout user
const logoutUser = async (req, res) => {
  try {
    const { userId, sessionId } = req.body

    // Remove session from user document
    await userModel.findByIdAndUpdate(userId, {
      $pull: {
        activeSessions: { sessionId }
      }
    })

    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        return res.json({ success: false, message: 'Error logging out' })
      }
      res.clearCookie('sessionId')
      res.json({ success: true, message: 'Logged out successfully' })
    })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to change password
const changePassword = async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body

    const user = await userModel.findById(userId)
    if (!user) {
      return res.json({ success: false, message: 'User not found' })
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return res.json({ success: false, message: 'Current password is incorrect' })
    }

    // Validate new password complexity
    const passwordValidation = validatePasswordComplexity(newPassword, user.email)
    if (!passwordValidation.isValid) {
      return res.json({ 
        success: false, 
        message: 'New password does not meet requirements',
        errors: passwordValidation.errors 
      })
    }

    // Check if new password was previously used
    const wasPreviouslyUsed = await checkPasswordHistory(newPassword, user.previousPasswords)
    if (wasPreviouslyUsed) {
      return res.json({ success: false, message: 'New password cannot be the same as any of your previous passwords' })
    }

    // Update password and history
    const { newHashedPassword, updatedHistory } = await updatePasswordHistory(newPassword, user)

    await userModel.findByIdAndUpdate(userId, {
      password: newHashedPassword,
      previousPasswords: updatedHistory,
      passwordCreated: new Date()
    })

    res.json({ success: true, message: 'Password changed successfully' })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to get user profile data
const getProfile = async (req, res) => {

  try {

    const { userId } = req.body
    const userData = await userModel.findById(userId).select('-password')

    res.json({ success: true, userData })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }

}

// API to update user profile
const updateProfile = async (req, res) => {

  try {

    const { userId, name, phone, address, dob, gender } = req.body
    const imageFile = req.file

    if (!name || !phone || !dob || !gender) {
      return res.json({ success: false, message: 'Data Missing' })
    }

    await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender })

    if (imageFile) {

      // upload image to cloudinary
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' })
      const imageURL = imageUpload.secure_url

      await userModel.findByIdAndUpdate(userId, { image: imageURL })
    }

    res.json({ success: true, message: 'Profile Updated' })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }

}

// API to book appointment
const bookAppointment = async (req, res) => {

  try {

    const { userId, docId, slotDate, slotTime } = req.body

    const docData = await doctorModel.findById(docId).select('-password')

    if (!docData.available) {
      return res.json({ success: false, message: 'Doctor not available' })
    }

    let slots_booked = docData.slots_booked

    // checking for slot availablity
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({ success: false, message: 'Slot not available' })
      } else {
        slots_booked[slotDate].push(slotTime)
      }
    } else {
      slots_booked[slotDate] = []
      slots_booked[slotDate].push(slotTime)
    }

    const userData = await userModel.findById(userId).select('-password')

    delete docData.slots_booked

    const appointmentData = {
      userId, docId,
      userData, docData,
      amount: docData.fees,
      slotTime, slotDate,
      date: Date.now()
    }

    const newAppointment = new appointmentModel(appointmentData)
    await newAppointment.save()

    // save new slots data in docData
    await doctorModel.findByIdAndUpdate(docId, { slots_booked })

    res.json({ success: true, message: 'Appointment Booked' })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }

}

// API to get user appointments for frontend my-appointments page
const listAppointment = async (req, res) => {

  try {

    const { userId } = req.body
    const appointments = await appointmentModel.find({ userId })

    res.json({ success: true, appointments })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }

}

// API to cancel appointment
const cancelAppointment = async (req, res) => {

  try {

    const { userId, appointmentId } = req.body
    const appointmentData = await appointmentModel.findById(appointmentId)

    // verify appointment user
    if (appointmentData.userId !== userId) {
      return res.json({ success: false, message: 'Unauthorized action' })
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

    // releasing doctor slot
    const { docId, slotDate, slotTime } = appointmentData
    const doctorData = await doctorModel.findById(docId)
    let slots_booked = doctorData.slots_booked

    slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

    await doctorModel.findByIdAndUpdate(docId, { slots_booked })

    res.json({ success: true, message: 'Appointment Cancelled' })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }

}

export { 
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
}
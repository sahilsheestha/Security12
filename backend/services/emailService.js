import nodemailer from 'nodemailer'
import crypto from 'crypto'

// Email configuration
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
}

// Create transporter
const transporter = nodemailer.createTransport(emailConfig)

// Generate OTP
export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString()
}

// Send OTP email
export const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"Doctor Appointment System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Email Verification - Doctor Appointment System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4F46E5; color: white; padding: 20px; text-align: center;">
            <h1>Email Verification</h1>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2>Hello!</h2>
            <p>Thank you for registering with our Doctor Appointment System.</p>
            <p>Your verification code is:</p>
            <div style="background-color: #4F46E5; color: white; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;">
              ${otp}
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this verification, please ignore this email.</p>
            <p>Best regards,<br>Doctor Appointment System Team</p>
          </div>
        </div>
      `
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent: ', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Email sending error:', error)
    return { success: false, error: error.message }
  }
}

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
    
    const mailOptions = {
      from: `"Doctor Appointment System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset - Doctor Appointment System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #DC2626; color: white; padding: 20px; text-align: center;">
            <h1>Password Reset</h1>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2>Hello!</h2>
            <p>You requested a password reset for your account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${resetUrl}" style="background-color: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this reset, please ignore this email.</p>
            <p>Best regards,<br>Doctor Appointment System Team</p>
          </div>
        </div>
      `
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Password reset email sent: ', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Password reset email error:', error)
    return { success: false, error: error.message }
  }
}

// Verify email configuration
export const verifyEmailConfig = async () => {
  try {
    await transporter.verify()
    console.log('✅ Email configuration verified successfully')
    return true
  } catch (error) {
    console.error('❌ Email configuration error:', error)
    return false
  }
} 
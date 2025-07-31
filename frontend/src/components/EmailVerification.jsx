import React, { useState, useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const EmailVerification = ({ email, onVerificationSuccess }) => {
  const { backendUrl } = useContext(AppContext)
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const handleVerifyEmail = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data } = await axios.post(backendUrl + '/api/user/verify-email', {
        email,
        otp
      }, {
        withCredentials: true
      })

      if (data.success) {
        toast.success('Email verified successfully!')
        onVerificationSuccess && onVerificationSuccess()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error('Email verification error:', error)
      toast.error(error.response?.data?.message || error.message || 'Verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setIsResending(true)

    try {
      const { data } = await axios.post(backendUrl + '/api/user/resend-verification', {
        email
      }, {
        withCredentials: true
      })

      if (data.success) {
        toast.success('Verification email sent successfully!')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error('Resend OTP error:', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to resend email')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Email Verification</h2>
      
      <div className="mb-4 text-center text-gray-600">
        <p>We've sent a verification code to:</p>
        <p className="font-medium text-gray-800">{email}</p>
      </div>

      <form onSubmit={handleVerifyEmail} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Verification Code
          </label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter 6-digit code"
            maxLength="6"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !otp}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            isLoading || !otp
              ? 'bg-gray-400 cursor-not-allowed text-gray-600'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isLoading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
        <button
          onClick={handleResendOTP}
          disabled={isResending}
          className={`text-blue-600 hover:text-blue-800 text-sm ${
            isResending ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isResending ? 'Sending...' : 'Resend Code'}
        </button>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> The verification code will expire in 10 minutes.
          Check your spam folder if you don't see the email.
        </p>
      </div>
    </div>
  )
}

export default EmailVerification 
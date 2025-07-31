import React, { useState, useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import PasswordStrengthBar from './PasswordStrengthBar.jsx'
import { validatePasswordComplexity } from '../utils/passwordUtils.js'

const ChangePassword = () => {
  const { backendUrl, token } = useContext(AppContext)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [passwordErrors, setPasswordErrors] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Real-time password validation
  React.useEffect(() => {
    if (newPassword) {
      const validation = validatePasswordComplexity(newPassword)
      setPasswordErrors(validation.errors)
    } else {
      setPasswordErrors([])
    }
  }, [newPassword])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate new password
      const validation = validatePasswordComplexity(newPassword)
      if (!validation.isValid) {
        toast.error('Please fix password requirements')
        setIsLoading(false)
        return
      }

      // Check if passwords match
      if (newPassword !== confirmPassword) {
        toast.error('New passwords do not match')
        setIsLoading(false)
        return
      }

      const { data } = await axios.post(
        backendUrl + '/api/user/change-password',
        {
          currentPassword,
          newPassword
        },
        {
          headers: { token },
          withCredentials: true
        }
      )

      if (data.success) {
        toast.success('Password changed successfully!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        if (data.errors) {
          data.errors.forEach(error => toast.error(error))
        } else {
          toast.error(data.message)
        }
      }
    } catch (error) {
      console.error('Change password error:', error)
      toast.error(error.response?.data?.message || error.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Change Password</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.current ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md pr-10"
              required
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => togglePasswordVisibility('current')}
            >
              {showPasswords.current ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.new ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md pr-10"
              required
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => togglePasswordVisibility('new')}
            >
              {showPasswords.new ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          
          {/* Password strength bar */}
          {newPassword && (
            <PasswordStrengthBar password={newPassword} />
          )}
          
          {/* Password requirements */}
          {newPassword && passwordErrors.length > 0 && (
            <div className="mt-2 text-xs">
              <p className="text-red-600 font-medium mb-1">Password Requirements:</p>
              <ul className="text-red-500 space-y-1">
                {passwordErrors.map((error, index) => (
                  <li key={index} className="flex items-center">
                    <span className="mr-1">•</span>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full p-2 border rounded-md pr-10 ${
                confirmPassword && newPassword !== confirmPassword 
                  ? 'border-red-500' 
                  : 'border-gray-300'
              }`}
              required
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => togglePasswordVisibility('confirm')}
            >
              {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          
          {/* Password match indicator */}
          {confirmPassword && (
            <div className="mt-1 text-xs">
              {newPassword === confirmPassword ? (
                <span className="text-green-600">✓ Passwords match</span>
              ) : (
                <span className="text-red-600">✗ Passwords do not match</span>
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            isLoading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword
              ? 'bg-gray-400 cursor-not-allowed text-gray-600'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isLoading ? 'Changing Password...' : 'Change Password'}
        </button>
      </form>
    </div>
  )
}

export default ChangePassword 
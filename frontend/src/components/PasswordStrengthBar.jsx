import React from 'react'
import { getPasswordStrength, getPasswordStrengthLabel, getPasswordStrengthColor } from '../utils/passwordUtils.js'

const PasswordStrengthBar = ({ password }) => {
  const strength = getPasswordStrength(password)
  const label = getPasswordStrengthLabel(strength)
  const color = getPasswordStrengthColor(strength)
  
  const getBarWidth = () => {
    return `${(strength / 5) * 100}%`
  }

  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>Password Strength:</span>
        <span style={{ color }} className="font-medium">{label}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="h-2 rounded-full transition-all duration-300"
          style={{ 
            width: getBarWidth(), 
            backgroundColor: color 
          }}
        ></div>
      </div>
      <div className="mt-1 text-xs text-gray-500">
        {strength < 3 && "Password is too weak. Add more complexity."}
        {strength >= 3 && strength < 5 && "Password is acceptable but could be stronger."}
        {strength === 5 && "Excellent password strength!"}
      </div>
    </div>
  )
}

export default PasswordStrengthBar 
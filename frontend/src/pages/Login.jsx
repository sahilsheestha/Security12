import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import PasswordStrengthBar from '../components/PasswordStrengthBar.jsx'
import EmailVerification from '../components/EmailVerification.jsx'
import { validatePasswordComplexity } from '../utils/passwordUtils.js'

const Login = () => {

  const { backendUrl, token, setToken } = useContext(AppContext)
  const navigate = useNavigate()
  const [state, setState] = useState('Sign Up')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showEmailVerification, setShowEmailVerification] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')

  // Real-time password validation
  useEffect(() => {
    if (password && state === 'Sign Up') {
      const validation = validatePasswordComplexity(password, email)
      setPasswordErrors(validation.errors)
    } else {
      setPasswordErrors([])
    }
  }, [password, email, state])

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (state === 'Sign Up') {
        // Validate password before submission
        const validation = validatePasswordComplexity(password, email)
        if (!validation.isValid) {
          toast.error('Please fix password requirements')
          setIsLoading(false)
          return
        }

        const { data } = await axios.post(backendUrl + '/api/user/register', { 
          name, 
          password, 
          email 
        }, {
          withCredentials: true // Enable cookies
        })
        
        if (data.success) {
          if (data.emailVerified === false) {
            // Show email verification
            setRegisteredEmail(email)
            setShowEmailVerification(true)
            toast.success(data.message || 'Account created! Please verify your email.')
          } else {
            // Email already verified or no verification required
            localStorage.setItem('token', data.token)
            localStorage.setItem('sessionId', data.sessionId)
            setToken(data.token)
            toast.success('Account created successfully!')
            navigate('/')
          }
        } else {
          if (data.errors) {
            // Show specific password errors
            data.errors.forEach(error => toast.error(error))
          } else {
            toast.error(data.message)
          }
        }
      } else {
        const { data } = await axios.post(backendUrl + '/api/user/login', { 
          email, 
          password 
        }, {
          withCredentials: true // Enable cookies
        })
        
        if (data.success) {
          localStorage.setItem('token', data.token)
          localStorage.setItem('sessionId', data.sessionId)
          setToken(data.token)
          
          if (data.emailVerified === false) {
            // Show email verification
            setRegisteredEmail(email)
            setShowEmailVerification(true)
            toast.info('Please verify your email address')
          } else {
            toast.success('Login successful!')
            navigate('/')
          }
        } else {
          toast.error(data.message)
        }
      }

    } catch (error) {
      console.error('Auth error:', error)
      toast.error(error.response?.data?.message || error.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerificationSuccess = () => {
    setShowEmailVerification(false)
    navigate('/')
  }

  useEffect(() => {
    if (token && !showEmailVerification) {
      navigate('/')
    }
  }, [token, showEmailVerification])

  // Show email verification component
  if (showEmailVerification) {
    return (
      <div className='min-h-[80vh] flex items-center'>
        <EmailVerification 
          email={registeredEmail} 
          onVerificationSuccess={handleVerificationSuccess}
        />
      </div>
    )
  }

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg'>
        <p className='text-2xl font-semibold'>{state === 'Sign Up' ? 'Create Account' : 'Login'}</p>
        <p>Please {state === 'Sign Up' ? 'sign up' : 'log in'} to book appointment</p>

        {
          state === 'Sign Up' && (
            <div className='w-full'>
              <p>Full Name</p>
              <input 
                className='border border-zinc-300 rounded w-full p-2 mt-1' 
                type="text" 
                onChange={(e) => setName(e.target.value)} 
                value={name} 
                required 
              />
            </div>
          )
        }

        <div className='w-full'>
          <p>Email</p>
          <input 
            className='border border-zinc-300 rounded w-full p-2 mt-1' 
            type="email" 
            onChange={(e) => setEmail(e.target.value)} 
            value={email} 
            required 
          />
        </div>

        <div className='w-full'>
          <p>Password</p>
          <div className='relative'>
            <input 
              className='border border-zinc-300 rounded w-full p-2 mt-1 pr-10' 
              type={showPassword ? "text" : "password"} 
              onChange={(e) => setPassword(e.target.value)} 
              value={password} 
              required 
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          
          {/* Password strength bar for sign up */}
          {state === 'Sign Up' && password && (
            <PasswordStrengthBar password={password} />
          )}
          
          {/* Password requirements for sign up */}
          {state === 'Sign Up' && password && passwordErrors.length > 0 && (
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

        <button 
          type='submit' 
          className={`w-full py-2 rounded-md text-base transition-colors ${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-primary hover:bg-primary/90 text-white'
          }`}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : (state === 'Sign Up' ? 'Create Account' : 'Login')}
        </button>

        {
          state === 'Sign Up'
            ? <p>Already have an account? <span onClick={() => setState('Login')} className='text-primary underline cursor-pointer'>Login here</span></p>
            : <p>Create an new accout? <span onClick={() => setState('Sign Up')} className='text-primary underline cursor-pointer'>click here</span></p>
        }
      </div>
    </form>
  )
}

export default Login
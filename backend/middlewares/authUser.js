import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'

// Enhanced user authentication middleware
const authUser = async (req, res, next) => {

  try {
    let userId = null
    let sessionId = null

    // First try to get user from session (primary method)
    if (req.session && req.session.userId) {
      userId = req.session.userId
      sessionId = req.session.sessionId
    } else {
      // Fallback to JWT token (if cookies don't work)
      const { token } = req.headers
      if (!token) {
        return res.json({ success: false, message: 'Not Authorized Login Again' })
      }

      try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET)
        userId = token_decode.id
        sessionId = token_decode.sessionId
      } catch (jwtError) {
        return res.json({ success: false, message: 'Invalid or expired token' })
      }
    }

    // Verify user exists and session is valid
    const user = await userModel.findById(userId)
    if (!user) {
      return res.json({ success: false, message: 'User not found' })
    }

    // Check if session exists in user's active sessions
    if (sessionId) {
      const activeSession = user.activeSessions.find(session => 
        session.sessionId === sessionId && 
        session.expiresAt > new Date()
      )

      if (!activeSession) {
        return res.json({ success: false, message: 'Session expired or invalid' })
      }
    }

    // Check if account is locked
    if (user.accountLocked && user.lockoutUntil && new Date() < user.lockoutUntil) {
      return res.json({ 
        success: false, 
        message: `Account is locked until ${user.lockoutUntil.toLocaleString()}` 
      })
    }

    req.body.userId = userId
    req.body.sessionId = sessionId
    req.user = user

    next()

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }

}

export default authUser
import express from 'express'
import cors from 'cors'
import session from 'express-session'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import csrf from 'csurf'
import https from 'https'
import fs from 'fs'
import path from 'path'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import { sanitizeAll, sanitizeUserInput } from './middlewares/sanitize.js'
import { verifyEmailConfig } from './services/emailService.js'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoute.js'

// app config
const app = express()
const port = process.env.PORT || 4000
const httpsPort = process.env.HTTPS_PORT || 4001

connectDB()
connectCloudinary()

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api/', limiter)

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: 'strict'
  },
  name: 'sessionId' // Change default session name for security
}))

// CSRF protection
const csrfProtection = csrf({ cookie: true })

// middlewares
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token', 'XSRF-TOKEN']
}))

// Input sanitization
app.use(sanitizeAll)

// api end point
app.use('/api/admin', adminRouter)
app.use('/api/doctor', doctorRouter)
app.use('/api/user', userRouter)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

app.get('/', (req, res) => {
  res.send('Api working...')
})

// Start HTTP server
app.listen(port, () => {
  console.log(`🚀 HTTP Server started on port ${port}`)
})

// HTTPS Server Configuration
const startHTTPSServer = () => {
  try {
    const certPath = path.join(process.cwd(), 'certs')
    const privateKey = fs.readFileSync(path.join(certPath, 'private-key.pem'), 'utf8')
    const certificate = fs.readFileSync(path.join(certPath, 'certificate.pem'), 'utf8')

    const credentials = {
      key: privateKey,
      cert: certificate
    }

    const httpsServer = https.createServer(credentials, app)

    httpsServer.listen(httpsPort, () => {
      console.log(`🔒 HTTPS Server started on port ${httpsPort}`)
      console.log(`📝 You can access the API at: https://localhost:${httpsPort}`)
    })

  } catch (error) {
    console.log('⚠️  HTTPS server not started - SSL certificates not found')
    console.log('💡 Run "node generate-ssl.js" to generate SSL certificates')
    console.log('📝 HTTP server is still running for development')
  }
}

// Verify email configuration
const verifyEmail = async () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    const emailVerified = await verifyEmailConfig()
    if (emailVerified) {
      console.log('✅ Email service configured successfully')
    } else {
      console.log('⚠️  Email service not configured properly')
    }
  } else {
    console.log('⚠️  Email credentials not provided - email verification disabled')
  }
}

// Start HTTPS server if certificates exist
startHTTPSServer()

// Verify email configuration
verifyEmail() 
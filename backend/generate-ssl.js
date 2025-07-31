import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const generateSSLCertificates = () => {
  const certsDir = './certs'
  
  // Create certificates directory if it doesn't exist
  if (!fs.existsSync(certsDir)) {
    fs.mkdirSync(certsDir)
  }

  try {
    console.log('🔐 Generating SSL certificates...')
    
    // Generate private key
    execSync(`openssl genrsa -out ${certsDir}/private-key.pem 2048`, { stdio: 'inherit' })
    console.log('✅ Private key generated')
    
    // Generate certificate signing request
    execSync(`openssl req -new -key ${certsDir}/private-key.pem -out ${certsDir}/certificate.csr -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"`, { stdio: 'inherit' })
    console.log('✅ Certificate signing request generated')
    
    // Generate self-signed certificate
    execSync(`openssl x509 -req -in ${certsDir}/certificate.csr -signkey ${certsDir}/private-key.pem -out ${certsDir}/certificate.pem -days 365`, { stdio: 'inherit' })
    console.log('✅ Self-signed certificate generated')
    
    console.log('🎉 SSL certificates generated successfully!')
    console.log('📁 Certificates saved in:', path.resolve(certsDir))
    
  } catch (error) {
    console.error('❌ Error generating SSL certificates:', error.message)
    console.log('💡 Make sure OpenSSL is installed on your system')
    console.log('   Windows: Download from https://slproweb.com/products/Win32OpenSSL.html')
    console.log('   macOS: brew install openssl')
    console.log('   Linux: sudo apt-get install openssl')
  }
}

generateSSLCertificates() 
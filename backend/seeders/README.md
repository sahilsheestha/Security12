# Database Seeders

This directory contains seeders to populate your database with sample data for testing and development.

## Available Seeders

### 1. User Seeder (`userSeeder.js`)
Creates 8 sample users with realistic data:
- Names, emails, and profile images
- Addresses, gender, date of birth, and phone numbers
- Passwords are hashed using bcrypt

### 2. Doctor Seeder (`doctorSeeder.js`)
Creates 8 sample doctors with different specialities:
- **Dr. Sarah Johnson** - Cardiologist ($1200)
- **Dr. Michael Chen** - Neurologist ($1500)
- **Dr. Emily Rodriguez** - Dermatologist ($800)
- **Dr. James Wilson** - Orthopedic Surgeon ($2000)
- **Dr. Lisa Thompson** - Pediatrician ($600)
- **Dr. Robert Kim** - Gastroenterologist ($1100)
- **Dr. Amanda Davis** - Gynecologist ($900)
- **Dr. David Martinez** - General Physician ($500)

Each doctor includes:
- Professional credentials and experience
- Detailed about sections
- Office addresses
- Profile images

### 3. Appointment Seeder (`appointmentSeeder.js`)
Creates sample appointments between users and doctors:
- Appointments for the next 30 days (excluding weekends)
- 2-4 appointments per day
- Random time slots (9 AM - 5 PM)
- Realistic payment and completion statuses
- 70% payment completed, 10% cancelled

## How to Run

### Run All Seeders
```bash
npm run seed
```

### Run Individual Seeders
```bash
# Seed only users
npm run seed:users

# Seed only doctors
npm run seed:doctors

# Seed only appointments (requires users and doctors to exist first)
npm run seed:appointments
```

### Run Directly with Node
```bash
# Run all seeders
node seeders/index.js

# Run individual seeders
node seeders/userSeeder.js
node seeders/doctorSeeder.js
node seeders/appointmentSeeder.js
```

## Prerequisites

1. **Create a `.env` file** in the backend directory with your MongoDB connection:
   ```bash
   # Copy the example file
   cp env.example .env
   
   # Edit the .env file with your MongoDB connection string
   MONGODB_URI=mongodb://localhost:27017
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Make sure MongoDB is running** on your system or use a cloud MongoDB service.

## Environment Variables

The seeders use the same environment variables as your main application:

- `MONGODB_URI` - Your MongoDB connection string
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name (for image uploads)
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `JWT_SECRET` - Secret key for JWT tokens

## Sample Data Details

### Users
- **Login Credentials**: All users have password `password123`
- **Emails**: `name@email.com` format
- **Images**: Professional profile photos from Unsplash

### Doctors
- **Login Credentials**: All doctors have password `password123`
- **Emails**: `name@medicare.com` format
- **Specialities**: Cover major medical fields
- **Fees**: Range from $500 to $2000 based on speciality

### Appointments
- **Time Slots**: 9 AM, 10 AM, 11 AM, 12 PM, 2 PM, 3 PM, 4 PM, 5 PM
- **Duration**: Next 30 days (weekdays only)
- **Status**: Mix of completed, pending, and cancelled appointments

## Notes

- Seeders will clear existing data before inserting new data
- Appointments seeder requires users and doctors to exist first
- All passwords are hashed using bcrypt with salt rounds of 10
- Images are from Unsplash and are optimized for web use
- Data is realistic but fictional - suitable for development and testing

## Troubleshooting

If you encounter errors:

1. **Check your MongoDB connection string** in `.env` file
2. **Ensure all dependencies are installed**: `npm install`
3. **Make sure MongoDB is running** locally or your cloud MongoDB is accessible
4. **Run seeders in order**: users → doctors → appointments
5. **Check console output** for specific error messages

### Common Issues:

- **"Cannot read property 'MONGODB_URI' of undefined"**: Create a `.env` file with your MongoDB connection string
- **"MongoServerSelectionError"**: Make sure MongoDB is running or your connection string is correct
- **"Module not found"**: Run `npm install` to install dependencies
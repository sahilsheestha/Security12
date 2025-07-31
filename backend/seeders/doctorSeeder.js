import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import doctorModel from "../models/doctorModel.js";

dotenv.config();

const doctors = [
  {
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@medicare.com",
    password: "password123",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop",
    speciality: "Cardiologist",
    degree: "MBBS, MD - Cardiology",
    experience: "15 years",
    about: "Experienced cardiologist specializing in interventional cardiology and heart failure management. Committed to providing comprehensive cardiac care with the latest medical advancements.",
    available: true,
    fees: 1200,
    address: {
      line1: "123 Medical Center Dr",
      line2: "Suite 200, Cardiology Wing",
      city: "New York",
      state: "NY",
      pincode: "10001"
    },
    date: Date.now(),
    slots_booked: {}
  },
  {
    name: "Dr. Michael Chen",
    email: "michael.chen@medicare.com",
    password: "password123",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop",
    speciality: "Neurologist",
    degree: "MBBS, MD - Neurology",
    experience: "12 years",
    about: "Board-certified neurologist with expertise in stroke treatment, epilepsy, and movement disorders. Focused on personalized neurological care and treatment plans.",
    available: true,
    fees: 1500,
    address: {
      line1: "456 Neurology Clinic",
      line2: "Floor 3, Brain & Spine Center",
      city: "Los Angeles",
      state: "CA",
      pincode: "90210"
    },
    date: Date.now(),
    slots_booked: {}
  },
  {
    name: "Dr. Emily Rodriguez",
    email: "emily.rodriguez@medicare.com",
    password: "password123",
    image: "https://images.unsplash.com/photo-1594824475544-9d2c0c0c0c0c?w=400&h=400&fit=crop",
    speciality: "Dermatologist",
    degree: "MBBS, MD - Dermatology",
    experience: "8 years",
    about: "Specialized in cosmetic dermatology, skin cancer screening, and treatment of various skin conditions. Committed to helping patients achieve healthy, beautiful skin.",
    available: true,
    fees: 800,
    address: {
      line1: "789 Skin Care Center",
      line2: "Suite 150, Dermatology Clinic",
      city: "Chicago",
      state: "IL",
      pincode: "60601"
    },
    date: Date.now(),
    slots_booked: {}
  },
  {
    name: "Dr. James Wilson",
    email: "james.wilson@medicare.com",
    password: "password123",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop",
    speciality: "Orthopedic Surgeon",
    degree: "MBBS, MS - Orthopedics",
    experience: "18 years",
    about: "Expert in joint replacement, sports medicine, and orthopedic trauma. Specializes in minimally invasive surgical techniques for faster recovery.",
    available: true,
    fees: 2000,
    address: {
      line1: "321 Orthopedic Institute",
      line2: "Building A, Surgical Center",
      city: "Houston",
      state: "TX",
      pincode: "77001"
    },
    date: Date.now(),
    slots_booked: {}
  },
  {
    name: "Dr. Lisa Thompson",
    email: "lisa.thompson@medicare.com",
    password: "password123",
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop",
    speciality: "Pediatrician",
    degree: "MBBS, MD - Pediatrics",
    experience: "10 years",
    about: "Dedicated pediatrician providing comprehensive care for children from birth through adolescence. Specializes in developmental pediatrics and preventive care.",
    available: true,
    fees: 600,
    address: {
      line1: "654 Children's Medical Center",
      line2: "Pediatric Wing, Floor 2",
      city: "Phoenix",
      state: "AZ",
      pincode: "85001"
    },
    date: Date.now(),
    slots_booked: {}
  },
  {
    name: "Dr. Robert Kim",
    email: "robert.kim@medicare.com",
    password: "password123",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop",
    speciality: "Gastroenterologist",
    degree: "MBBS, MD - Gastroenterology",
    experience: "14 years",
    about: "Specializes in digestive system disorders, endoscopy procedures, and liver disease management. Committed to improving patients' digestive health and quality of life.",
    available: true,
    fees: 1100,
    address: {
      line1: "987 Digestive Health Center",
      line2: "Suite 300, GI Department",
      city: "Philadelphia",
      state: "PA",
      pincode: "19101"
    },
    date: Date.now(),
    slots_booked: {}
  },
  {
    name: "Dr. Amanda Davis",
    email: "amanda.davis@medicare.com",
    password: "password123",
    image: "https://images.unsplash.com/photo-1594824475544-9d2c0c0c0c0c?w=400&h=400&fit=crop",
    speciality: "Gynecologist",
    degree: "MBBS, MD - Obstetrics & Gynecology",
    experience: "11 years",
    about: "Comprehensive women's health care including prenatal care, gynecological surgery, and reproductive health. Focused on providing compassionate care for women at every stage of life.",
    available: true,
    fees: 900,
    address: {
      line1: "147 Women's Health Clinic",
      line2: "Obstetrics & Gynecology Center",
      city: "San Antonio",
      state: "TX",
      pincode: "78201"
    },
    date: Date.now(),
    slots_booked: {}
  },
  {
    name: "Dr. David Martinez",
    email: "david.martinez@medicare.com",
    password: "password123",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop",
    speciality: "General Physician",
    degree: "MBBS, MD - Internal Medicine",
    experience: "9 years",
    about: "Primary care physician providing comprehensive medical care for adults. Specializes in preventive medicine, chronic disease management, and health maintenance.",
    available: true,
    fees: 500,
    address: {
      line1: "258 Primary Care Center",
      line2: "Family Medicine Department",
      city: "San Diego",
      state: "CA",
      pincode: "92101"
    },
    date: Date.now(),
    slots_booked: {}
  }
];

const seedDoctors = async () => {
  try {
    console.log("🔍 Connecting to MongoDB...");
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");
    
    console.log("🗑️ Clearing existing doctors...");
    const deleteResult = await doctorModel.deleteMany({});
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing doctors`);

    console.log("📝 Inserting doctors...");
    
    for (let i = 0; i < doctors.length; i++) {
      const doctor = doctors[i];
      console.log(`👨‍⚕️ Processing doctor ${i + 1}/${doctors.length}: ${doctor.name}`);
      
      const hashedPassword = await bcrypt.hash(doctor.password, 10);
      const doctorWithHash = {
        ...doctor,
        password: hashedPassword
      };
      
      await doctorModel.create(doctorWithHash);
      console.log(`✅ Created doctor: ${doctor.name} (${doctor.speciality})`);
    }
    
    console.log(`🎉 Successfully created ${doctors.length} doctors!`);
    
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
    
    return doctors.length;
  } catch (error) {
    console.error("❌ Error seeding doctors:", error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    throw error;
  }
};

// Run seeder if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  console.log("🚀 Starting doctor seeder...");
  seedDoctors().then((count) => {
    console.log(`🎉 Doctor seeder completed! Created ${count} doctors.`);
    process.exit(0);
  }).catch((error) => {
    console.error("💥 Doctor seeder failed:", error);
    process.exit(1);
  });
}

export default seedDoctors;
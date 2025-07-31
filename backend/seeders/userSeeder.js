import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import userModel from "../models/userModel.js";

dotenv.config();

const users = [
  {
    name: "John Smith",
    email: "john.smith@email.com",
    password: "password123",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    address: {
      line1: "123 Main Street",
      line2: "Apt 4B"
    },
    gender: "Male",
    dob: "1985-03-15",
    phone: "555-0101"
  },
  {
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    password: "password123",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop",
    address: {
      line1: "456 Oak Avenue",
      line2: "Unit 7C"
    },
    gender: "Female",
    dob: "1990-07-22",
    phone: "555-0102"
  },
  {
    name: "Michael Chen",
    email: "michael.chen@email.com",
    password: "password123",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    address: {
      line1: "789 Pine Street",
      line2: "Suite 12"
    },
    gender: "Male",
    dob: "1988-11-08",
    phone: "555-0103"
  },
  {
    name: "Emily Rodriguez",
    email: "emily.rodriguez@email.com",
    password: "password123",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    address: {
      line1: "321 Elm Drive",
      line2: "Apt 2A"
    },
    gender: "Female",
    dob: "1992-04-30",
    phone: "555-0104"
  },
  {
    name: "David Wilson",
    email: "david.wilson@email.com",
    password: "password123",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    address: {
      line1: "654 Maple Road",
      line2: "Unit 5B"
    },
    gender: "Male",
    dob: "1983-09-14",
    phone: "555-0105"
  },
  {
    name: "Lisa Thompson",
    email: "lisa.thompson@email.com",
    password: "password123",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    address: {
      line1: "987 Cedar Lane",
      line2: "Apt 8D"
    },
    gender: "Female",
    dob: "1987-12-03",
    phone: "555-0106"
  },
  {
    name: "Robert Kim",
    email: "robert.kim@email.com",
    password: "password123",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
    address: {
      line1: "147 Birch Street",
      line2: "Suite 3C"
    },
    gender: "Male",
    dob: "1991-06-18",
    phone: "555-0107"
  },
  {
    name: "Amanda Davis",
    email: "amanda.davis@email.com",
    password: "password123",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
    address: {
      line1: "258 Willow Way",
      line2: "Unit 6A"
    },
    gender: "Female",
    dob: "1989-01-25",
    phone: "555-0108"
  }
];

const seedUsers = async () => {
  try {
    console.log("🔍 Connecting to MongoDB...");
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");
    
    console.log("🗑️ Clearing existing users...");
    const deleteResult = await userModel.deleteMany({});
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing users`);

    console.log("📝 Inserting users...");
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`👤 Processing user ${i + 1}/${users.length}: ${user.name}`);
      
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const userWithHash = {
        ...user,
        password: hashedPassword
      };
      
      await userModel.create(userWithHash);
      console.log(`✅ Created user: ${user.name}`);
    }
    
    console.log(`🎉 Successfully created ${users.length} users!`);
    
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
    
    return users.length;
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    throw error;
  }
};

// Run seeder if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  console.log("🚀 Starting user seeder...");
  seedUsers().then((count) => {
    console.log(`🎉 User seeder completed! Created ${count} users.`);
    process.exit(0);
  }).catch((error) => {
    console.error("💥 User seeder failed:", error);
    process.exit(1);
  });
}

export default seedUsers;
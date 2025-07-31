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
    
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

console.log("🚀 Starting simple user seeder...");
seedUsers().then(() => {
  console.log("🎉 Simple user seeder completed!");
  process.exit(0);
}).catch((error) => {
  console.error("💥 Simple user seeder failed:", error);
  process.exit(1);
});
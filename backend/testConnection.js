import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const testConnection = async () => {
  try {
    console.log("🔍 Testing MongoDB connection...");
    console.log("Connection string:", process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connection successful!");
    
    // Test if we can access the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("📊 Available collections:", collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log("✅ Connection test completed successfully!");
    
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

testConnection();
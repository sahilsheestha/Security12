import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

console.log("🚀 Simple seeder starting...");
console.log("Environment check:", {
  MONGODB_URI: process.env.MONGODB_URI ? "✅ Set" : "❌ Missing",
  NODE_ENV: process.env.NODE_ENV || "development"
});

const testSeeder = async () => {
  try {
    console.log("🔍 Connecting to MongoDB...");
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB!");
    
    // Test basic database operations
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("📊 Collections found:", collections.map(c => c.name));
    
    // Test inserting a simple document
    const testCollection = db.collection('test');
    const result = await testCollection.insertOne({
      message: "Test document",
      timestamp: new Date()
    });
    console.log("✅ Test document inserted:", result.insertedId);
    
    // Clean up
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log("🗑️ Test document cleaned up");
    
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
    console.log("🎉 Simple seeder completed successfully!");
    
  } catch (error) {
    console.error("❌ Error in simple seeder:", error);
    process.exit(1);
  }
};

testSeeder();
import mongoose from "mongoose";
import dotenv from "dotenv";
import seedUsers from "./userSeeder.js";
import seedDoctors from "./doctorSeeder.js";
import generateAppointments from "./appointmentSeeder.js";

dotenv.config();

const runAllSeeders = async () => {
  try {
    console.log("🌱 Starting database seeding...\n");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB\n");

    // Run seeders in order
    console.log("1️⃣ Seeding users...");
    await seedUsers();
    console.log("✅ Users seeded!\n");

    console.log("2️⃣ Seeding doctors...");
    await seedDoctors();
    console.log("✅ Doctors seeded!\n");

    console.log("3️⃣ Seeding appointments...");
    await generateAppointments();
    console.log("✅ Appointments seeded!\n");

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("🎉 All seeders completed successfully!");
    console.log("📊 Database now contains:");
    console.log("   - 8 sample users");
    console.log("   - 8 sample doctors");
    console.log("   - Multiple sample appointments");
    console.log("\n🚀 You can now start your application!");

  } catch (error) {
    console.error("❌ Error running seeders:", error);
    process.exit(1);
  }
};

// Run all seeders if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  runAllSeeders();
}

export default runAllSeeders;
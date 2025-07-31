import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

console.log("🌱 Starting database seeding...\n");

const runAllSeeders = async () => {
  try {
    console.log("🔍 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Import and run seeders one by one
    console.log("1️⃣ Seeding users...");
    const { default: seedUsers } = await import('./userSeeder.js');
    await seedUsers();
    console.log("✅ Users seeded!\n");

    console.log("2️⃣ Seeding doctors...");
    const { default: seedDoctors } = await import('./doctorSeeder.js');
    await seedDoctors();
    console.log("✅ Doctors seeded!\n");

    console.log("3️⃣ Seeding appointments...");
    const { default: generateAppointments } = await import('./appointmentSeeder.js');
    await generateAppointments();
    console.log("✅ Appointments seeded!\n");

    await mongoose.disconnect();
    console.log("🎉 All seeders completed successfully!");
    console.log("📊 Database now contains:");
    console.log("   - 8 sample users");
    console.log("   - 8 sample doctors");
    console.log("   - Multiple sample appointments");
    console.log("\n🚀 You can now start your application!");

  } catch (error) {
    console.error("❌ Error running seeders:", error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

runAllSeeders().then(() => {
  console.log("🎉 Seeding process completed!");
  process.exit(0);
}).catch((error) => {
  console.error("💥 Seeding process failed:", error);
  process.exit(1);
});
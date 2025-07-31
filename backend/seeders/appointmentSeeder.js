import mongoose from "mongoose";
import dotenv from "dotenv";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";

dotenv.config();

const generateAppointments = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get all users and doctors
    const users = await userModel.find({});
    const doctors = await doctorModel.find({});

    if (users.length === 0 || doctors.length === 0) {
      console.log("Please run user and doctor seeders first!");
      await mongoose.disconnect();
      return;
    }

    // Clear existing appointments
    await appointmentModel.deleteMany({});
    console.log("Cleared existing appointments");

    const appointments = [];
    const timeSlots = [
      "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
      "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
    ];

    // Generate appointments for the next 30 days
    for (let i = 0; i < 30; i++) {
      const appointmentDate = new Date();
      appointmentDate.setDate(appointmentDate.getDate() + i);
      
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (appointmentDate.getDay() === 0 || appointmentDate.getDay() === 6) {
        continue;
      }

      const dateString = appointmentDate.toISOString().split('T')[0];
      
      // Create 2-4 appointments per day
      const appointmentsPerDay = Math.floor(Math.random() * 3) + 2;
      
      for (let j = 0; j < appointmentsPerDay; j++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomDoctor = doctors[Math.floor(Math.random() * doctors.length)];
        const randomTimeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
        
        // Randomize payment and completion status
        const isPaymentCompleted = Math.random() > 0.3; // 70% payment completed
        const isCompleted = appointmentDate < new Date() && isPaymentCompleted;
        const isCancelled = Math.random() > 0.9; // 10% cancelled

        const appointment = {
          userId: randomUser._id.toString(),
          docId: randomDoctor._id.toString(),
          slotDate: dateString,
          slotTime: randomTimeSlot,
          userData: {
            name: randomUser.name,
            email: randomUser.email,
            image: randomUser.image,
            address: randomUser.address,
            gender: randomUser.gender,
            dob: randomUser.dob,
            phone: randomUser.phone
          },
          docData: {
            name: randomDoctor.name,
            email: randomDoctor.email,
            image: randomDoctor.image,
            speciality: randomDoctor.speciality,
            degree: randomDoctor.degree,
            experience: randomDoctor.experience,
            about: randomDoctor.about,
            fees: randomDoctor.fees,
            address: randomDoctor.address
          },
          amount: randomDoctor.fees,
          date: appointmentDate.getTime(),
          cancelled: isCancelled,
          payment: isPaymentCompleted,
          isCompleted: isCompleted
        };

        appointments.push(appointment);
      }
    }

    await appointmentModel.insertMany(appointments);
    console.log(`✅ ${appointments.length} appointments seeded successfully!`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error seeding appointments:", error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  generateAppointments();
}

export default generateAppointments;
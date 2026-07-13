import mongoose from "mongoose";
import Booking from "./models/Booking.models.js";
import MoveGroup from "./models/MoveGroup.models.js";
import { config, requireEnv } from "./config/env.js";

const connectDB = async () => {
  try {
    await mongoose.connect(requireEnv(config.mongodbUrl, "MONGODB_URL"));
    console.log("🚀 Connected to MongoDB Atlas.");
  } catch (err) {
    console.error("❌ Database connection error:", err.message);
    process.exit(1);
  }
};

const seedData = async () => {
  await connectDB();

  console.log("🧹 Removing mock/demo bookings...");
  const groupDeleteResult = await MoveGroup.deleteMany({});
  console.log(`✅ Deleted ${groupDeleteResult.deletedCount} move groups.`);

  const deleteResult = await Booking.deleteMany({});
  console.log(`✅ Deleted ${deleteResult.deletedCount} old bookings.`);

  console.log("📦 Creating the first booking record...");
  const firstBooking = new Booking({
    status: "collect_item",
    sender_name: "Ahmed Ali",
    sender_mobile: "+966551234567",
    sender_email: "ahmed.ali@example.com",
    sender_iqama: "2345678901",
    sender_passport: "KSA123456",
    pickup_city: "Riyadh",
    pickup_address: "Olaya Street, Block 12",
    collection_date: new Date(),

    receiver_name: "Sunil Fernando",
    receiver_mobile: "+94771234567",
    receiver_email: "sunil.f@example.lk",
    delivery_city: "Colombo",
    receiver_address: "12 Galle Road, Bambalapitiya",

    cargo_type: "air",
    delivery_service: "door_to_door",
    packaging_type: "carton_box",
    package_description: "Electronics and personal items",
    special_instructions: "Handle with care",
    insurance: true,

    payment_status: "paid",
    payment_amount: 450,
    branch: "Riyadh Office",
    sales_person_id: "Ahmed Al-Rashid",
  });

  try {
    const saved = await firstBooking.save();
    console.log(`✅ First booking created: ${saved.tracking_number}`);
  } catch (err) {
    console.error("❌ Error saving first booking:", err.message);
  }

  await mongoose.disconnect();
  console.log("🔌 Database connection closed.");
};

seedData();

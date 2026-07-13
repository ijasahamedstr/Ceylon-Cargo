import mongoose from "mongoose";
import Booking from "../models/Booking.models.js";
import { config, requireEnv } from "../config/env.js";

async function seed() {
  await mongoose.connect(requireEnv(config.mongodbUrl, "MONGODB_URL"));
  console.log("Connected to MongoDB");

  const removed = await Booking.deleteMany({ tracking_number: { $regex: /^CCS-SAMPLE-/ } });
  console.log(`Removed ${removed.deletedCount} old sample booking(s)`);

  const firstBooking = new Booking({
    status: "collect_item",
    sender_name: "Ahmed Al-Rashid",
    sender_mobile: "+966501234567",
    sender_email: "ahmed.rashid@example.com",
    sender_iqama: "2123456789",
    pickup_city: "Riyadh",
    pickup_address: "King Fahd Road, Building 12, Apt 4",
    collection_date: new Date(),

    receiver_name: "Nimal Perera",
    receiver_mobile: "+94771234567",
    receiver_email: "nimal.p@example.com",
    delivery_city: "Colombo",
    receiver_address: "45 Galle Road, Mount Lavinia",

    cargo_type: "air",
    delivery_service: "door_to_door",
    packaging_type: "carton_box",
    package_description: "Electronics (2 pcs), Clothing (5 kg)",
    special_instructions: "Handle with care",
    insurance: true,

    payment_status: "paid",
    payment_amount: 450,
    branch: "Riyadh Office",
    sales_person_id: "Ahmed Al-Rashid",
  });

  try {
    const saved = await firstBooking.save();
    console.log(`Created first booking: ${saved.tracking_number}`);
  } catch (err) {
    console.error("Failed to create first booking:", err.message);
  }

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});

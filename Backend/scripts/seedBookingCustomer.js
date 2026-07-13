import mongoose from "mongoose";
import Booking from "../models/Booking.models.js";
import MoveGroup from "../models/MoveGroup.models.js";
import { config, requireEnv } from "../config/env.js";

async function seed() {
  await mongoose.connect(requireEnv(config.mongodbUrl, "MONGODB_URL"));
  console.log("Connected to MongoDB");

  const groupsRemoved = await MoveGroup.deleteMany({});
  console.log(`Removed ${groupsRemoved.deletedCount} existing move groups.`);

  const removed = await Booking.deleteMany({});
  console.log(`Removed ${removed.deletedCount} existing bookings.`);

  const sampleBookings = [
    {
      tracking_number: "CCS-BC-001",
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
      receiver_email: "nimal.p@example.lk",
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
    },
    {
      tracking_number: "CCS-BC-002",
      status: "collect_item",
      sender_name: "Fatima Hassan",
      sender_mobile: "+966502345678",
      sender_email: "fatima.hassan@example.com",
      sender_iqama: "2234567890",
      pickup_city: "Jeddah",
      pickup_address: "Al Hamra District, Villa 8",
      collection_date: new Date(Date.now() - 1000 * 60 * 60 * 4),
      receiver_name: "Kamal Silva",
      receiver_mobile: "+94772345678",
      receiver_email: "kamal.silva@example.lk",
      delivery_city: "Kandy",
      receiver_address: "12 Peradeniya Road, Kandy",
      cargo_type: "sea",
      delivery_service: "self_clearance",
      packaging_type: "wooden_box",
      package_description: "Household items (1 box), Kitchenware (15 kg)",
      insurance: false,
      payment_status: "partial",
      payment_amount: 320,
      branch: "Jeddah Office",
      sales_person_id: "Fatima Ali",
    },
    {
      tracking_number: "CCS-BC-003",
      status: "collect_item",
      sender_name: "Omar Al-Saud",
      sender_mobile: "+966504567890",
      sender_email: "omar.alsaud@example.com",
      sender_iqama: "2456789012",
      pickup_city: "Riyadh",
      pickup_address: "Olaya Street, Office Tower 3",
      collection_date: new Date(Date.now() - 1000 * 60 * 60 * 8),
      receiver_name: "Priya Jayawardena",
      receiver_mobile: "+94774567890",
      receiver_email: "priya.jaya@example.lk",
      delivery_city: "Negombo",
      receiver_address: "22 Beach Road, Negombo",
      cargo_type: "sea",
      delivery_service: "door_to_door",
      packaging_type: "wooden_box",
      package_description: "Furniture parts (2 boxes), Tools (20 kg)",
      insurance: true,
      payment_status: "unpaid",
      payment_amount: 890,
      branch: "Riyadh Office",
      sales_person_id: "System Administrator",
    },
    {
      tracking_number: "CCS-BC-004",
      status: "collect_item",
      sender_name: "Khalid Ibrahim",
      sender_mobile: "+966505678901",
      sender_email: "khalid.ibrahim@example.com",
      sender_iqama: "2567890123",
      pickup_city: "Jeddah",
      pickup_address: "Al Rawdah, Warehouse Gate 2",
      collection_date: new Date(Date.now() - 1000 * 60 * 60 * 12),
      receiver_name: "Ruwan Bandara",
      receiver_mobile: "+94775678901",
      receiver_email: "ruwan.bandara@example.lk",
      delivery_city: "Matara",
      receiver_address: "9 Station Road, Matara",
      cargo_type: "sea",
      delivery_service: "door_to_door",
      packaging_type: "wooden_box",
      package_description: "Dry Food (10 kg), Spices (5 kg)",
      insurance: false,
      payment_status: "paid",
      payment_amount: 275,
      branch: "Jeddah Office",
      sales_person_id: "Ahmed Al-Rashid",
    },
    {
      tracking_number: "CCS-BC-005",
      status: "collect_item",
      sender_name: "Yusuf Ali",
      sender_mobile: "+966506789012",
      sender_email: "yusuf.ali@example.com",
      sender_iqama: "2678901234",
      pickup_city: "Dammam",
      pickup_address: "Industrial Area, Unit 15",
      collection_date: new Date(Date.now() - 1000 * 60 * 60 * 18),
      receiver_name: "Anjali Wickramasinghe",
      receiver_mobile: "+94776789012",
      receiver_email: "anjali.w@example.lk",
      delivery_city: "Jaffna",
      receiver_address: "34 Hospital Road, Jaffna",
      cargo_type: "air",
      delivery_service: "door_to_door",
      packaging_type: "carton_box",
      package_description: "Medicine supplies (2 kg), Personal effects",
      insurance: true,
      payment_status: "paid",
      payment_amount: 520,
      branch: "Dammam Office",
      sales_person_id: "Fatima Ali",
    },
  ];

  for (const data of sampleBookings) {
    const booking = new Booking(data);
    await booking.save();
    console.log(`Created sample booking customer: ${booking.tracking_number}`);
  }

  console.log(`\nDone! ${sampleBookings.length} Booking Customer test bookings created.`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});

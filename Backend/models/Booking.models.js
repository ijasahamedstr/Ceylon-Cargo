import mongoose from "mongoose";
import QRCode from "qrcode"; 

const bookingSchema = new mongoose.Schema({
  tracking_number: { type: String, unique: true },
  status: { 
    type: String, 
    // Standardized to snake_case to match incoming API data and prevent spacing/casing errors
    enum: [
      "draft", 
      "collect_item", 
      "move_to_warehouse_sa", 
      "loading_box", 
      "shipment_manifest",
      "arrived_warehouse_sl",
      "delivered", 
      "cancelled"
    ], 
    default: "draft" 
  },

  // --- NEW FIELDS: Status Tracking ---
  // Tracks every time the status changes with a timestamp
  status_history: [{
    status: { type: String, required: true },
    updated_at: { type: Date, default: Date.now }
  }],

  // Tracks how many times the booking entered a specific status
  status_count: [{
    status: { type: String, required: true },
    count: { type: Number, default: 0 }
  }],
  // -----------------------------------
  
  // Shipper Information
  sender_name: { type: String, required: true },
  sender_mobile: { type: String, required: true },
  sender_email: { type: String },
  sender_iqama: { type: String, required: true },
  sender_passport: { type: String },
  pickup_city: { type: String, required: true },
  pickup_address: { type: String, required: true },
  collection_date: { type: Date },
  
  // Consignee Information
  receiver_name: { type: String, required: true },
  receiver_mobile: { type: String, required: true },
  receiver_email: { type: String },
  delivery_city: { type: String, required: true },
  receiver_address: { type: String, required: true },
  
  // Cargo Details
  cargo_type: { type: String, enum: ["air", "sea"], required: true },
  delivery_service: { type: String, enum: ["door_to_door", "self_clearance"], required: true },
  packaging_type: { type: String },
  special_instructions: { type: String },
  package_description: { type: String, required: true },
  insurance: { type: Boolean, default: false },
  
  // Admin Details
  payment_status: { type: String, enum: ["unpaid", "paid", "partial", "pending"], default: "unpaid" },
  payment_amount: { type: Number, default: 0 },
  branch: { type: String },
  sales_person_id: { type: String },

  qr_code: { type: String } // Stores the Base64 image data for the QR code
}, { 
  timestamps: true 
});

// Auto-generate Tracking Number, QR Code, and Track Status before saving
bookingSchema.pre("save", async function (next) {
  try {
    // 1. Generate Tracking Number if it doesn't exist
    if (!this.tracking_number) {
      const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      this.tracking_number = `CCS-${dateStr}-${randomCode}`;
    }

    // 2. Generate QR Code if it doesn't exist
    if (!this.qr_code) {
      const qrData = this.tracking_number; 
      this.qr_code = await QRCode.toDataURL(qrData); 
    }

    // 3. Update Status History & Count whenever 'status' is created or changed
    if (this.isNew || this.isModified("status")) {
      
      // Add the new status to the history array
      this.status_history.push({
        status: this.status,
        updated_at: new Date()
      });

      // Update the occurrence count for this specific status
      const existingStatusCount = this.status_count.find(s => s.status === this.status);
      if (existingStatusCount) {
        // If the status is already in the count array, increment it
        existingStatusCount.count += 1;
      } else {
        // If it's the first time hitting this status, add it to the count array
        this.status_count.push({
          status: this.status,
          count: 1
        });
      }
    }

    next();
  } catch (error) {
    // Pass any errors to Mongoose
    next(error);
  }
});

export default mongoose.model("Booking", bookingSchema);
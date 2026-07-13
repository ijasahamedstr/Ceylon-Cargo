import mongoose from "mongoose";
import QRCode from "qrcode";

const moveGroupSchema = new mongoose.Schema(
  {
    group_code: { type: String, unique: true },
    from_status: { type: String, required: true },
    to_status: { type: String, required: true },
    from_label: { type: String, default: "" },
    to_label: { type: String, default: "" },
    package_count: { type: Number, required: true, min: 1 },
    booking_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true }],
    qr_code: { type: String },
    notes: { type: String, default: "" },
    moved_by: { type: String, default: "" },
  },
  { timestamps: true }
);

moveGroupSchema.pre("save", async function (next) {
  try {
    if (!this.group_code) {
      const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      this.group_code = `GRP-${dateStr}-${randomCode}`;
    }
    if (!this.qr_code) {
      this.qr_code = await QRCode.toDataURL(this.group_code);
    }
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model("MoveGroup", moveGroupSchema);

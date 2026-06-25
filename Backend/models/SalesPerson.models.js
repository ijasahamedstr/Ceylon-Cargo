import mongoose from "mongoose";

const salesPersonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Sales Agent Name is required"],
      trim: true,
    },
    branch: {
      type: String,
      required: [true, "Branch assignment is required"],
      enum: ["Jeddah Office", "Riyadh Office", "Dammam Office"],
    },
    phone: {
      type: String,
      trim: true,
      default: "+966",
    },
  },
  { timestamps: true }
);

const SalesPerson = mongoose.model("SalesPerson", salesPersonSchema);

export default SalesPerson;
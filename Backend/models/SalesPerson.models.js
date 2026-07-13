import mongoose from 'mongoose';

const salesPersonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    branch: {
      type: String,
      default: 'Jeddah Office',
      trim: true,
    },
    role: {
      type: String,
      default: 'Sales Person',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

export default mongoose.model('SalesPerson', salesPersonSchema);

import mongoose, { Document } from 'mongoose';

interface IOTP extends Document {
  phone: string;
  otp: string;
  isActive: boolean;
  resendCount: number;
  lastResendTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

const otpSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  otp: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  resendCount: { type: Number, default: 0 },
  lastResendTime: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IOTP>('OTP', otpSchema);
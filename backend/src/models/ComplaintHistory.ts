import mongoose, { Document, Schema } from "mongoose";

export interface IComplaintHistory extends Document {
  title: string;
  description: string;
  category: string;
  company: string;
  companyEmail: string;
  contactInfo: {
    name: string;
    email: string;
  };
  status: string;
  createdAt: string;
  date: string;
  referenceNumber: string;
  lastReminderSent: string;
  reminderCount: number;
  nextReminderDate: string;
  userId: mongoose.Types.ObjectId;
}

const complaintHistorySchema = new Schema<IComplaintHistory>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  company: { type: String, required: true },
  companyEmail: { type: String, required: true },
  contactInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
  },
  status: { type: String, required: true },
  createdAt: { type: String, required: true },
  date: { type: String, required: true },
  referenceNumber: { type: String, required: true },
  lastReminderSent: { type: String, required: true },
  reminderCount: { type: Number, required: true },
  nextReminderDate: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

export default mongoose.model<IComplaintHistory>(
  "ComplaintHistory",
  complaintHistorySchema
);

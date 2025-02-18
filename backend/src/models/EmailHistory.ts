import mongoose, { Document, Schema } from 'mongoose';

export interface IEmailHistory extends Document {
  recipientEmail: string;
  subject: string;
  content: string;
  status: 'sent' | 'failed';
  errorMessage?: string;
  complaintId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  type: 'user_confirmation' | 'company_notification';
  sentAt: Date;
}

const emailHistorySchema = new Schema<IEmailHistory>({
  recipientEmail: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['sent', 'failed'],
    required: true,
  },
  errorMessage: {
    type: String,
  },
  complaintId: {
    type: Schema.Types.ObjectId,
    ref: 'Complaint',
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  type: {
    type: String,
    enum: ['user_confirmation', 'company_notification'],
    required: true,
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IEmailHistory>('EmailHistory', emailHistorySchema); 
import mongoose, { Document, Schema } from 'mongoose';

export interface IComplaint extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string | null;
  category: string | null;
  company: string | null;
  companyEmails: string[];
  status: 'pending' | 'resolved' | 'rejected' | 'in-progress';
  twitterComplaintDescription: string;
  complaintFrom: {
    type: String,
    enum: ['twitter', 'email', null],
    default: null,
  };
  createdAt: Date;
  updatedAt: Date;
  attachments: {
    filename: string;
    path: string;
    originalname: string;
    mimetype: string;
    url: string;
  }[];
}

const complaintSchema = new Schema<IComplaint>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: null },
  category: { type: String, default: null },
  company: { type: String, default: null },
  companyEmails: [{ type: String }],
  twitterComplaintDescription: String,
  status: {
    type: String,
    enum: ['pending', 'resolved', 'rejected', 'in-progress'],
    default: 'pending'
  },
  complaintFrom: {
    type: String,
    enum: ['twitter', 'email', null],
    default: null
  },
  attachments: [{
    filename: String,
    path: String,
    originalname: String,
    mimetype: String,
    url: String
  }]
}, {
  timestamps: true
});

export default mongoose.model<IComplaint>('Complaint', complaintSchema);
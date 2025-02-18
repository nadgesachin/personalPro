import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  message: string;
  type: 'success' | 'pending' | 'urgent' | 'warning' | 'info';
  company?: string;
  isRead: boolean;
  createdAt: Date;
  date: Date
}

const NotificationSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['success', 'pending', 'urgent', 'warning', 'info'],
    default: 'info'
  },
  company: {
    type: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  date:{
    type: Date,
    defualt: Date.now
  },
  name:{
    type: String,
    default: ''
  },
}, { timestamps: true });

// Add an index for better query performance
NotificationSchema.index({ userId: 1, isRead: 1 });

export default mongoose.model<INotification>('Notification', NotificationSchema); 
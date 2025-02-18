// src/models/Feedback.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFeedback extends Document {
  userId: Types.ObjectId | string;
  type: 'suggestion' | 'bug' | 'complaint' | 'other';
  description: string;
  createdAt: Date;
}

const feedbackSchema = new Schema<IFeedback>({
  userId: { 
    type: Schema.Types.Mixed, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['suggestion', 'bug', 'complaint', 'other'], 
    required: true 
  },
  description: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 1000 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model<IFeedback>('Feedback', feedbackSchema);

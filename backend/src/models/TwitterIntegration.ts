import mongoose, { Schema, Document } from 'mongoose';

export interface TwitterIntegrationDocument extends Document {
  userId: string;
  twitterHandle: string;
  accessToken: string;
  refreshToken: string;
  isConnected: boolean;
}

const TwitterIntegrationSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  twitterHandle: { 
    type: String, 
    required: true 
  },
  accessToken: { 
    type: String, 
    required: true 
  },
  refreshToken: { 
    type: String, 
    required: true 
  },
  isConnected: { 
    type: Boolean, 
    default: false 
  }
});

export const TwitterIntegration = mongoose.model<TwitterIntegrationDocument>(
  'TwitterIntegration', 
  TwitterIntegrationSchema
);
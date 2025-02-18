import mongoose from 'mongoose';

const tweetSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  twitterId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Tweet = mongoose.model('Tweet', tweetSchema);
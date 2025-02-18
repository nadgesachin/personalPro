import mongoose from 'mongoose';

const twitterAuthSchema = new mongoose.Schema({
    oauth_token: {
        type: String,
        required: true,
    },
    oauth_token_secret: {
        type: String,
        required: true,
    },
    user_id: {
        type: String,
        required: true,
    },
    complaint_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Complaint',
        default: null,
    },
    accessToken: {
        type: String,
        default: '',
    },
    accessTokenSecret: {
        type: String,
        default: '',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const TweetAuth = mongoose.model('TweetAuth', twitterAuthSchema);
export default TweetAuth;
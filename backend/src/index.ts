import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import { auth } from "./middleware/auth";
import * as authController from "./controllers/auth";
import * as complaintsController from "./controllers/complaints";
import * as userController from "./controllers/user";
import * as feedbackController from "./controllers/feedback";
import { upload } from "./middleware/upload";
import path from "path";
import fs from 'fs';
import * as twitterController from "./controllers/twitterController";
import * as emailHistoryController from './controllers/emailHistory';
import * as notificationController from './controllers/notifications';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../uploads')));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost/speak-up")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Add this before setting up routes
// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Auth routes
app.post("/api/auth/send-otp", authController.sendVerificationCode);
app.post("/api/auth/resend-otp", authController.resendVerificationCode);
app.post("/api/auth/verify-otp", authController.verifyOTP);
app.post("/api/auth/login", authController.login);
app.post("/api/auth/google-login", authController.googleLogin);
app.get("/api/auth/verify", auth, authController.verifyToken);

// User routes
app.post("/api/user", userController.createUser);
app.get("/api/users/:id", userController.getUser);
app.delete("/api/users/:id", userController.deleteUser);

// Protected routes
app.get("/api/complaints", auth, complaintsController.getComplaints);
app.post("/api/complaints", auth, upload.array('attachments', 5), complaintsController.createComplaint);
app.patch("/api/complaints/:id", auth, upload.array('attachments', 5), complaintsController.updateComplaint);

// Complaint History routes
app.get("/api/complaint-history", auth, complaintsController.getComplaintHistory);
app.post("/api/complaint-history", auth, complaintsController.createComplaintHistory);

app.post("/api/feedback", feedbackController.createFeedback);
app.get("/api/feedback/:id", feedbackController.getFeedback);
app.delete("/api/feedback/:id", feedbackController.deleteFeedback);

// Email History routes
app.get('/api/email-history', auth, emailHistoryController.getEmailHistory);
app.get('/api/email-history/:id', auth, emailHistoryController.getEmailHistoryById);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.get('/api/twitter/request-token', auth, twitterController.requestToken);
app.post('/api/twitter/verify-pin', auth, twitterController.verifyPin);
app.post('/api/twitter/tweet', auth, twitterController.tweet);

// Fix the notification routes
app.get('/api/notifications', auth, notificationController.getNotifications);
app.put('/api/notifications/mark-all-as-read', auth, notificationController.markNotificationAsRead);
app.get('/api/notifications/count', auth, notificationController.getNotificationsCount);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

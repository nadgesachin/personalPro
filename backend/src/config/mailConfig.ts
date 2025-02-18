import dotenv from "dotenv";

dotenv.config();

export const mailConfig = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/email-service",
  smtp: {
    host: process.env.SMTP_HOST || "localhost",
    port: parseInt(process.env.SMTP_PORT || "1025"),
    auth: {
      user: process.env.SMTP_USER || "dd576fa5f1e055",
      pass: process.env.SMTP_PASSWORD || "d462884b00efb5",
    },
    secure: false,
    ignoreTLS: true,
  },
  emailFrom: process.env.EMAIL_FROM || "noreply@example.com",
};

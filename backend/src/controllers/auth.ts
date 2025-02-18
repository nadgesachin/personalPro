import { Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import User from "../models/User";
import { sendOTP } from "../services/twilio";
import OTP from "../models/Otp";
import { jwtConfig } from "../config/jwt";
import mongoose from "mongoose";
import { OAuth2Client } from "google-auth-library";
import { createToken } from "../services/createToken";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const login = async (req: Request, res: Response) => {
  const { phone } = req.body;
  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = createToken(user);

    res.status(200).json({
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

export const sendVerificationCode = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!/^(\+\d{1,3}[- ]?)?\d{10}$/.test(phone)) {
      return res.status(400).json({ error: "Invalid phone number format" });
    }
    const otp = await sendOTP(phone);
    const otpEntry = new OTP({ phone, otp });
    await otpEntry.save();
    res
      .status(200)
      .json({ message: "OTP sent successfully", otp: otpEntry.otp });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Failed to send OTP", error: error });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;

    const otpEntry = await OTP.findOne({ phone, otp, isActive: true });
    if (!otpEntry) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await OTP.updateOne({ phone, otp }, { isActive: false });

    const userExists = await User.findOne({ phone });
    if (userExists) {
      return res
        .status(200)
        .json({ message: "User already exists", loggedIn: true });
    }

    res
      .status(200)
      .json({
        message: "OTP verified successfully",
        verified: true,
        loggedIn: false,
      });
  } catch (error) {
    res.status(500).json({ error: "Failed to verify OTP" });
  }
};

export const resendVerificationCode = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    const MAX_RESEND_ATTEMPTS = 3;
    const BLOCK_DURATION = 1 * 60 * 1000; // 1 seconds for testing

    if (!phone || !/^(\+\d{1,3}[- ]?)?\d{10}$/.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number format" });
    }

    const currentTime = Date.now();
    const blockStartTime = new Date(currentTime - BLOCK_DURATION);
    
    const recentOTPs = await OTP.find({
      phone,
      lastResendTime: { $gte: blockStartTime }
    }).sort({ lastResendTime: -1 });

    // Check for block first
    if (recentOTPs.length >= MAX_RESEND_ATTEMPTS) {
      const oldestOTPInBlock = recentOTPs[recentOTPs.length - 1];
      const timeElapsed = currentTime - oldestOTPInBlock.lastResendTime.getTime();

      if (timeElapsed < BLOCK_DURATION) {
        const remainingTime = Math.ceil((BLOCK_DURATION - timeElapsed) / 1000);
        return res.status(429).json({
          message: `Too many attempts. Please try again after ${Math.ceil(remainingTime / 60)} minutes`,
          remainingTime
        });
      }
      // If block duration has passed, clear all old OTPs
      await OTP.updateMany({ phone }, { isActive: false });
    }

    // Generate and send new OTP
    const otp = await sendOTP(phone);
    
    // Create new OTP entry
    const newOtpEntry = new OTP({
      phone,
      otp,
      isActive: true,
      lastResendTime: new Date()
    });
    
    await newOtpEntry.save();

    const remainingAttempts = MAX_RESEND_ATTEMPTS - (recentOTPs.length + 1);

    let message = `OTP sent successfully: ${newOtpEntry.otp}`;

    res.status(200).json({
      message,
      otp: newOtpEntry.otp,
      remainingAttempts,
      nextResetTime: new Date(newOtpEntry.lastResendTime.getTime() + BLOCK_DURATION),
      isLastAttempt: remainingAttempts === 0
    });

  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({
      message: "Failed to send OTP",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const googleLogin = async (req: Request, res: Response) => {
  const { idToken } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ error: "Invalid Google token" });
    }

    const { sub, email, name } = payload;
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        googleId: sub,
        email,
        singleSignOn: true,
        name,
        profileCompleted: false,
      });
      await user.save();
    }

    const token = createToken(user);

    res.status(200).json({ token, user });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ error: "Google login failed" });
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      _id: user._id,
      phone: user.phone,
      name: user.name,
      email: user.email,
      gender: user.gender,
      profileImage: user.profileImage,
      singleSignOn: user.singleSignOn,
      profileCompleted: user.profileCompleted,
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Failed to verify token' });
  }
};

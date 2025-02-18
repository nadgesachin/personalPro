import { Request, Response } from "express";
import { TwitterService } from "../services/twitterService";
import TweetAuth from "../models/TweetAuth";
import mongoose from "mongoose";
import Complaint from "../models/Complaint";

const twitterService = new TwitterService();
export const requestToken = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized User id" });
    }
    const token = await twitterService.requestToken();
    const tweetAuth = new TweetAuth({
      oauth_token: token.oauth_token,
      oauth_token_secret: token.oauth_token_secret,
      user_id: req.user.id,
      accessToken: "",
      accessTokenSecret: "",
    });
    await tweetAuth.save();
    const authorizeURL = `https://api.twitter.com/oauth/authorize?oauth_token=${token.oauth_token}`;
    // const authorizeURL = `https://api.twitter.com/oauth/authorize?oauth_token=WdJ6bAAAAAABzGJkAAABlQCzRto`;
    res
      .status(200)
      .json({
        message: "Request token generated successfully and authorize URL",
        authorizeURL,
        oauth_token: token.oauth_token,
      });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
      res.status(500).json({ error: error.message });
    } else {
      console.error("An unknown error occurred");
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

export const verifyPin = async (req: Request, res: Response) => {
  try {
    const { pin, oauth_token, complaint_id } = req.body;
    const tweetAuth = await TweetAuth.findOne({ oauth_token });
    if (!tweetAuth) {
      return res.status(404).json({ error: "Token not found" });
    }
    const accessTokenResponse = await twitterService.accessToken(
      tweetAuth.oauth_token,
      tweetAuth.oauth_token_secret,
      pin
    );

    tweetAuth.accessToken = accessTokenResponse.oauth_token; // This should be a string
    tweetAuth.accessTokenSecret = accessTokenResponse.oauth_token_secret; // This should also be a string
    tweetAuth.complaint_id = new mongoose.Types.ObjectId(complaint_id);
    await tweetAuth.save();
    res
      .status(200)
      .json({
        message: "Pin verified successfully",
        accessToken: accessTokenResponse.oauth_token,
      });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
      res.status(500).json({ error: error.message });
    } else {
      console.error("An unknown error occurred");
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

export const tweet = async (req: Request, res: Response) => {
  try {
    const { message, accessToken, complaint_id } = req.body;
    let complaintid = complaint_id
      ? new mongoose.Types.ObjectId(complaint_id)
      : null;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized User" });
    }
    const tweetAuth = await TweetAuth.findOneAndUpdate(
      { accessToken, user_id: req.user.id },
      { complaint_id: complaintid || null }
    );
    if (!tweetAuth) {
      return res.status(404).json({ error: "Access Token not found" });
    }

    const oauth_token_secret: string = tweetAuth.accessTokenSecret;
    const oauth_token: string = tweetAuth.accessToken;
    await twitterService.postTweet(
      { text: message },
      oauth_token,
      oauth_token_secret
    );

    //create complaint
    if (!complaint_id) {
      const complaint = new Complaint({
        userId: req.user.id,
        title: "Twitter Complaint",
        description: null,
        twitterComplaintDescription: message,
        complaintFrom: "twitter",
      });
      const complaintData: any = await complaint.save();
      complaintid = new mongoose.Types.ObjectId(complaintData._id);
    } else {
      const complaint = await Complaint.findOneAndUpdate(
        { _id: complaint_id },
        {
          $set: {
            complaintFrom: "twitter",
            twitterComplaintDescription: message,
            updatedAt: new Date(),
          },
        },
        { new: true }
      );
      if (!complaint) {
        return res.status(404).json({ message: "Complaint not found" });
      }
    }
    return res
      .status(200)
      .json({ success: true, message: "Tweet posted successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
      res.status(500).json({ success: false, message: error.message });
    } else {
      console.error("An unknown error occurred");
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};


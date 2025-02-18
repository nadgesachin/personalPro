import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import Feedback from '../models/Feedback';
import User from '../models/User';

export const createFeedback = async (req: Request, res: Response) => {
  try {
    const { phone, type, description } = req.body;

    if (!phone || !type || !description) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, type, and description are required' 
      });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    const userId = user._id;

    const newFeedback = new Feedback({
      userId: userId as Types.ObjectId,
      type,
      description
    });

    await newFeedback.save();

    res.status(201).json({ 
      message: 'Feedback submitted successfully', 
      feedback: newFeedback 
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ 
      error: 'Failed to submit feedback', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export const getFeedback = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find feedback by ID
    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return res.status(404).json({ 
        message: 'Feedback not found' 
      });
    }

    res.status(200).json({ 
      message: 'Feedback retrieved successfully', 
      feedback 
    });
  } catch (error) {
    console.error('Error retrieving feedback:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve feedback', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export const deleteFeedback = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find and delete feedback
    const deletedFeedback = await Feedback.findByIdAndDelete(id);

    if (!deletedFeedback) {
      return res.status(404).json({ 
        message: 'Feedback not found' 
      });
    }

    res.status(200).json({ 
      message: 'Feedback deleted successfully', 
      feedback: deletedFeedback 
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ 
      error: 'Failed to delete feedback', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};
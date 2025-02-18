import { Request, Response } from 'express';
import Notification from '../models/Notification';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const notifications = await Notification.find({ userId, isRead: false })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    console.log('Attempting to mark notifications as read for user:', userId); // Debug log

    // Update all unread notifications for the user
    const result = await Notification.updateMany(
      { 
        userId: userId,
        isRead: false  // Only update unread notifications
      },
      { 
        $set: { isRead: true } 
      }
    );

    console.log('Update result:', result); // Debug log

    if (result.modifiedCount === 0) {
      console.log('No notifications were updated'); // Debug log
      return res.status(200).json({
        success: true,
        message: 'No unread notifications found'
      });
    }

    res.json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notifications'
    });
  }
};

// Get unread notifications count
export const getNotificationsCount = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || ""; // From auth middleware
    
    const count = await Notification.countDocuments({
      userId,
      isRead: false
    });

    res.status(200).json({
      success: true,
      data: count
    });
  } catch (error) {
    console.error('Error getting notifications count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications count'
    });
  }
};
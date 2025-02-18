import { Request, Response } from 'express';
import EmailHistory from '../models/EmailHistory';

export const getEmailHistory = async (req: Request, res: Response) => {
  try {
    const { complaintId, userId, type, status } = req.query;
    
    const query: any = {};
    
    if (complaintId) query.complaintId = complaintId;
    if (userId) query.userId = userId;
    if (type) query.type = type;
    if (status) query.status = status;

    const emailHistory = await EmailHistory.find(query)
      .sort({ sentAt: -1 })
      .populate('complaintId', 'title')
      .populate('userId', 'name email');

    res.status(200).json({
      success: true,
      data: emailHistory
    });
  } catch (error) {
    console.error('Error fetching email history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch email history'
    });
  }
};

export const getEmailHistoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const emailHistory = await EmailHistory.findById(id)
      .populate('complaintId', 'title')
      .populate('userId', 'name email');

    if (!emailHistory) {
      return res.status(404).json({
        success: false,
        message: 'Email history not found'
      });
    }

    res.status(200).json({
      success: true,
      data: emailHistory
    });
  } catch (error) {
    console.error('Error fetching email history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch email history'
    });
  }
}; 
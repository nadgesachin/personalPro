import { Request, Response } from "express";
import Complaint from "../models/Complaint";
import ComplaintHistory from "../models/ComplaintHistory";
import { EmailService } from '../services/emailService';
import User from '../models/User';
import Notification from '../models/Notification';

const emailService = EmailService.getInstance();

interface Attachment {
  filename: string;
  path: string;
  originalname: string;
  mimetype: string;
  url: string;
}

export const getComplaints = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const complaints = await Complaint.find({ userId, complaintFrom: { $ne: "twitter" } }).sort({ createdAt: -1 });
    res.json({
      success: true,
      message: "Complaints fetched successfully",
      data: complaints,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch complaints",
      data: null,
    });
  }
};

export const createComplaint = async (req: Request, res: Response) => {
  try {
    const { title, description, category, company, companyEmails } = req.body;
    const userId = req.user?.id;
    if(!companyEmails) {
      throw new Error("Company email is required");
    }
    const allCompanyEmails = companyEmails?.split(',').map((email: any) => email.trim());

    // Handle file uploads with proper typing
    const files = req.files as Express.Multer.File[];
    const attachments: Attachment[] = [];

    if (files && files.length > 0) {
      attachments.push(...files.map(file => ({
        filename: file.filename,
        path: file.path,
        originalname: file.originalname,
        mimetype: file.mimetype,
        url: `/uploads/${file.filename}`
      })));
    }

    // Create the complaint
    const complaint = await Complaint.create({
      userId,
      title,
      description,
      category,
      company,
      companyEmails: [...allCompanyEmails],
      attachments,
    });

    // Fetch the user to get their email
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Send emails
    try {
      // Send confirmation to user if they have an email
      if (user.email) {
        await emailService.sendComplaintConfirmationToUser(user, complaint);
      }

      // Send notification to company
      if (complaint.companyEmails && complaint.companyEmails.length > 0 && user.email) {
        await emailService.sendComplaintNotificationToCompany(complaint, user.email);
      }
    } catch (emailError) {
      console.error('Error sending emails:', emailError);
      // Continue with the response even if email sending fails
    }

    // Create notification for new complaint
    await Notification.create({
      userId,
      message: `Your complaint against ${company} has been submitted successfully.`,
      type: 'success',
      name: company,
      date: new Date()
    });

    res.status(201).json({
      success: true,
      message: "Complaint created successfully",
      data: complaint,
    });
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to create complaint",
      data: null,
    });
  }
};

export const getComplaintHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const condition = {
      userId,
      complaintFrom: req.query.from === "twitter" ? "twitter" : { $ne: "twitter" }
    };
    const complaintHistory = await Complaint.find(condition).sort({
      updatedAt: -1,
    });

    return res.json({
      success: true,
      message: "Complaint history fetched successfully",
      data: complaintHistory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch complaint history",
      data: null,
    });
  }
};

export const createComplaintHistory = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      company,
      companyEmail,
      contactInfo,
      status,
      date,
      referenceNumber,
      lastReminderSent,
      reminderCount,
      nextReminderDate,
    } = req.body;
    const userId = req.user?.id;

    const complaintHistory = await ComplaintHistory.create({
      userId,
      title,
      description,
      category,
      company,
      companyEmail,
      contactInfo,
      status,
      date,
      referenceNumber,
      lastReminderSent,
      reminderCount,
      nextReminderDate,
    });

    res.status(201).json({
      success: true,
      message: "Complaint history created successfully",
      data: complaintHistory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create complaint history",
      data: null,
    });
  }
};

export const updateComplaint = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (complaint.userId.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to update this complaint" });
    }

    // Handle file uploads
    const files = req.files as Express.Multer.File[];
    let attachments = complaint.attachments || [];

    if (files && files.length > 0) {
      const newAttachments = files.map(file => ({
        filename: file.filename,
        path: file.path,
        originalname: file.originalname,
        mimetype: file.mimetype,
        url: `/uploads/${file.filename}`
      }));
      attachments = [...attachments, ...newAttachments];
    }

    // Update allowed fields including attachments
    const allowedUpdates = {
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
      category: req.body.category,
      attachments
    };

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      id,
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    );

    // Create notification for complaint update
    if (req.body.status) {
      await Notification.create({
        userId,
        message: `Your complaint status has been updated to ${req.body.status}`,
        type: req.body.status === 'RESOLVED' ? 'success' : 'info',
        company: complaint.company,
        date: new Date(),
        name: complaint.company
      });
    }

    res.status(200).json(updatedComplaint);
  } catch (error) {
    console.error('Error updating complaint:', error);
    res.status(500).json({ message: "Error updating complaint" });
  }
};

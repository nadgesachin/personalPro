import nodemailer, { Transporter } from "nodemailer";
import { IComplaint } from "../models/Complaint";
import { IUser } from "../models/User";
import EmailHistory from "../models/EmailHistory";
import dotenv from "dotenv";
import { mailConfig } from "../config/mailConfig";

dotenv.config();

interface EmailPayload {
  to: string | string[];
  from?: string;
  cc?: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: any[];
}

export class EmailService {
  private transporter: Transporter;
  private static instance: EmailService;
  private initialized: boolean = false;

  private constructor() {
    this.transporter = nodemailer.createTransport({
      host: mailConfig.smtp.host,
      port: 2525,
      auth: {
        user: mailConfig.smtp.auth.user,
        pass: mailConfig.smtp.auth.pass,
      },
    });
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
      EmailService.instance.verifyConnection();
    }
    return EmailService.instance;
  }

  private async verifyConnection(): Promise<void> {
    if (this.initialized) return;
    try {
      await this.transporter.verify();
      console.log("SMTP connection established successfully");
      this.initialized = true;
    } catch (error) {
      console.error("Failed to establish SMTP connection:", error);
      this.initialized = false;
    }
  }

  private async logEmail(options: {
    recipientEmail: string;
    subject: string;
    content: string;
    status: "sent" | "failed";
    errorMessage?: string;
    complaintId?: string;
    userId?: string;
    type: "user_confirmation" | "company_notification" | "general";
  }) {
    try {
      await EmailHistory.create({
        ...options,
        sentAt: new Date(),
      });
    } catch (error) {
      console.error("Failed to log email:", error);
    }
  }

  async sendEmail(
    payload: EmailPayload,
    metadata?: {
      userId?: string;
      complaintId?: string;
      type?: "user_confirmation" | "company_notification" | "general";
    }
  ): Promise<void> {
    // Ensure from address is properly formatted
    const fromAddress = payload.from || process.env.EMAIL_FROM;
    if (!fromAddress) {
      throw new Error("From address is required");
    }

    const mailOptions = {
      from: this.formatEmailAddress(fromAddress),
      to: Array.isArray(payload.to) ? payload.to.join(",") : payload.to,
      cc:
        payload.cc && payload.cc.length > 0
          ? Array.isArray(payload.cc)
            ? payload.cc.join(",")
            : payload.cc
          : undefined,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
      attachments: payload.attachments,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      // Log recipients (including CC)
      const allRecipients = [
        ...(Array.isArray(payload.to) ? payload.to : [payload.to]),
        ...(payload.cc
          ? Array.isArray(payload.cc)
            ? payload.cc
            : [payload.cc]
          : []),
      ];

      for (const recipient of allRecipients) {
        await this.logEmail({
          recipientEmail: recipient,
          subject: payload.subject,
          content: payload.html || payload.text || "",
          status: "sent",
          userId: metadata?.userId,
          complaintId: metadata?.complaintId,
          type: metadata?.type || "general",
        });
      }
    } catch (error) {
      const recipients = Array.isArray(payload.to) ? payload.to : [payload.to];
      for (const recipient of recipients) {
        await this.logEmail({
          recipientEmail: recipient,
          subject: payload.subject,
          content: payload.html || payload.text || "",
          status: "failed",
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
          userId: metadata?.userId,
          complaintId: metadata?.complaintId,
          type: metadata?.type || "general",
        });
      }
      throw error;
    }
  }

  private formatEmailAddress(email: string): string {
    // Remove any surrounding whitespace
    email = email.trim();

    // If email is already in format "Name <email@domain.com>", return as is
    if (email.includes("<") && email.includes(">")) {
      return email;
    }

    // If it's just an email address, format it properly
    if (email.includes("@")) {
      return `<${email}>`;
    }

    throw new Error("Invalid email address format");
  }

  async sendComplaintConfirmationToUser(user: IUser, complaint: IComplaint) {
    const html = `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 30px 20px;
        background: linear-gradient(135deg, #F5F0FF 0%, #FFF3E0 50%, #FFF9C4 100%);
        border-radius: 15px;
      ">
        <div style="
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1)
        ">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://img.freepik.com/premium-vector/speak-up-banner-label-badge-icon-with-megaphone-flat-design_666746-376.jpg?w=826" alt="SpeakUp Logo" style="max-width: 200px; height: auto;">
          </div>
          <h2 style="color: #5B21B6; text-align: center; margin-bottom: 25px;">Thank you for submitting your complaint</h2>
          <p style="color: #4B5563;">Dear <span style="font-weight: bold;">${
            user.name || "User"
          }</span>,</p>
          <p style="color: #4B5563;">We have received your complaint with the following details:</p>
          <div style="
            background-color: #F8F9FF;
            padding: 25px;
            border-radius: 12px;
            margin: 20px 0;
            border: 1px solid #E5E7EB;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          ">
            <div style="
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
            ">
              <div style="
                background: white;
                padding: 20px;
                border-radius: 10px;
                border: 1px solid #E5E7EB;
                transition: all 0.3s ease;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                &:hover {
                  transform: translateY(-3px);
                  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                  border-color: #5B21B6;
                }
              ">
                <div style="display: flex; align-items: center;">
                  <span style="
                    background-color: #5B21B6;
                    color: white;
                    padding: 8px;
                    border-radius: 8px;
                    margin-right: 12px;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  ">📝</span>
                  <div>
                    <div style="color: #6B7280; font-size: 12px; margin-bottom: 4px;">Title</div>
                    <div style="color: #1F2937; font-weight: 500;">${
                      complaint.title
                    }</div>
                  </div>
                </div>
              </div>

              <div style="
                background: white;
                padding: 20px;
                border-radius: 10px;
                border: 1px solid #E5E7EB;
                transition: all 0.3s ease;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                &:hover {
                  transform: translateY(-3px);
                  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                  border-color: #5B21B6;
                }
              ">
                <div style="display: flex; align-items: center;">
                  <span style="
                    background-color: #5B21B6;
                    color: white;
                    padding: 8px;
                    border-radius: 8px;
                    margin-right: 12px;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  ">🏷️</span>
                  <div>
                    <div style="color: #6B7280; font-size: 12px; margin-bottom: 4px;">Category</div>
                    <div style="color: #1F2937; font-weight: 500;">${
                      complaint.category
                    }</div>
                  </div>
                </div>
              </div>

              <div style="
                background: white;
                padding: 20px;
                border-radius: 10px;
                border: 1px solid #E5E7EB;
                transition: all 0.3s ease;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                &:hover {
                  transform: translateY(-3px);
                  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                  border-color: #5B21B6;
                }
              ">
                <div style="display: flex; align-items: center;">
                  <span style="
                    background-color: #5B21B6;
                    color: white;
                    padding: 8px;
                    border-radius: 8px;
                    margin-right: 12px;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  ">🏢</span>
                  <div>
                    <div style="color: #6B7280; font-size: 12px; margin-bottom: 4px;">Company</div>
                    <div style="color: #1F2937; font-weight: 500;">${
                      complaint.company
                    }</div>
                  </div>
                </div>
              </div>

              <div style="
                background: white;
                padding: 20px;
                border-radius: 10px;
                border: 1px solid #E5E7EB;
                transition: all 0.3s ease;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                &:hover {
                  transform: translateY(-3px);
                  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                  border-color: #5B21B6;
                }
              ">
                <div style="display: flex; align-items: center;">
                  <span style="
                    background-color: #5B21B6;
                    color: white;
                    padding: 8px;
                    border-radius: 8px;
                    margin-right: 12px;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  ">⏳</span>
                  <div>
                    <div style="color: #6B7280; font-size: 12px; margin-bottom: 4px;">Status</div>
                    <div style="
                      display: inline-block;
                      padding: 4px 12px;
                      border-radius: 12px;
                      font-size: 14px;
                      font-weight: 500;
                      background-color: #FEF3C7;
                      color: #D97706;
                    ">${complaint.status}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p style="color: #4B5563;">We will keep you updated on the progress of your complaint.</p>
          <p style="color: #008000; margin-top: 30px;">Best regards,<br>SpeakUp Team</p>
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB; color: #6B7280; font-size: 12px;">
            © ${new Date().getFullYear()} SpeakUp. All rights reserved.
          </div>
        </div>
      </div>
    `;

     this.sendEmail(
      {
        from: process.env.EMAIL_FROM,
        to: user.email!,
        cc: complaint.companyEmails,
        subject: "Complaint Confirmation - SpeakUp",
        html,
      },
      {
        userId: user._id?.toString(),
        complaintId: complaint._id?.toString(),
        type: "user_confirmation",
      }
    );
  }

  async sendComplaintNotificationToCompany(
    complaint: IComplaint,
    userEmail: string
  ) {
    const html = `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 30px 20px;
        background: linear-gradient(135deg, #F5F0FF 0%, #FFF3E0 50%, #FFF9C4 100%);
        border-radius: 15px;
      ">
        <div style="
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1)
        ">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://img.freepik.com/premium-vector/speak-up-banner-label-badge-icon-with-megaphone-flat-design_666746-376.jpg?w=826" alt="SpeakUp Logo" style="max-width: 200px; height: auto;">
          </div>
          <h2 style="color: #5B21B6; text-align: center; margin-bottom: 25px;">New Complaint Received</h2>
          <p style="color: #4B5563;">A new complaint has been filed against your company:</p>
          <div style="
            background-color: #F8F9FF;
            padding: 25px;
            border-radius: 12px;
            margin: 20px 0;
            border: 1px solid #E5E7EB;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          ">
            <div style="
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
            ">
              <div style="
                background: white;
                padding: 20px;
                border-radius: 10px;
                border: 1px solid #E5E7EB;
                transition: all 0.3s ease;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                &:hover {
                  transform: translateY(-3px);
                  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                  border-color: #5B21B6;
                }
              ">
                <div style="display: flex; align-items: center;">
                  <span style="
                    background-color: #5B21B6;
                    color: white;
                    padding: 8px;
                    border-radius: 8px;
                    margin-right: 12px;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  ">🔍</span>
                  <div>
                    <div style="color: #6B7280; font-size: 12px; margin-bottom: 4px;">Complaint ID</div>
                    <div style="color: #1F2937; font-weight: 500;">${
                      complaint._id
                    }</div>
                  </div>
                </div>
              </div>

              <div style="
                background: white;
                padding: 20px;
                border-radius: 10px;
                border: 1px solid #E5E7EB;
                transition: all 0.3s ease;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                &:hover {
                  transform: translateY(-3px);
                  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                  border-color: #5B21B6;
                }
              ">
                <div style="display: flex; align-items: center;">
                  <span style="
                    background-color: #5B21B6;
                    color: white;
                    padding: 8px;
                    border-radius: 8px;
                    margin-right: 12px;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  ">📝</span>
                  <div>
                    <div style="color: #6B7280; font-size: 12px; margin-bottom: 4px;">Title</div>
                    <div style="color: #1F2937; font-weight: 500;">${
                      complaint.title
                    }</div>
                  </div>
                </div>
              </div>

              <div style="
                background: white;
                padding: 20px;
                border-radius: 10px;
                border: 1px solid #E5E7EB;
                transition: all 0.3s ease;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                &:hover {
                  transform: translateY(-3px);
                  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                  border-color: #5B21B6;
                }
              ">
                <div style="display: flex; align-items: center;">
                  <span style="
                    background-color: #5B21B6;
                    color: white;
                    padding: 8px;
                    border-radius: 8px;
                    margin-right: 12px;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  ">🏷️</span>
                  <div>
                    <div style="color: #6B7280; font-size: 12px; margin-bottom: 4px;">Category</div>
                    <div style="color: #1F2937; font-weight: 500;">${
                      complaint.category
                    }</div>
                  </div>
                </div>
              </div>

              <div style="
                background: white;
                padding: 20px;
                border-radius: 10px;
                border: 1px solid #E5E7EB;
                transition: all 0.3s ease;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                &:hover {
                  transform: translateY(-3px);
                  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                  border-color: #5B21B6;
                }
              ">
                <div style="display: flex; align-items: center;">
                  <span style="
                    background-color: #5B21B6;
                    color: white;
                    padding: 8px;
                    border-radius: 8px;
                    margin-right: 12px;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  ">⏳</span>
                  <div>
                    <div style="color: #6B7280; font-size: 12px; margin-bottom: 4px;">Status</div>
                    <div style="
                      display: inline-block;
                      padding: 4px 12px;
                      border-radius: 12px;
                      font-size: 14px;
                      font-weight: 500;
                      background-color: #FEF3C7;
                      color: #D97706;
                    ">${complaint.status}</div>
                  </div>
                </div>
              </div>

              <div style="
                background: white;
                padding: 20px;
                border-radius: 10px;
                border: 1px solid #E5E7EB;
                transition: all 0.3s ease;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                grid-column: 1 / -1;
                &:hover {
                  transform: translateY(-3px);
                  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                  border-color: #5B21B6;
                }
              ">
                <div style="display: flex; align-items: start;">
                  <span style="
                    background-color: #5B21B6;
                    color: white;
                    padding: 8px;
                    border-radius: 8px;
                    margin-right: 12px;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  ">📄</span>
                  <div style="flex: 1;">
                    <div style="color: #6B7280; font-size: 12px; margin-bottom: 4px;">Description</div>
                    <div style="
                      color: #1F2937;
                      font-weight: 500;
                      padding: 12px;
                      background-color: #F8F9FF;
                      border-radius: 8px;
                      border: 1px solid #E5E7EB;
                      line-height: 1.5;
                    ">${complaint.description}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p style="color: #4B5563;">Please take necessary action on this complaint.</p>
          <p style="color: #008000; margin-top: 30px;">Best regards,<br>SpeakUp Platform</p>
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB; color: #6B7280; font-size: 12px;">
            © ${new Date().getFullYear()} SpeakUp. All rights reserved.
          </div>
        </div>
      </div>
    `;

     this.sendEmail(
      {
        from: userEmail,
        to: complaint.companyEmails,
        cc: process.env.EMAIL_FROM,
        subject: `New Complaint Received - ${complaint.title}`,
        html,
      },
      {
        complaintId: complaint._id?.toString(),
        type: "company_notification",
      }
    );
  }
}

// Export a singleton instance
export const emailService = EmailService.getInstance();

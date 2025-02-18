import { Complaint, AIGeneratedMessage } from '../types';

export async function sendReminderEmail(
  complaint: Complaint,
  message: AIGeneratedMessage,
  recipientEmail: string
): Promise<boolean> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Log the email for development
  console.log('Mock Email Sent:', {
    to: recipientEmail,
    from: 'noreply@example.com',
    subject: message.subject,
    text: message.body,
  });

  // Simulate success with 90% probability
  return Math.random() > 0.1;
}
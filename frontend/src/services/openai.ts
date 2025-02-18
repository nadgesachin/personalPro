import { AIGeneratedMessage, Complaint } from '../types';

// Mock responses for different scenarios
const mockResponses = [
  {
    subject: "Follow-up: Product Malfunction - Awaiting Response",
    body: "Dear {company},\n\nI am writing to follow up on the complaint regarding the product malfunction reported {days} days ago. We have not received a response to our initial complaint, and this issue continues to impact our operations.\n\nCould you please provide an update on this matter? We would appreciate a timeline for resolution.\n\nBest regards"
  },
  {
    subject: "Urgent: Update Required - Service Quality Issue",
    body: "Dear {company},\n\nI am reaching out regarding our unresolved complaint about service quality submitted {days} days ago. This matter requires your immediate attention.\n\nPlease provide a status update and expected resolution timeline.\n\nThank you for your prompt attention to this matter.\n\nBest regards"
  },
  {
    subject: "Second Follow-up: Billing Discrepancy",
    body: "Dear {company},\n\nThis is our second attempt to reach you regarding the billing discrepancy reported {days} days ago. We are still awaiting your response to this important matter.\n\nKindly review our initial complaint and provide your feedback.\n\nBest regards"
  }
];

export async function generateFollowUpMessage(
  complaint: Complaint,
  previousMessages: string[]
): Promise<AIGeneratedMessage> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));

  // Select a random mock response
  const mockResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
  
  // Replace placeholders with actual values
  const days = getDaysSinceSubmission(complaint);
  return {
    subject: mockResponse.subject.replace('{days}', days.toString()),
    body: mockResponse.body
      .replace('{company}', complaint.company)
      .replace('{days}', days.toString())
  };
}

function getDaysSinceSubmission(complaint: Complaint): number {
  const submissionDate = new Date(complaint.createdAt);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - submissionDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
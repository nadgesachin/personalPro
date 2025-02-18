import { ReactNode } from 'react';
import * as Icons from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  icon: keyof typeof Icons;
  companies: Company[];
}

export interface Company {
  id: string;
  name: string;
  category: string;
  complaintCount: number;
  email: string[];
}

export interface ComplaintStep {
  id: number;
  title: string;
  description: string;
}

export interface Complaint {
  _id: string;
  category: string;
  company: string;
  companyEmail: string;
  description: string;
  title: string;
  attachments?: File[];
  contactInfo: ContactInfo;
  status: 'pending' | 'processing' | 'resolved';
  createdAt: string;
  date: string;
  referenceNumber: string;
  lastReminderSent?: string;
  nextReminderDate?: string;
  reminderCount?: number;
  customReminderFrequency?: number;
  customMessageTemplate?: string;
  companyEmails: string[];
}

export interface ContactInfo {
  name: string;
  email: string;
  phone?: string;
}

export interface VoiceRecognitionState {
  isListening: boolean;
  transcript: string;
  error: string | null;
  language: string;
}

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  children?: ReactNode;
}

export interface SearchFilters {
  category: string;
  company: string;
  status: string;
  startDate: string;
  endDate: string;
}

export interface SortConfig {
  field: keyof Complaint;
  direction: 'asc' | 'desc';
}

export interface ReminderSettings {
  frequency: number; // days
  messageTemplate: string;
  enabled: boolean;
}

export interface AIGeneratedMessage {
  subject: string;
  body: string;
}

export interface User {
  _id: string;
  phone: string;
  profileCompleted: boolean;
  singleSignOn?: boolean;
  // ... other existing properties
}
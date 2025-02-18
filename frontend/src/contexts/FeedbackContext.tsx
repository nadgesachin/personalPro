import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
import { config } from '../config';

interface Feedback {
  type: string;
  desc: string;
  userId: string; 
}

interface FeedbackContextType {
  submitFeedback: (feedback: Omit<Feedback, 'userId'>) => Promise<Response>;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const submitFeedback = async (feedback: Omit<Feedback, 'userId'>) => {
    if (!user || !user.phone) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch(`${config.backendBaseUrl}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...feedback,
          phone: user.phone   // Pass the user's phone number
        }),
      });

      return response;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  };

  return (
    <FeedbackContext.Provider value={{ submitFeedback }}>
      {children}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};
import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFeedback } from '../../contexts/FeedbackContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export const Feedback: React.FC = () => {
  const navigate = useNavigate();
  const [feedbackType, setFeedbackType] = useState('suggestion');
  const [message, setMessage] = useState('');
  const { submitFeedback } = useFeedback();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (message.trim() === '') {
      toast.error('Please provide a feedback message');
      return;
    }

    if (!user) {
      toast.error('Please log in to submit feedback');
      return;
    }

    if(feedbackType === 'suggestion'){
      toast.error('Please select a suggestion type');
      return;
    }

    try {
      const feedbackData = { 
        type: feedbackType, 
        description: message 
      };

      const response = await submitFeedback(feedbackData);

      if (response.ok) {
        toast.success('Feedback submitted successfully');
        setFeedbackType('suggestion');
        setMessage('');
        navigate('/home');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit feedback');
      }
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast.error(error.message || 'An unexpected error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-yellow-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 via-purple-500 to-yellow-500 shadow-sm">
        <div className="max-w-full mx-6 px-2">
          <div className="flex items-center h-16">
            <button 
              onClick={() => navigate('/settings')}
              className="text-white flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="flex-grow text-center">
              <h1 className="text-xl font-bold text-white">Feedback</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Feedback Type
              </label>
              <select
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg 
                           focus:ring-2 focus:ring-purple-500 focus:border-purple-300"
              >
                <option value="suggestion">Suggestion</option>
                <option value="bug">Bug Report</option>
                <option value="complaint">Complaint</option>
                <option value="praise">Praise</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Your Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full p-4 rounded-lg border border-gray-200 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none
                           scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-orange-100 
                           hover:scrollbar-thumb-orange-400 overflow-y-auto"
                placeholder="Please share your thoughts..."
                style={{
                  '--scrollbar-track-background-color': '#FEF3C7',
                  '--scrollbar-thumb-background-color': '#FDBA74',
                } as React.CSSProperties}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-purple-500 
                         hover:from-orange-600 hover:to-purple-600 text-white py-2 px-4 
                         rounded-lg transition-all duration-300"
            >
              Submit Feedback
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}; 
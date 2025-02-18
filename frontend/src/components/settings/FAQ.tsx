import React, { useState } from 'react';
import { ChevronLeft, ChevronDown, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FAQ: React.FC = () => {
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const faqSections = [
    {
      id: 'general',
      title: 'What is SpeakUp?',
      content: `SpeakUp is a platform designed to empower citizens to voice their concerns and file complaints about various civic issues. Our system ensures your complaints reach the right authorities and helps track their resolution.`
    },
    {
      id: 'how-to',
      title: 'How do I submit a complaint?',
      content: `To submit a complaint:
      1. Log in to your account
      2. Click on "New Complaint"
      3. Select the relevant category
      4. Fill in the details
      5. Add supporting documents if any
      6. Submit and track your complaint`
    },
    {
      id: 'tracking',
      title: 'How can I track my complaint?',
      content: `You can track your complaint by:
      • Visiting your dashboard
      • Using the complaint reference number
      • Checking email updates
      • Contacting our support team`
    }
  ];

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
              <h1 className="text-xl font-bold text-white">Frequently Asked Questions</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg divide-y divide-gray-100">
          {faqSections.map((section) => (
            <div key={section.id} className="border-b border-gray-100">
              <button
                onClick={() => setExpandedSection(
                  expandedSection === section.id ? null : section.id
                )}
                className="w-full px-6 py-4 flex items-center justify-between text-left 
                           hover:bg-gradient-to-r hover:from-orange-100 hover:to-purple-100 
                           transition-colors duration-300"
              >
                <span className="font-medium text-gray-900">{section.title}</span>
                {expandedSection === section.id ? (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                )}
              </button>
              {expandedSection === section.id && (
                <div className="px-6 py-4 text-gray-600 bg-gradient-to-r from-orange-50 to-purple-50">
                  <p className="whitespace-pre-line">{section.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 
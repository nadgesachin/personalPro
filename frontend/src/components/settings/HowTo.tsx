import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';

export const HowTo: React.FC = () => {
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const openPRDDoc = () => {
    window.open('/prddoc.html', '_blank');
  };

  const guides = [
    {
      id: 'product-documentation',
      title: "Product Documentation",
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            View our comprehensive product documentation for detailed information about SpeakUp features and functionalities.
          </p>
          <button
            onClick={openPRDDoc}
            className="flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r 
                     from-orange-500 to-purple-500 rounded-lg hover:from-orange-600 
                     hover:to-purple-600 transition-all duration-300"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View Documentation</span>
          </button>
        </div>
      )
    },
    {
      id: 'getting-started',
      title: "Getting Started",
      content: (
        <ol className="list-decimal list-inside space-y-2">
          <li className="text-gray-600">Create an account or log in</li>
          <li className="text-gray-600">Complete your profile information</li>
          <li className="text-gray-600">Verify your email address</li>
          <li className="text-gray-600">Familiarize yourself with the dashboard</li>
        </ol>
      )
    },
    {
      id: 'filing-complaint',
      title: "Filing a Complaint",
      content: (
        <ol className="list-decimal list-inside space-y-2">
          <li className="text-gray-600">Click on 'New Complaint' button</li>
          <li className="text-gray-600">Select the appropriate category</li>
          <li className="text-gray-600">Provide detailed description</li>
          <li className="text-gray-600">Add supporting documents or images</li>
          <li className="text-gray-600">Submit and get tracking number</li>
        </ol>
      )
    },
    {
      id: 'tracking',
      title: "Tracking Complaints",
      content: (
        <ol className="list-decimal list-inside space-y-2">
          <li className="text-gray-600">Visit your dashboard</li>
          <li className="text-gray-600">Use the search functionality</li>
          <li className="text-gray-600">Check status updates</li>
          <li className="text-gray-600">Respond to authority queries</li>
        </ol>
      )
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
              <h1 className="text-xl font-bold text-white">How to Use</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg divide-y divide-gray-100">
          {guides.map((guide) => (
            <div key={guide.id} className="border-b border-gray-100">
              <button
                onClick={() => setExpandedSection(
                  expandedSection === guide.id ? null : guide.id
                )}
                className="w-full px-6 py-4 flex items-center justify-between text-left 
                           hover:bg-gradient-to-r hover:from-orange-100 hover:to-purple-100 
                           transition-colors duration-300"
              >
                <span className="font-medium text-gray-900">{guide.title}</span>
                {expandedSection === guide.id ? (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                )}
              </button>
              {expandedSection === guide.id && (
                <div className="px-6 py-4 text-gray-600 bg-gradient-to-r from-orange-50 to-purple-50">
                  {guide.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 
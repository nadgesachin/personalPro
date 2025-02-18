import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronDown, ChevronRight } from 'lucide-react';

export const Legal: React.FC = () => {
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const legalSections = [
    {
      id: 'privacy',
      title: 'Privacy Policy',
      content: (
        <>
          <p className="text-gray-600 mb-4">
            We are committed to protecting your privacy and handling your data with transparency.
            We collect and process your data in accordance with applicable data protection laws.
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>We only collect information necessary for providing our services</li>
            <li>Your data is stored securely and never shared with unauthorized parties</li>
            <li>You have the right to access, modify, or delete your personal data</li>
          </ul>
        </>
      )
    },
    {
      id: 'terms',
      title: 'Terms of Service',
      content: (
        <>
          <p className="text-gray-600 mb-4">
            By using our service, you agree to these terms and conditions. Please read them carefully.
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Users must be 18 years or older to use our services</li>
            <li>Users are responsible for maintaining the security of their account</li>
            <li>We reserve the right to modify or terminate services at any time</li>
          </ul>
        </>
      )
    },
    {
      id: 'complaints',
      title: 'Complaints Procedure',
      content: (
        <>
          <p className="text-gray-600 mb-4">
            We take all complaints seriously and aim to resolve them promptly and fairly.
          </p>
          <div className="bg-gradient-to-r from-orange-50 to-purple-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">How to Submit a Complaint:</h3>
            <ol className="list-decimal list-inside text-gray-600 space-y-2">
              <li>Email us at support@example.com with details of your complaint</li>
              <li>We will acknowledge your complaint within 2 business days</li>
              <li>We aim to resolve all complaints within 14 business days</li>
              <li>If you're unsatisfied with the resolution, you can request an escalation review</li>
            </ol>
          </div>
        </>
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
              <h1 className="text-xl font-bold text-white">Legal Information</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg divide-y divide-gray-100">
          {legalSections.map((section) => (
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
                  {section.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 
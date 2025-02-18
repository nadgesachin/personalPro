import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronDown, ChevronRight } from 'lucide-react';

export const About: React.FC = () => {
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const aboutSections = [
    {
      id: 'mission',
      title: 'Our Mission',
      content: (
        <p className="text-gray-600">
          SpeakUp is dedicated to empowering citizens by providing a platform where their voices can be heard.
          We believe in creating positive change through effective communication between citizens and authorities.
        </p>
      )
    },
    {
      id: 'whatWeDo',
      title: 'What We Do',
      content: (
        <p className="text-gray-600">
          We facilitate the process of filing and tracking civic complaints, ensuring that your concerns
          reach the right authorities and are addressed in a timely manner.
        </p>
      )
    },
    {
      id: 'team',
      title: 'Our Team',
      content: (
        <p className="text-gray-600">
          We are a dedicated team of professionals committed to improving civic engagement and
          community development through technology.
        </p>
      )
    },
    {
      id: 'contact',
      title: 'Contact Information',
      content: (
        <div className="bg-gradient-to-r from-orange-50 to-purple-50 p-4 rounded-lg">
          <div className="space-y-2 text-gray-600">
            <p>Email: contact@speakup.com</p>
            <p>Phone: +91-8989898989</p>
            <p>Address: Dhwani Rural Information Pvt Ltd. </p>
            <p>Developers: Gautam Kumar, Fahad</p>
          </div>
        </div>
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
              <h1 className="text-xl font-bold text-white">About SpeakUp</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg divide-y divide-gray-100">
          {aboutSections.map((section) => (
            <div key={section.id} className="border-b border-gray-100">
              <button
                onClick={() => setExpandedSection(
                  expandedSection === section.id ? null : section.id
                )}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gradient-to-r hover:from-orange-100 hover:to-purple-100 transition-colors duration-300"
              >
                <span className="font-medium text-gray-900">{section.title}</span>
                {expandedSection === section.id ? (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                )}
              </button>
              {expandedSection === section.id && (
                <div className="px-6 py-4 text-gray-600">
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
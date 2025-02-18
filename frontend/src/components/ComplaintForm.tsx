import React, { useState } from 'react';
import { Upload, ChevronLeft } from 'lucide-react';
import { Category, Company, ContactInfo } from '../types';
import  ProgressSteps  from './ProgressSteps';
import  CategorySelector  from './CategorySelector';
import  CompanySelector  from './CompanySelector';
import  VoiceInput  from './VoiceInput';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ComplaintFormProps {
  category: Category | null;
  company: Company | null;
  description: string;
  onSubmit: (data: {
    companyEmail: string;
    description: string;
    attachments: File[];
    contactInfo: ContactInfo;
  }) => void;
  onBack: () => void;
  steps: string[];
  currentStep: number;
  setSelectedCategory: (category: Category) => void;
  setSelectedCompany: (company: Company) => void;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  handleVoiceInput: (transcript: string) => void;
}

const ComplaintForm: React.FC<ComplaintFormProps> = ({
  category,
  company,
  description,
  onSubmit,
  onBack,
  steps,
  currentStep,
  setSelectedCategory,
  setSelectedCompany,
  setTitle,
  setDescription,
  handleVoiceInput
}) => {
  const [selectedEmail, setSelectedEmail] = useState(company?.email[0] || '');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    name: '',
    email: '',
    phone: ''
  });
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      companyEmail: selectedEmail,
      description,
      attachments,
      contactInfo
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-yellow-50">
      <div className="bg-gradient-to-r from-orange-500 via-purple-500 to-yellow-500 shadow-sm">
        <div className="max-w-full mx-6 px-2">
          <div className="flex items-center h-16">
            <button 
              onClick={onBack}
              className="text-white hover:text-yellow-100 transition-colors duration-300"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-white ml-4">File a Complaint</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <ProgressSteps steps={steps} currentStep={currentStep} />
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-8 space-y-6">
        <div className="bg-gradient-to-r from-white to-orange-50 rounded-xl shadow-lg p-6 border border-orange-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Select Category</h2>
                <CategorySelector
                  categories={categories}
                  suggestedCategories={suggestedCategories}
                  selectedCategory={selectedCategory}
                  onSelect={setSelectedCategory}
                />
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Select Company</h2>
                <CompanySelector
                  companies={companies}
                  selectedCompany={selectedCompany}
                  onSelect={setSelectedCompany}
                />
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Complaint Details</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                               focus:ring-2 focus:ring-purple-200 focus:border-purple-500
                               bg-white transition-all duration-300"
                    placeholder="Brief title of your complaint"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                               focus:ring-2 focus:ring-purple-200 focus:border-purple-500
                               bg-white transition-all duration-300"
                    placeholder="Detailed description of your complaint"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Voice Input
                  </label>
                  <VoiceInput onTranscriptChange={handleVoiceInput} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supporting Documents
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          className="relative cursor-pointer bg-white rounded-md font-medium 
                                     text-purple-600 hover:text-purple-500 transition-colors duration-300"
                        >
                          <span>Upload a file</span>
                          <input type="file" className="sr-only" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-6 py-2 bg-gradient-to-r from-gray-100 to-gray-200 
                             text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 
                             transition-all duration-300"
                >
                  Previous
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-purple-500 
                            text-white rounded-lg hover:from-orange-600 hover:to-purple-600 
                            transition-all duration-300 ml-auto shadow-md"
              >
                {currentStep === steps.length ? 'Submit' : 'Next'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ComplaintForm;
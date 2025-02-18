import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useLocation } from 'react-router-dom';

import ProgressSteps from './components/ProgressSteps';
import { categories, complaintSteps } from './data/mockData';
import { getSuggestedCategories, getRelevantCompanies } from './utils/nlp';
import { Mic, Send, ArrowLeft, Building2, X, Bot } from 'lucide-react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { BsMegaphoneFill } from 'react-icons/bs';
import ChatBot from './components/ChatBot';
import Step1Component from './components/Step1Component';
import Step2Component from './components/Step2Component';
import Step3Component from './components/Step3Component';
import Step4Component from './components/Step4Component';
import axios from 'axios';
import ComplaintList from './components/ComplaintList';
import { LoadingSpinner } from "./components/LoadingSpinner";
import toast from 'react-hot-toast';
import { config } from './config';

// Add this style block near the top of your file, after the imports
const styles = `
  .blur-background::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(1px);
    z-index: 40;
    pointer-events: none;
  }
`;

function App() {
  const [step, setStep] = useState(1);
  const [complaintText, setComplaintText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [suggestedCategories, setSuggestedCategories] = useState(categories);
  const [relevantCompanies, setRelevantCompanies] = useState<typeof categories[0]['companies']>([]);
  const [complaintType, setComplaintType] = useState('Complaint');
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNotification, setIsNotifiction] = useState(false);
  const chatBotRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [isPageLoading, setIsPageLoading] = useState(false);

  // Add this near the start of your App component
  useEffect(() => {
    // Add styles to document
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // Update suggestions when complaint text changes
  useEffect(() => {
    if (complaintText.trim()) {
      const suggested = getSuggestedCategories(complaintText, categories);
      setSuggestedCategories(suggested);
    } else {
      setSuggestedCategories([]);
    }
  }, [complaintText]);

  // Update relevant companies when category is selected
  useEffect(() => {
    if (selectedCategory && complaintText.trim()) {
      const category = categories.find(c => c.id === selectedCategory);
      if (category) {
        const relevant = getRelevantCompanies(complaintText, category);
        setRelevantCompanies(relevant);
      }
    } else {
      setRelevantCompanies([]);
    }
  }, [selectedCategory, complaintText]);

  // Add click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (chatBotRef.current && !chatBotRef.current.contains(event.target as Node)) {
        setIsChatOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update the navigation effect
  useEffect(() => {
    if (location.state) {
      const { selectedCategory: initCategory, selectedCompany: initCompany, initialStep } = location.state;
      
      setIsPageLoading(true);
      
      // Simulate loading time
      setTimeout(() => {
        if (initCategory) {
          setSelectedCategory(initCategory);
        }
        if (initCompany) {
          setSelectedCompany(initCompany);
        }
        if (initialStep) {
          setStep(initialStep);
        }
        setIsPageLoading(false);
      }, 600);
    }
  }, [location]);

  const handleVoiceTranscript = useCallback((text: string) => {
    setComplaintText(text.trim());
  }, []);

  useEffect(() => {
    if (isNotification) {
     const response =  axios.get(`${config.backendBaseUrl}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = response.then(res => res.data);
    }
  }, [complaintText]);

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token'); // Assuming you store the JWT token in localStorage

      const response = await axios.post(
        `${config.backendBaseUrl}/api/complaints`,
        {
          title: complaintType,
          description: complaintText,
          category: selectedCategory,
          company: selectedCompany,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        // You might want to show a success message to the user here
        // Reset form
        setStep(1);
        setComplaintText('');
        setSelectedCategory(null);
        setSelectedCompany(null);
        setSuggestedCategories([]);
        setRelevantCompanies([]);
        setIsNotifiction(true);
        toast.success(response.data.message);
        navigate('/');
      }
    } catch (error) {
      // You might want to show an error message to the user here
      console.error('Failed to create complaint:', error);
    }
  };

  const getSelectedCategoryCompanies = () => {
    const category = categories.find(c => c.id === selectedCategory);
    return category ? category.companies : [];
  };

  // Update the handler to handle both category and company selection
  const handleChatbotCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setStep(2); // Move to category selection step
  };

  // Add new handler for company selection
  const handleChatbotCompanySelect = (categoryId: string, companyId: string) => {
    setSelectedCategory(categoryId);
    setSelectedCompany(companyId);
    setStep(3); // Move to company selection step
  };

  const handleNextStep = () => {
    setStep((prevStep) => prevStep + 1);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && complaintText.trim()) {
      setStep(2);
    }
  };

  const handleLogoClick = () => {
    setIsPageLoading(true);
    setTimeout(() => {
      navigate('/');
      setIsPageLoading(false);
    }, 600);
  };

  return (
    <Routes>
      <Route path="/" element={
        <div className="min-h-screen bg-gray-50">
          {/* Top Navigation Bar */}
          <div className="bg-gradient-to-r from-orange-400 to-purple-400 shadow-sm">
            <div className="max-w-full mx-6 px-2">
              <div className="flex items-center h-16">
                <div className="flex items-center gap-1">
                  <div className="w-10 h-10 rounded-full border-2 border-orange-300 bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <BsMegaphoneFill className="w-5 h-5 text-white transform -rotate-12" />
                  </div>
                  <h1 
                    className="text-xl font-bold text-white cursor-pointer" 
                    onClick={handleLogoClick}
                  >
                    SpeakUp
                  </h1>
                </div>
              </div>
            </div>
          </div>

          <div className="pb-8">
            <div className="bg-gradient-to-r from-orange-400 to-purple-400 text-white p-6 pb-12">
              <div className="max-w-4xl mx-auto mb-8">
                <h1 className="text-3xl text-center font-bold">Smart Complaint System</h1>
                <p className="text-orange-100 text-center">Voice-enabled complaint management made simple</p>
              </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                <ProgressSteps steps={complaintSteps} currentStep={step} />

                <div className="mt-8">
                  <AnimatePresence mode="wait">
                    {isPageLoading ? (
                      <LoadingSpinner message="Redirecting to home..." />
                    ) : (
                      <>
                        {step === 1 && (
                          <Step1Component
                            complaintText={complaintText}
                            setComplaintText={setComplaintText}
                            handleKeyDown={handleKeyDown}
                            handleVoiceTranscript={handleVoiceTranscript}
                            setStep={setStep}
                          />
                        )}

                        {step === 2 && (
                          <Step2Component
                            categories={categories}
                            suggestedCategories={suggestedCategories}
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                            setStep={setStep}
                            handleNextStep={handleNextStep}
                          />
                        )}

                        {step === 3 && (
                          <Step3Component
                            getSelectedCategoryCompanies={getSelectedCategoryCompanies}
                            selectedCompany={selectedCompany}
                            setSelectedCompany={setSelectedCompany}
                            setStep={setStep}
                            handleNextStep={handleNextStep}
                          />
                        )}

                        {step === 4 && (
                          <Step4Component
                            complaintType={complaintType}
                            setComplaintType={setComplaintType}
                            complaintText={complaintText}
                            setComplaintText={setComplaintText}
                            categories={categories}
                            selectedCategory={selectedCategory}
                            getSelectedCategoryCompanies={getSelectedCategoryCompanies}
                            selectedCompany={selectedCompany}
                            handleSubmit={handleSubmit}
                            setStep={setStep}
                          />
                        )}
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* Update the chatbot container */}
          <div ref={chatBotRef} className="z-50 relative">
            {/* Chat toggle button */}
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="fixed bottom-4 right-4 p-4 rounded-full bg-gradient-to-r from-orange-400 to-purple-400 text-white shadow-lg hover:scale-105 transition-transform duration-200"
            >
              <Bot className="w-6 h-6" />
            </button>

            {/* ChatBot component */}
            <AnimatePresence>
              {isChatOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  <ChatBot
                    categories={categories}
                    onCategorySelect={handleChatbotCategorySelect}
                    onCompanySelect={handleChatbotCompanySelect}
                    setStep={setStep}
                    setIsChatOpen={setIsChatOpen}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      } />
      <Route path="/complaints" element={<ComplaintList />} />
    </Routes>
  );
}

export default App;
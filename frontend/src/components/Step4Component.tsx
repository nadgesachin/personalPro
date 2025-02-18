import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, Bot, Wand2 } from "lucide-react";
import { Category, Company } from "../types";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { config } from '../config';

interface Step4ComponentProps {
  complaintType: string;
  setComplaintType: (type: string) => void;
  complaintText: string;
  setComplaintText: (text: string) => void;
  categories: Category[];
  selectedCategory: string | null;
  getSelectedCategoryCompanies: () => Company[];
  selectedCompany: string | null;
  onSubmit: () => void;
  setStep: (step: number) => void;
}

const Step4Component: React.FC<Step4ComponentProps> = ({
  complaintType,
  setComplaintType,
  complaintText,
  setComplaintText,
  categories,
  selectedCategory,
  getSelectedCategoryCompanies,
  selectedCompany,
  onSubmit,
  setStep,
}) => {
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isEnhancing, setIsEnhancing] = React.useState(false);
  const [isModelWarmedUp, setIsModelWarmedUp] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedCategory || !selectedCompany) {
      setStep(1);
    }
    // Add loading effect
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [selectedCategory, selectedCompany, setStep]);

  useEffect(() => {
    const warmUpModel = async () => {
      try {
        const apiKey = `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`
        if (!apiKey) {
          console.error('Missing API key');
          setIsModelWarmedUp(true);
          return;
        }

        // Using lightweight grammar correction model
        const response = await fetch(
          'https://api-inference.huggingface.co/models/oliverguhr/spelling-correction-english-base',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputs: "Test sentence",
              options: {
                wait_for_model: false,
                use_cache: true
              }
            })
          }
        );

        if (response.ok) {
          setIsModelWarmedUp(true);
        } else {
          setIsModelWarmedUp(true);
        }
      } catch (error) {
        console.warn('Model warm-up failed:', error);
        setIsModelWarmedUp(true);
      }
    };

    warmUpModel();

    // Ensure button becomes active after 3 seconds
    const timeoutId = setTimeout(() => {
      setIsModelWarmedUp(true);
    }, 4000);

    return () => clearTimeout(timeoutId);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024);
    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const handleRemoveFile = (fileToRemove: File) => {
    setUploadedFiles(prev => prev.filter(file => file !== fileToRemove));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', complaintType);
      formData.append('description', complaintText);
      formData.append('category', selectedCategory || '');
      formData.append('company', selectedCompany || '');

      const selectedCompanyData = getSelectedCategoryCompanies().find(c => c.id === selectedCompany);

      if (selectedCompanyData?.email) {
        formData.append('companyEmails', selectedCompanyData.email.join(','));
      }

      uploadedFiles.forEach(file => {
        formData.append('attachments', file);
      });

      const response = await fetch(`${config.backendBaseUrl}/api/complaints`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        toast.success('Complaint submitted successfully');

        if (typeof onSubmit === 'function') {
          onSubmit();
        }

        navigate('/', {
          replace: true,
          state: {
            showSuccessMessage: true,
            message: 'Your complaint has been successfully submitted!'
          }
        });
      } else {
        // Check if there's content and it's JSON before trying to parse
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          console.error('Submission failed:', errorData.message);
        } else {
          console.error('Submission failed:', response.statusText);
        }
        // You might want to show an error message to the user here
      }
    } catch (error) {
      console.error('Error submitting complaint:', error instanceof Error ? error.message : 'Unknown error');
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
  };

  const enhanceText = async () => {
    if (!complaintText.trim()) {
      toast.error('Please enter some text first');
      return;
    }

    setIsEnhancing(true);
    try {
      const apiKey = "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";
      if (!apiKey) {
        throw new Error('Missing API key');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Reduced timeout

      const response = await fetch(
        'https://api-inference.huggingface.co/models/oliverguhr/spelling-correction-english-base',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: complaintText,
            options: {
              wait_for_model: true,
              use_cache: false
            }
          }),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      let correctedText = data[0]?.generated_text || complaintText;

      // Clean up the text
      correctedText = correctedText.trim();

      if (correctedText !== complaintText) {
        setComplaintText(correctedText);
        toast.success('Text corrected successfully');
      } else {
        toast.success('No corrections needed');
      }

    } catch (error) {
      console.error('Error correcting text:', error);
      const errorMessage = error instanceof Error
        ? error.name === 'AbortError'
          ? "Loading AI model... Please wait"
          : "Failed to correct text. Please try again."
        : "An unknown error occurred.";

      if (errorMessage.includes("Loading AI")) {
        toast.success(errorMessage);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsEnhancing(false);
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-[400px] flex flex-col items-center justify-center space-y-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 rounded-full border-4 border-orange-400 border-t-transparent"
        />
        <p className="text-gray-600 font-medium">Loading submission details...</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="step4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 p-4 sm:p-6 bg-white rounded-lg shadow-md w-full max-w-4xl mx-auto"
    >
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setStep(3)}
          className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:shadow-lg transition-transform duration-300 transform hover:scale-105 flex items-center gap-4 px-4 py-2 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>
      <div className="bg-gradient-to-r from-pink-50 to-orange-50 p-4 sm:p-6 rounded-lg shadow-sm">
        <motion.h3
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold mb-4 text-gray-800 text-center"
        >
          Review Your <span className="text-orange-500">Submission</span>
        </motion.h3>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-4">
            {["Complaint", "Feedback", "Compliment"].map((type, index) => (
              <motion.button
                key={type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                onClick={() => setComplaintType(type)}
                className={`px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 text-sm sm:text-base
                  ${complaintType === type
                    ? "bg-gradient-to-r from-orange-400 to-purple-400 text-white hover:scale-105"
                    : "bg-white hover:bg-gradient-to-r hover:from-orange-50 hover:to-purple-50 text-gray-600"
                  }`}
              >
                {type}
              </motion.button>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-lg p-4 space-y-4 shadow-sm"
          >
            <div>
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-bold text-gray-600">Description</p>
                <button
                  onClick={enhanceText}
                  disabled={isEnhancing || !isModelWarmedUp}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg
                             bg-gradient-to-r from-orange-400 to-purple-400 text-white
                             hover:from-orange-500 hover:to-purple-500
                             transition-all duration-300 hover:shadow-md
                             disabled:opacity-50 transform hover:scale-105"
                >
                  {!isModelWarmedUp ? (
                    <>
                      <Bot className="w-4 h-4 animate-spin" />
                      <span>Warming Up...</span>
                    </>
                  ) : isEnhancing ? (
                    <>
                      <Bot className="w-4 h-4 animate-spin" />
                      <span>Enhancing...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      <span>AI Enhance</span>
                    </>
                  )}
                </button>
              </div>
              <div className="mt-1 relative">
                <textarea
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg
                             focus:outline-none focus:ring-1 focus:ring-orange-300
                             bg-white resize-none scrollbar-thin
                             scrollbar-thumb-orange-300 scrollbar-track-orange-100
                             hover:scrollbar-thumb-orange-400 overflow-y-auto"
                  rows={4}
                  placeholder="Enter your description here..."
                  style={{
                    '--scrollbar-track-background-color': '#FEF3C7',
                    '--scrollbar-thumb-background-color': '#FDBA74',
                  } as React.CSSProperties}
                />
                {isEnhancing && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-sm
                                  flex items-center justify-center rounded-lg">
                    <div className="flex items-center gap-2 px-4 py-2
                                    bg-white rounded-lg shadow-md">
                      <Bot className="w-5 h-5 text-orange-500 animate-spin" />
                      <span className="text-sm font-medium text-gray-700">
                        AI is enhancing your text...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/50 p-3 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-800 mb-1">
                  Category
                </h4>
                <p className="text-orange-600 text-lg">
                  {categories.find((c) => c.id === selectedCategory)?.name || "Please select a category"}
                </p>
              </div>

              <div className="bg-white/50 p-3 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-800 mb-1">
                  Company
                </h4>
                <div className="flex flex-col gap-2">
                  <p className="text-orange-600 text-lg">
                    {getSelectedCategoryCompanies().find(
                      (c) => c.id === selectedCompany
                    )?.name || "Please select a company"}
                  </p>
                  {selectedCompany && (
                    <div className="flex flex-col gap-1 bg-orange-50 px-3 py-2 rounded-lg">
                      {(() => {
                        const companyEmails = getSelectedCategoryCompanies()
                          .find((c) => c.id === selectedCompany)
                          ?.email;

                        if (!companyEmails || companyEmails.length === 0) return "No email available";

                        return companyEmails.map((email, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-orange-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            <p className="text-sm font-medium text-orange-600">
                              {email}
                            </p>
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-sm font-bold text-gray-600">Submit Proof (Optional)</p>
                <span className="text-xs text-gray-500">Max size: 10MB</span>
              </div>

              <div className="relative group">
                <input
                  type="file"
                  multiple
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={handleFileUpload}
                />
                <label
                  htmlFor="file-upload"
                  className="w-full min-h-[120px] flex flex-col items-center justify-center p-6
                           border-2 border-dashed border-orange-200 rounded-lg cursor-pointer
                           bg-white/80 hover:bg-orange-50/50 hover:border-orange-300
                           transition-all duration-300"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-orange-100/50 rounded-full group-hover:scale-110 transition-transform duration-300">
                      <Upload className="w-6 h-6 text-orange-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">
                        Drag and drop your files here
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        or <span className="text-orange-500">browse</span> to choose files
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2 mt-2">
                      <span className="px-2 py-1 bg-orange-50 rounded-md text-xs text-orange-600">PDF</span>
                      <span className="px-2 py-1 bg-orange-50 rounded-md text-xs text-orange-600">PNG</span>
                      <span className="px-2 py-1 bg-orange-50 rounded-md text-xs text-orange-600">JPG</span>
                      <span className="px-2 py-1 bg-orange-50 rounded-md text-xs text-orange-600">DOC</span>
                    </div>
                  </div>
                </label>
              </div>

              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border border-orange-100 hover:border-orange-200 transition-colors duration-200">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-orange-50 rounded-lg shrink-0">
                        <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-gray-700 truncate">{file.name}</span>
                        <span className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(file)}
                      className="p-1 hover:bg-red-50 rounded-full group transition-colors duration-200 shrink-0"
                    >
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
        <div className="flex justify-center mt-6">
          <button
            onClick={handleSubmit}
            className="w-full px-6 py-3 text-white bg-gradient-to-r from-orange-500 to-purple-500 rounded-lg hover:from-orange-600 hover:to-purple-600 transition-all duration-300 text-sm sm:text-base font-medium flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 rounded-full border-2 border-white border-t-transparent inline-block"
                />
                <span>Submitting...</span>
              </>
            ) : (
              "Submit Your Application"
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Step4Component;

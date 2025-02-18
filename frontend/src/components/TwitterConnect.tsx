import React, { useState, useEffect } from 'react';
import { Twitter, ArrowRight, Search } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { BsMegaphoneFill } from "react-icons/bs";
import { AnimatePresence } from "framer-motion";
import { LoadingSpinner } from "./LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";
import { config } from '../config';

// Add this interface for the complaint type
interface TwitterComplaint {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  status: string;
  twitterComplaintDescription: string;
}

export const TwitterConnect: React.FC = () => {
  const [tweet, setTweet] = useState('');
  const [loading, setLoading] = useState(false);
  const [authUrl, setAuthUrl] = useState('');
  const [accessOuthToken, setAccessOuthToken] = useState('');

  const [pin, setPin] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [accessToken, setAccessToken] = useState('');

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [complaints, setComplaints] = useState<TwitterComplaint[]>([]);

  const [showTweetInput, setShowTweetInput] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();

  // Add new loading state
  const [complaintsLoading, setComplaintsLoading] = useState(true);

  useEffect(() => {
    // Check if we should show the auth modal based on URL parameter
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('showAuthModal') === 'true') {
      handleRequestToken();
    }
  }, [location]);

  // Update the useEffect for fetching complaints
  useEffect(() => {
    const fetchComplaints = async () => {
      setComplaintsLoading(true);
      try {
        const response = await fetch(
          `${config.backendBaseUrl}/api/complaint-history?from=twitter`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch complaints");
        }

        const { data } = await response.json();
        if (Array.isArray(data)) {
          setComplaints(data);
        }
      } catch (error) {
        console.error("Error fetching complaints:", error);
        toast.error("Failed to load complaints");
      } finally {
        setComplaintsLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  // Update the filtered complaints logic
  const filteredComplaints = complaints.filter(complaint => 
    complaint.twitterComplaintDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    complaint.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const accessTokenSession = localStorage.getItem('accessToken');
        console.log('verify-token accessTokenSession: ', accessTokenSession);
        const response = await axios.post( `${config.backendBaseUrl}/api/twitter/check-token-validity`, 
          { accessToken: accessTokenSession }, 
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        console.log('verify-token response: ', response);
        setIsAuthorized(true);
        setAccessToken(response.data.accessToken);
      } catch (error) {
        console.log("verify-token error: ", error);
        setIsAuthorized(false);
      }
    };

    const accessTokenPresent =  () =>{
      const accessTokenSession = localStorage.getItem('accessToken');
      if(accessTokenSession){
        setIsAuthorized(true);
        setAccessToken(accessTokenSession);
      }
    }
    accessTokenPresent();
    // verifyToken(); 
  }, [accessToken]);

  const handleRequestToken = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.backendBaseUrl}/api/twitter/request-token`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      console.log('handleRequestToken response: ', response);
      setAuthUrl(response.data.authorizeURL);
      setAccessOuthToken(response.data.oauth_token);
      setShowAuthModal(true);
    } catch (error) {
      console.log("handleRequestToken error: ", error);
      toast.error('Failed to get authorization URL');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPin = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${config.backendBaseUrl}/api/twitter/verify-pin`, { pin, oauth_token: accessOuthToken }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      console.log('handleVerifyPin response: ', response);
      setIsAuthorized(true);
      setAccessToken(response.data.accessToken);
      localStorage.setItem('accessToken', response.data.accessToken);
      toast.success('Successfully connected to Twitter!');
      navigate('/smart-complaint/twitter/compose');
    } catch (error) {
      console.log("handleVerifyPin error: ", error);
      toast.error('Failed to verify PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleTweetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tweet.trim()) return;
    try {
      setLoading(true);
      await axios.post(`${config.backendBaseUrl}/api/twitter/tweet`, { message: tweet , accessToken}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      toast.success('Tweet posted successfully!');
      setTweet('');
    } catch (error) {
      console.log("handleTweetSubmit error: ", error);
      toast.error('Failed to post tweet');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTweetSubmit(e);
    }
  };

  const handleLogoClick = () => {
    if (!authLoading && isAuthenticated) {
      setIsLoading(true);
      setTimeout(() => {
        navigate('/home', { replace: true });
      }, 600); // Match the loading animation duration
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-yellow-50 overflow-x-hidden">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-orange-500 via-purple-500 to-yellow-500 shadow-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={handleLogoClick}
            >
              <div className="w-10 h-10 rounded-full border-2 border-orange-300
                           bg-gradient-to-br from-orange-500 to-purple-500
                           flex items-center justify-center">
                <BsMegaphoneFill className="w-5 h-5 text-white transform -rotate-12" />
              </div>
              <h1 className="text-xl font-bold text-white">SpeakUp</h1>
            </div>

            {/* Empty div for flex spacing */}
            <div className="w-[120px]"></div>
          </div>
        </div>
      </div>

      <div className="min-h-[calc(100vh-4rem)]">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <LoadingSpinner message="Redirecting to home..." />
          ) : (
            <>
              {/* Header Section with Search */}
              <div className="sticky top-16 z-40 bg-gradient-to-r from-orange-500 via-purple-500 to-yellow-500 shadow-sm p-4 sm:p-6">
                <div className="max-w-3xl mx-auto">
                  <div className="text-center mb-4 sm:mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Connect with Twitter</h1>
                    <p className="text-orange-100 text-sm sm:text-base">
                      Share your voice directly on Twitter. Connect your account to start posting tweets in seconds.
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tweets..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border-none focus:ring-2 focus:ring-orange-200"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    </div>
                    <div className="relative">
                      {!isAuthorized ? (
                        <button
                          onClick={handleRequestToken}
                          disabled={loading}
                          className="p-2.5 rounded-full bg-white text-orange-500 hover:bg-orange-50 
                                    relative group shadow-sm flex-shrink-0 isolate"
                        >
                          <Twitter className="h-5 w-5" />
                          <span className="absolute top-14 left-1/2 transform -translate-x-1/2 
                                         bg-white text-orange-500 px-3 py-1 rounded-lg text-sm
                                         opacity-0 group-hover:opacity-100 transition-opacity
                                         whitespace-nowrap shadow-lg pointer-events-none">
                            Connect Twitter Account
                          </span>
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate('/smart-complaint/twitter/compose')}
                          disabled={loading}
                          className="p-2.5 rounded-full bg-white text-orange-500 hover:bg-orange-50 
                                    relative group shadow-sm flex-shrink-0 isolate"
                        >
                          <Twitter className="h-5 w-5" />
                          <span className="absolute top-14 left-1/2 transform -translate-x-1/2 
                                         bg-white text-orange-500 px-3 py-1 rounded-lg text-sm
                                         opacity-0 group-hover:opacity-100 transition-opacity
                                         whitespace-nowrap shadow-lg pointer-events-none">
                            Post a Tweet
                          </span>
                        </button>
                      )}

                      {/* Authorization Modal */}
                      {!isAuthorized && authUrl && showAuthModal && (
                        <div className="fixed inset-0 z-50 overflow-y-auto">
                          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
                            {/* Blur Overlay */}
                            <div 
                              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 backdrop-blur-sm"
                              onClick={() => setShowAuthModal(false)}
                            ></div>

                            {/* Modal Content */}
                            <div className="relative inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                              <div className="absolute top-0 right-0 pt-4 pr-4">
                                <button
                                  type="button"
                                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                  onClick={() => setShowAuthModal(false)}
                                >
                                  <span className="sr-only">Close</span>
                                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>

                              <div className="mt-2 space-y-4">
                                <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Connect Your Twitter Account
                                  </h3>
                                  <a
                                    href={authUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-green-500 hover:text-green-600 hover:underline break-all text-sm font-bold text-decoration-none"
                                  >
                                    Click Here to Authorize
                                  </a>
                                </div>
                                <div className="space-y-3">
                                  <p className="text-sm text-gray-600 font-bold">
                                    Enter the PIN from Twitter
                                  </p>
                                  <input
                                    type="text"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    placeholder="Enter PIN"
                                    className="border border-gray-300 rounded p-2 w-full text-lg text-center tracking-wider"
                                    maxLength={7}
                                    aria-label="Enter Twitter PIN"
                                  />
                                  <button
                                    onClick={() => {
                                      handleVerifyPin();
                                    }}
                                    disabled={loading || !pin}
                                    className="w-full bg-gradient-to-r from-orange-500 to-purple-500 text-white 
                                             px-4 py-2 rounded-lg transition-all duration-300 
                                             flex items-center justify-center gap-2
                                             hover:shadow-lg hover:from-orange-600 hover:to-purple-600 
                                             hover:scale-[1.02] hover:-translate-y-0.5
                                             active:scale-95 active:shadow-sm
                                             disabled:opacity-50 disabled:cursor-not-allowed 
                                             disabled:hover:scale-100 disabled:hover:translate-y-0 
                                             disabled:hover:shadow-none disabled:hover:from-orange-500 
                                             disabled:hover:to-purple-500"
                                  >
                                    {loading ? (
                                      <>
                                        <div className="animate-spin mr-2">
                                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                        </div>
                                        <span>Connecting...</span>
                                      </>
                                    ) : (
                                      <>
                                        Connect
                                        <ArrowRight className="w-5 h-5" />
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tweet List Section */}
              <div className="max-w-3xl mx-auto px-4 py-6">
                <div className="space-y-4">
                  {complaintsLoading ? (
                    <div className="flex justify-center items-center min-h-[200px]">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
                    </div>
                  ) : filteredComplaints.length > 0 ? (
                    filteredComplaints.map((complaint) => (
                      <div 
                        key={complaint._id}
                        className="bg-white p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-purple-500 
                                        flex items-center justify-center flex-shrink-0">
                            <Twitter className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 mb-1">{complaint.title}</h3>
                            <p className="text-gray-800 mb-2 break-words">
                              {complaint.twitterComplaintDescription || complaint.description}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">
                                {new Date(complaint.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No complaints found</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>

      <Toaster 
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#fff',
            color: '#363636',
            borderRadius: '12px',
            border: '1px solid #FED7AA',
          },
          success: {
            iconTheme: {
              primary: '#F97316',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}
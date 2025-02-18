import React, { useState, useEffect } from "react";
import {
  Search,
  History,
  Settings,
  Home as HomeIcon,
  Megaphone,
  X,
  Twitter
} from "lucide-react";
import * as Icons from "lucide-react";
import { categories } from "../data/mockData";
import { LucideIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { IoNotificationsOutline } from "react-icons/io5";
import { getNewNotificationsCount } from "./Notifications";
import { BsMegaphoneFill } from "react-icons/bs";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2 } from "lucide-react";
import { Category } from "../types";
import SimpleBar from "simplebar-react";
import 'simplebar-react/dist/simplebar.min.css';
import toast from "react-hot-toast";
import { config } from '../config';
import { useAuth } from "../contexts/AuthContext";
import axios from 'axios';

// Update CompanyModal component with better animations
const CompanyModal = ({
  category,
  onClose,
}: {
  category: Category;
  onClose: () => void;
}) => {
  const navigate = useNavigate();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  const handleCompanySelect = (company: any) => {
    setSelectedCompanyId(company.id);
    // Add a slight delay before navigation for better UX
    setTimeout(() => {
      navigate('/smart-complaint', {
        state: {
          selectedCategory: category.id,
          selectedCompany: company.id,
          initialStep: 4
        }
      });
      onClose();
    }, 200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-100 flex justify-between items-center
                      bg-gradient-to-r from-orange-500 via-purple-500 to-yellow-500">
          <h2 className="text-xl font-semibold text-white">
            {category.name} Companies
          </h2>
          <button onClick={onClose} className="text-white hover:text-yellow-100">
            <X className="w-6 h-6" />
          </button>
        </div>

        <SimpleBar style={{ maxHeight: "calc(80vh - 70px)" }} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {category.companies.map((company, index) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg flex items-center gap-4
                          transition-all duration-300 cursor-pointer
                          ${
                            selectedCompanyId === company.id
                              ? 'bg-gradient-to-r from-orange-500 to-purple-500 shadow-lg transform scale-[1.02] border-none'
                              : 'bg-gradient-to-r from-white to-orange-50 hover:from-orange-50 hover:to-purple-50 border border-orange-100 hover:shadow-md'
                          }`}
                onClick={() => handleCompanySelect(company)}
              >
                <Building2 className={`w-6 h-6 ${
                  selectedCompanyId === company.id ? 'text-white' : 'text-purple-500'
                }`} />
                <div className="flex-1">
                  <h3 className={`font-medium ${
                    selectedCompanyId === company.id ? 'text-white' : 'text-gray-900'
                  }`}>
                    {company.name}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        </SimpleBar>
      </motion.div>
    </motion.div>
  );
};

const NavLinks = ({ className = "", onItemClick = () => {} }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  // Function to fetch notification count
  const fetchNotificationCount = async () => {
    try {
      const response = await axios.get(
        `${config.backendBaseUrl}/api/notifications/count`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setUnreadCount(response.data.data || 0);
    } catch (error) {
      console.error('Error fetching notification count:', error);
      setUnreadCount(0);
    }
  };

  // Fetch count on mount and set up polling
  useEffect(() => {
    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Function to determine if a link is active
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/home';
    }
    return location.pathname === path;
  };

  // Base classes for the link
  const baseLinkClass = "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 ease-in-out font-semibold";

  // Function to get link classes based on active state
  const getLinkClasses = (path: string) => {
    const active = isActive(path);
    return `${baseLinkClass} ${className} ${
      active
        ? 'bg-gradient-to-r from-orange-400/50 to-purple-400/50 text-white shadow-inner'
        : 'text-white/80 hover:bg-gradient-to-r hover:from-orange-400/40 hover:to-purple-400/40 hover:text-white'
    }`;
  };

  return (
    <>
      <button
        className={getLinkClasses('/')}
        onClick={() => {
          if (!isActive('/')) {
            onItemClick();
            navigate('/home');
          }
        }}
      >
        <HomeIcon className="w-5 h-5" />
        <span className="text-sm">Home</span>
      </button>

      <button
        className={getLinkClasses('/history')}
        onClick={() => {
          if (!isActive('/history')) {
            onItemClick();
            navigate('/history');
          }
        }}
      >
        <History className="w-5 h-5" />
        <span className="text-sm">History</span>
      </button>

      <button
        className={getLinkClasses('/smart-complaint')}
        onClick={() => {
          if (!isActive('/smart-complaint')) {
            onItemClick();
            navigate('/smart-complaint');
          }
        }}
      >
        <Megaphone className="w-5 h-5" />
        <span className="text-sm">Smart Complaint</span>
      </button>

      <button
        className={getLinkClasses('/smart-complaint/twitter')}
        onClick={() => {
          if (!isActive('/smart-complaint/twitter')) {
            onItemClick();
            navigate('/smart-complaint/twitter');
          }
        }}
      >
        <Twitter className="w-5 h-5" />
        <span className="text-sm">Share with Twitter</span>
      </button>

      <button
        className={getLinkClasses('/notifications')}
        onClick={() => {
          if (!isActive('/notifications')) {
            onItemClick();
            navigate('/notifications');
          }
        }}
      >
        <div className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        <span className="text-sm">Notifications</span>
      </button>

      <button
        className={getLinkClasses('/settings')}
        onClick={() => {
          if (!isActive('/settings')) {
            onItemClick();
            navigate('/settings');
          }
        }}
      >
        <Settings className="w-5 h-5" />
        <span className="text-sm">Settings</span>
      </button>
    </>
  );
};

// Add new ProfileModal component
const ProfileModal = ({
  onClose,
}: {
  onClose: () => void;
}) => {
  const [userStats, setUserStats] = useState({
    totalComplaints: 0,
    resolvedComplaints: 0,
    pendingComplaints: 0,
    rejectedComplaints: 0,
    inProgressComplaints: 0
  });
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    createdAt: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');

        // Fetch user details
        const userResponse = await fetch(`${config.backendBaseUrl}/api/auth/verify`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const userData = await userResponse.json();

        // Fetch complaints
        const complaintsResponse = await fetch(`${config.backendBaseUrl}/api/complaints`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const complaintsData = await complaintsResponse.json();

        // Calculate stats from complaints
        const complaints = Array.isArray(complaintsData) ? complaintsData :
                         (complaintsData.complaints || complaintsData.data || []);

        const stats = complaints.reduce((acc:any, complaint:any) => {
          acc.totalComplaints++;
          switch (complaint.status) {
            case 'resolved':
              acc.resolvedComplaints++;
              break;
            case 'rejected':
              acc.rejectedComplaints++;
              break;
            case 'in-progress':
              acc.inProgressComplaints++;
              break;
            case 'pending':
              acc.pendingComplaints++;
              break;
          }
          return acc;
        }, {
          totalComplaints: 0,
          resolvedComplaints: 0,
          pendingComplaints: 0,
          rejectedComplaints: 0,
          inProgressComplaints: 0
        });

        setUserDetails({
          name: userData.name || userData.email?.split('@')[0] || 'User',
          email: userData.email || '',
          createdAt: userData.createdAt || new Date().toISOString()
        });
        setUserStats(stats);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-100 flex justify-between items-center
                      bg-gradient-to-r from-orange-500 via-purple-500 to-yellow-500">
          <h2 className="text-xl font-semibold text-white">Profile Overview</h2>
          <button onClick={onClose} className="text-white hover:text-yellow-100">
            <X className="w-6 h-6" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-6 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-orange-500 via-purple-500 to-yellow-500
                            flex items-center justify-center text-white text-3xl font-bold shadow-lg
                            border-4 border-white">
                {userDetails.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-1">{userDetails.name}</h3>
                <p className="text-sm text-gray-500 mb-1">{userDetails.email}</p>
                <p className="text-xs bg-gradient-to-r from-orange-500 to-purple-500 text-transparent bg-clip-text font-medium">
                  Member since {formatDate(userDetails.createdAt)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-orange-500 to-purple-500 p-4 rounded-xl text-white shadow-lg"
              >
                <div className="text-3xl text-center font-bold mb-1">{userStats.totalComplaints}</div>
                <div className="text-sm text-center font-medium">Total Complaints Filed</div>
              </motion.div>

              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl text-center shadow-md
                            hover:shadow-lg transition-all duration-300 border border-green-200"
                >
                  <div className="text-2xl font-bold text-green-600 mb-1">{userStats.resolvedComplaints}</div>
                  <div className="text-xs font-medium text-green-800">Resolved</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center shadow-md
                            hover:shadow-lg transition-all duration-300 border border-blue-200"
                >
                  <div className="text-2xl font-bold text-blue-600 mb-1">{userStats.inProgressComplaints}</div>
                  <div className="text-xs font-medium text-blue-800">In Progress</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl text-center shadow-md
                            hover:shadow-lg transition-all duration-300 border border-yellow-200"
                >
                  <div className="text-2xl font-bold text-yellow-600 mb-1">{userStats.pendingComplaints}</div>
                  <div className="text-xs font-medium text-yellow-800">Pending</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl text-center shadow-md
                            hover:shadow-lg transition-all duration-300 border border-red-200"
                >
                  <div className="text-2xl font-bold text-red-600 mb-1">{userStats.rejectedComplaints}</div>
                  <div className="text-xs font-medium text-red-800">Rejected</div>
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

const Home = () => {
  console.log("Home page rendered");
  // Move hooks inside the component
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [totalComplaints, setTotalComplaints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCategories, setFilteredCategories] = useState(categories);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const {user} = useAuth();

  // Update useEffect to handle loading state
  useEffect(() => {
    let isMounted = true;  // Add mounted flag

    const fetchTotalComplaints = async () => {
      if (!isMounted) return;  // Check if component is still mounted
      setIsLoading(true);

      try {
        const response = await fetch(`${config.backendBaseUrl}/api/complaints`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();

        if (!isMounted) return;  // Check again before updating state

        let count = 0;
        if (Array.isArray(data)) {
          count = data.length;
        } else if (typeof data === 'object' && data.complaints) {
          count = Array.isArray(data.complaints) ? data.complaints.length : 0;
        } else if (typeof data === 'object' && data.data) {
          count = Array.isArray(data.data) ? data.data.length : 0;
        }
        toast.success(data.message);
        setTotalComplaints(count);
      } catch (error) {
        console.error('Error fetching complaints:', error);
        if (isMounted) setTotalComplaints(0);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchTotalComplaints();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array

  // Add this useEffect near the top of the component
  useEffect(() => {

    if (location.state?.showSuccessMessage) {
      console.log('Showing success message:', location.state.message);
      setShowSuccess(true);
      setSuccessMessage(location.state.message);
      // Clear the location state after showing the message
      window.history.replaceState({}, document.title);
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [location]);

  // Add useEffect to filter categories when search query changes
  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredCategories(categories);
      return;
    }

    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(query) ||
      category.companies.some(company =>
        company.name.toLowerCase().includes(query)
      )
    );

    setFilteredCategories(filtered);
  }, [searchQuery]);

  // Update FrequentCategories component to use filtered results
  const FrequentCategories = () => (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h2 className="text-lg font-medium mb-4">Frequently Used Categories</h2>
      <div className="grid grid-cols-4 gap-4">
        {filteredCategories.slice(0, 4).map((category) => {
          const IconComponent = Icons[category.icon] as LucideIcon;
          return (
            <motion.button
              key={category.id}
              onClick={() => {
                setSelectedCategory(category.id);
                setIsCompanyModalOpen(true);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center p-4 rounded-lg
                         hover:bg-gradient-to-r hover:from-orange-50 hover:to-purple-50
                         transition-all duration-300"
            >
              <div
                className="w-12 h-12 bg-gradient-to-r from-orange-100 to-purple-100
                            rounded-full flex items-center justify-center mb-2"
              >
                <IconComponent className="w-6 h-6 text-purple-500" />
              </div>
              <span className="text-sm text-gray-600">{category.name}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  // Update CategoryGrid component to use filtered results
  const CategoryGrid = () => (
    <div className="mt-6">
      <h2 className="text-lg font-medium mb-4">Categories</h2>
      <div className="grid grid-cols-3 gap-4">
        {filteredCategories.map((category) => {
          const IconComponent = Icons[category.icon] as LucideIcon;
          return (
            <motion.button
              key={category.id}
              onClick={() => {
                setSelectedCategory(category.id);
                setIsCompanyModalOpen(true);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center
                         hover:bg-gradient-to-r hover:from-orange-50 hover:to-purple-50
                         transition-all duration-300"
            >
              <div
                className="w-12 h-12 bg-gradient-to-r from-orange-100 to-purple-100
                            rounded-full flex items-center justify-center mb-2"
              >
                <IconComponent className="w-6 h-6 text-purple-500" />
              </div>
              <span className="text-sm text-gray-600">{category.name}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-yellow-50">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-orange-500 via-purple-500 to-yellow-500 shadow-md">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-full border-2 border-orange-300
                            bg-gradient-to-br from-orange-500 to-purple-500
                            flex items-center justify-center"
              >
                <BsMegaphoneFill className="w-5 h-5 text-white transform -rotate-12" />
              </div>
              <h1 className="text-xl font-bold text-white">SpeakUp</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <NavLinks className="text-orange-100 hover:text-white transition-colors" />
            </div>

            {/* Mobile Hamburger Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-orange-100 hover:text-white transition-colors"
              >
                <Icons.Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu with Transition */}
        <div
          className={`lg:hidden transition-all duration-300 ease-in-out ${
            isMenuOpen
              ? "max-h-64 opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 bg-orange-500">
            <NavLinks
              className="block text-orange-50 w-full text-left hover:bg-orange-500 hover:pl-6"
              onItemClick={() => setIsMenuOpen(false)}
            />
          </div>
        </div>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2"
          >
            <div className="flex-1">{successMessage}</div>
            <button
              onClick={() => setShowSuccess(false)}
              className="text-green-700 hover:text-green-900"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pb-8">
        <div className="bg-gradient-to-r from-orange-500 via-purple-500 to-yellow-500 shadow-sm p-6 pb-12">
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative flex items-center">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What are you looking for?"
                className="w-full pl-10 pr-12 py-2.5 rounded-full bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent shadow-sm"
              />
              <div
                className="absolute right-2 w-8 h-8 rounded-full cursor-pointer hover:opacity-90 transition-opacity
                          bg-gradient-to-r from-orange-500 via-purple-500 to-yellow-500
                          flex items-center justify-center text-white text-sm font-bold
                          border-2 border-white"
                onClick={() => setIsProfileModalOpen(true)}
              >
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            </div>
          </div>

          {/* Show "No results found" message when there are no matches */}
          {searchQuery && filteredCategories.length === 0 && (
            <div className="text-center text-white mt-4">
              No results found for "{searchQuery}"
            </div>
          )}

          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">
              {isLoading ? (
                <span className="opacity-50">Loading...</span>
              ) : (
                (totalComplaints ?? 0).toLocaleString()
              )}
            </h1>
            <p className="text-lg font-medium bg-gradient-to-r from-yellow-100 to-orange-100 text-transparent bg-clip-text">
            Complaints have been filed till today
            </p>
          </div>
        </div>

        <div className="px-6 -mt-6">
          <FrequentCategories />
          <CategoryGrid />
        </div>
      </div>

      {/* Company Modal */}
      <AnimatePresence>
        {isCompanyModalOpen && selectedCategory && (
          <CompanyModal
            category={categories.find((c) => c.id === selectedCategory)!}
            onClose={() => {
              setIsCompanyModalOpen(false);
              setSelectedCategory(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Add ProfileModal */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <ProfileModal onClose={() => setIsProfileModalOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;

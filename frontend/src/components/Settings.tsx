import React, { useState } from "react";
import {
  FileText,
  HelpCircle,
  Info,
  LogOut,
  MessageSquare,
  Scale,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BsMegaphoneFill } from "react-icons/bs";
import { useAuth } from "../contexts/AuthContext";
import { LoadingSpinner } from "./LoadingSpinner";
import { AnimatePresence } from "framer-motion";

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const handleLogoClick = () => {
    if (!authLoading && isAuthenticated) {
      setIsLoading(true);
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 600); // Match the loading animation duration
    }
  };

  const settingItems = [
    {
      id: "legal",
      icon: <Scale className="w-5 h-5" />,
      label: "Legal",
    },
    {
      id: "faqs",
      icon: <HelpCircle className="w-5 h-5" />,
      label: "FAQs",
    },
    {
      id: "about",
      icon: <Info className="w-5 h-5" />,
      label: "About",
    },
    {
      id: "feedback",
      icon: <MessageSquare className="w-5 h-5" />,
      label: "Feedback for us",
    },
    {
      id: "howto",
      icon: <FileText className="w-5 h-5" />,
      label: "How to use?",
      action: () => navigate('/settings/howto')
    },
    {
      id: "logout",
      icon: <LogOut className="w-5 h-5" />,
      label: "Logout",
      className: "text-red-500 hover:text-red-600",
      action: async () => {
        setIsLoggingOut(true);
        await logout();
        setTimeout(() => {
          navigate("/login");
        }, 600); // Match the loading animation duration
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-yellow-50">
      <div className="bg-gradient-to-r from-orange-500 via-purple-500 to-yellow-500">
        {/* Top Navigation Bar */}
        <div className="bg-gradient-to-r from-orange-500 via-purple-500 to-yellow-500">
          <div className="max-w-full mx-6 px-2">
            <div className="flex items-center h-16">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={handleLogoClick}
              >
                <div className="w-10 h-10 rounded-full border-2 border-orange-300 bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <BsMegaphoneFill className="w-5 h-5 text-white transform -rotate-12" />
                </div>
                <h1 className="text-xl font-bold text-white">SpeakUp</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {isLoading || isLoggingOut ? (
            <LoadingSpinner message={isLoggingOut ? "Logging out..." : "Redirecting to home..."} />
          ) : (
            <div className="bg-white rounded-xl shadow-lg">
              <div className="p-6 border-b border-gray-100">
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              </div>

              <div className="divide-y divide-gray-100">
                {settingItems.map((item) => (
                  <div key={item.id}>
                    <button
                      onClick={() => {
                        if (item.expandable) {
                          setExpandedItem(expandedItem === item.id ? null : item.id);
                        } else if (item.action) {
                          item.action();
                        } else {
                          navigate(`/settings/${item.id}`);
                        }
                      }}
                      className={`w-full px-6 py-4 flex items-center gap-3 text-left hover:bg-gradient-to-r hover:from-orange-100 hover:to-purple-100 transition-colors duration-300 ${
                        item.className || "text-gray-700 hover:text-gray-900"
                      }`}
                    >
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                      {item.expandable ? (
                        expandedItem === item.id ? (
                          <ChevronUp className="ml-auto w-5 h-5" />
                        ) : (
                          <ChevronDown className="ml-auto w-5 h-5" />
                        )
                      ) : (
                        <span className="ml-auto">›</span>
                      )}
                    </button>

                    {/* Expandable content */}
                    {item.expandable && expandedItem === item.id && (
                      <div className="bg-gray-50">
                        {item.subItems?.map((subItem) => (
                          <button
                            key={subItem.id}
                            onClick={subItem.action}
                            className="w-full px-6 py-3 flex items-center gap-3 text-left text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-300"
                          >
                            <div className="w-5" /> {/* Spacing for alignment */}
                            {subItem.icon}
                            <span>{subItem.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

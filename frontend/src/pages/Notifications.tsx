import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, AlertOctagon, CheckCircle2, Clock, ShieldAlert, Bell } from 'lucide-react';
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { ChevronLeft } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { config } from '../config';
import { useNotifications } from '../contexts/NotificationContext';

interface Notification {
  _id: string;
  company?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  date: string;
  name: string;
  type: 'success' | 'pending' | 'urgent' | 'warning' | 'info';
}

// const mockNotifications: Notification[] = [
//   {
//     id: '1',
//     company: 'Bharti Airtel',
//     message: 'Your complaint has been resolved.',
//     isNew: true,
//     timestamp: '2024-03-15T10:00:00Z',
//     type: 'success'
//   },
//   {
//     id: '2',
//     company: 'IRCTC',
//     message: 'Your complaint is pending review.',
//     isNew: true,
//     timestamp: '2024-03-14T15:30:00Z',
//     type: 'pending'
//   },
//   {
//     id: '3',
//     company: 'Amazon',
//     message: 'Urgent: Action required on your complaint.',
//     isNew: true,
//     timestamp: '2024-03-14T12:30:00Z',
//     type: 'urgent'
//   },
//   {
//     id: '4',
//     company: 'Flipkart',
//     message: 'Your complaint has been escalated.',
//     isNew: true,
//     timestamp: '2024-03-14T10:15:00Z',
//     type: 'warning'
//   },
//   {
//     id: '5',
//     company: 'Swiggy',
//     message: 'New update on your complaint.',
//     isNew: true,
//     timestamp: '2024-03-14T09:00:00Z',
//     type: 'info'
//   },
//   {
//     id: '6',
//     company: 'Bharti Airtel',
//     message: 'Your complaint has been resolved.',
//     isNew: false,
//     timestamp: '2024-03-10T09:15:00Z',
//     type: 'success'
//   },
//   {
//     id: '7',
//     company: 'IRCTC',
//     message: 'Your complaint is under review.',
//     isNew: false,
//     timestamp: '2024-03-09T14:20:00Z',
//     type: 'pending'
//   },
//   {
//     id: '8',
//     company: 'Zomato',
//     message: 'Complaint status: In Progress',
//     isNew: false,
//     timestamp: '2024-03-08T11:20:00Z',
//     type: 'info'
//   },
//   {
//     id: '9',
//     company: 'PhonePe',
//     message: 'Your complaint requires additional information.',
//     isNew: false,
//     timestamp: '2024-03-07T16:45:00Z',
//     type: 'warning'
//   },
//   {
//     id: '10',
//     company: 'Uber',
//     message: 'Immediate attention needed on your complaint.',
//     isNew: false,
//     timestamp: '2024-03-06T13:30:00Z',
//     type: 'urgent'
//   },
//   {
//     id: '11',
//     company: 'Myntra',
//     message: 'Your complaint has been acknowledged.',
//     isNew: false,
//     timestamp: '2024-03-05T10:20:00Z',
//     type: 'info'
//   },
//   {
//     id: '12',
//     company: 'Ola',
//     message: 'Your complaint has been successfully resolved.',
//     isNew: false,
//     timestamp: '2024-03-04T09:15:00Z',
//     type: 'success'
//   }
// ];

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return <CheckCircle2 className="w-8 h-8 text-green-500" />;
    case 'pending':
      return <Clock className="w-8 h-8 text-blue-500" />;
    case 'urgent':
      return <AlertOctagon className="w-8 h-8 text-red-500" />;
    case 'warning':
      return <ShieldAlert className="w-8 h-8 text-orange-500" />;
    case 'info':
      return <AlertCircle className="w-8 h-8 text-gray-500" />;
  }
};

export const getNewNotificationsCount = async () => {
  try {
    const response = await axios.get(`${config.backendBaseUrl}/api/notifications/count`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    // Make sure this matches your backend response structure
    return response.data.data || 0;
  } catch (error) {
    console.error('Failed to get notifications count:', error);
    return 0;
  }
};

export const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const { refreshNotifications } = useNotifications();

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${config.backendBaseUrl}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setNotifications(response.data.data);
      setError(null);
    } catch (err) {
      setError(err);
      toast.error('Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllAsReadMutation = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${config.backendBaseUrl}/api/notifications/mark-all-as-read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchNotifications();
      await refreshNotifications();
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast.error('Failed to mark notifications as read');
    }
  };

  const newNotifications = notifications?.filter(n => !n.isRead) || [];
  const earlierNotifications = notifications?.filter(n => n.isRead) || [];

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-yellow-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 via-purple-500 to-yellow-500 shadow-sm">
        <div className="max-w-full mx-6 px-2">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button 
                onClick={() => navigate(-1)}
                className="text-white hover:text-yellow-100 transition-colors duration-300"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold text-white ml-4">Notifications</h1>
            </div>
            {newNotifications.length > 0 && (
              <button
                onClick={markAllAsReadMutation}
                disabled={isLoading}
                className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-100 to-purple-100 
                           text-orange-700 hover:from-orange-200 hover:to-purple-200 
                           transition-all duration-300 flex items-center gap-1.5 
                           disabled:opacity-70 disabled:cursor-not-allowed
                           shadow-sm hover:shadow-md active:scale-95"
              >
                {isLoading ? (
                  <>
                    <svg 
                      className="animate-spin h-3 w-3 text-orange-600" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24"
                    >
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                      />
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Marking...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Mark all read</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <SimpleBar 
            className="max-h-[calc(100vh-12rem)]"
            style={{
              "--simplebar-track-background-color": "#FEF3C7",
              "--simplebar-scrollbar-background-color": "#FDBA74",
            } as React.CSSProperties}
          >
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertOctagon className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <p className="text-gray-600">Something went wrong. Please try again later.</p>
              </div>
            ) : (!newNotifications?.length && !earlierNotifications?.length) ? (
              <div className="text-center py-12">
                <div className="bg-gradient-to-r from-orange-100 to-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No notifications yet
                </h3>
                <p className="text-gray-500 text-sm max-w-sm mx-auto">
                  When you receive notifications, they will appear here. Check back later!
                </p>
              </div>
            ) : (
              <>
                {/* New Notifications */}
                {newNotifications.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-sm font-medium text-gray-500 mb-4">New</h2>
                    <div className="space-y-4">
                      {newNotifications.map(notification => (
                        <div 
                          key={notification._id}
                          className="bg-gradient-to-r from-white to-orange-50 rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300 border border-orange-100"
                        >
                          <div className="flex items-start gap-3 md:gap-4">
                            <div className={`p-2 rounded-full ${
                              notification.type === 'success'
                              ? 'bg-gradient-to-r from-green-100 to-emerald-200'
                              : notification.type === 'warning'
                              ? 'bg-gradient-to-r from-yellow-100 to-orange-200'
                              : 'bg-gradient-to-r from-orange-100 to-purple-100'
                            }`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{notification.name}</p>
                              <p className="text-gray-700 text-sm md:text-base">{notification.message}</p>
                              <p className="text-xs md:text-sm text-gray-500 mt-1">
                                {formatTimestamp(notification.date)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Earlier Notifications */}
                {earlierNotifications.length > 0 && (
                  <div>
                    <h2 className="text-sm font-medium text-gray-500 mb-4">Earlier</h2>
                    <div className="space-y-4">
                      {earlierNotifications.map(notification => (
                        <div 
                          key={notification._id}
                          className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-3 md:gap-4">
                            {getNotificationIcon(notification.type)}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{notification.company}</p>
                              <p className="text-gray-700 text-sm md:text-base">{notification.message}</p>
                              <p className="text-xs md:text-sm text-gray-500 mt-1">
                                {formatTimestamp(notification.date)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </SimpleBar>
        </div>
      </div>
    </div>
  );
}; 
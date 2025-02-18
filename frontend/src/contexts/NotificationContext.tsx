import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { config } from '../config';

interface NotificationContextType {
  unreadCount: number;
  isLoading: boolean;
  error: unknown;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  isLoading: false,
  error: null,
  refreshNotifications: async () => {}
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${config.backendBaseUrl}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const notifications = response.data.data;
      const unreadCount = notifications?.filter(n => !n.isRead).length || 0;
      setUnreadCount(unreadCount);
      setError(null);
    } catch (err) {
      setError(err);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{ 
      unreadCount, 
      isLoading, 
      error,
      refreshNotifications: fetchNotifications 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext); 
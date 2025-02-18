import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from "react-hot-toast";
import { config } from '../config';

interface TweetData {
  description: string;
  company: string;
  category: string;
  date: string;
  complaint_id?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (phoneNumber: string) => Promise<void>;
  logout: () => Promise<void>;
  user: User | null;
  createUser: (updates: Partial<User>) => void;
  setAuthState: (user: User, token: string) => void;
  isLoading: boolean;
  tweetData: TweetData | null;
  setTweetData: (data: TweetData | null) => void;
}

interface User {
  phone: string;
  name?: string;
  email?: string;
  gender?: string;
  profileImage?: string | null;
  singleSignOn?: boolean;
  profileCompleted: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!user);
  const [isLoading, setIsLoading] = useState(true);
  const [tweetData, setTweetData] = useState<TweetData | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verify token and get user data
          const response = await fetch(`${config.backendBaseUrl}/api/auth/verify`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log("🚀⚡👨‍💻🚀 ~ initializeAuth ~ response🚀🔥🚀➢", response)
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      setIsAuthenticated(false);
    }
  }, [user]);

  const login = async (phone: string) => {
    try {
      const response = await fetch(`${config.backendBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      setUser(data.user);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      return data;
    } catch (error) {
      setIsAuthenticated(false);
      console.error('Error during login:', error);
      // toast.error(error instanceof Error ? error.message : 'Login failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      toast.success("Logout successful");
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error("Logout failed");
    }
  };

  const createUser = async (creates: Partial<User>) => {
    try {
      const response = await fetch(`${config.backendBaseUrl}/api/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(creates),
      });

      if (!response.ok) {
        return false;  // or throw an error
      }

      const responseData = await response.json();
      // Extract the user object, prioritizing the nested 'user' key
      const createdUser = responseData.user || responseData;

      // Ensure profileCompleted is a boolean
      const processedUser = {
        ...createdUser,
        profileCompleted: !!createdUser.profileCompleted
      };

      setUser(processedUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(processedUser));
      return true;
    } catch (error) {
      console.error('Error creating user:', error);
      return false;
    }
  };

  const setAuthState = (user: User, token: string) => {
    setUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      login,
      logout,
      createUser,
      setAuthState,
      isLoading,
      tweetData,
      setTweetData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
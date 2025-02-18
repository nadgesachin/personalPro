import React, { createContext, useContext } from 'react';
import toast from "react-hot-toast";
import { config } from '../config';

interface OtpContextType {
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<any>;
  resendOtp: (phone: string) => Promise<void>;
}

const OtpContext = createContext<OtpContextType | undefined>(undefined);

export const OtpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const sendOtp = async (phone: string) => {
    try {
      const response = await fetch(`${config.backendBaseUrl}/api/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({phone}),
      });

      if (!response.ok) {
        throw new Error('Failed to sendOTP');
      }
      // Handle success (e.g., show a message)
      console.log('OTP sent successfully response', response);
      const otp = await response.json();
      toast.success(`OTP sent successfully: ${otp.otp}`);
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error("Failed to send OTP");
    }
  };

  const resendOtp = async (phone: string): Promise<void> => {
    try {
      const response = await fetch(`${config.backendBaseUrl}/api/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(data.message);
        }
        throw new Error(data.message || 'Failed to resend OTP');
      }

      toast.success(data.message);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to resend OTP');
      }
      throw error;
    }
  };

  const verifyOtp = async (phone: string, otp: string) => {
    try {
      const response = await fetch(`${config.backendBaseUrl}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otp }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'OTP verification failed');
      }

      const data = await response.json();
      toast.success("OTP verified successfully");
      return data;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred during OTP verification');
      }
      throw error;
    }
  };

  return (
    <OtpContext.Provider value={{ sendOtp, verifyOtp, resendOtp }}>
      {children}
    </OtpContext.Provider>
  );
};

export const useOtp = () => {
  const context = useContext(OtpContext);
  if (!context) {
    throw new Error('useOtp must be used within an OtpProvider');
  }
  return context;
};
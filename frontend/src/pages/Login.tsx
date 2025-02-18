import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Megaphone } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../contexts/AuthContext';
import { useOtp } from '../contexts/OtpContext';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { config } from '../config';
console.log("🚀⚡👨‍💻🚀 ~ config🚀🔥🚀➢", config)

export const Login: React.FC = () => {
  const { login, isAuthenticated, user, setAuthState, isLoading: authLoading } = useAuth();
  const { sendOtp, verifyOtp, resendOtp } = useOtp();
  const location = useLocation();
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState(
    user?.phone?.replace('+91', '') || ''
  );
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // State for error messages
  const [timer, setTimer] = useState<number | null>(null);
  const intervalRef = useRef<number>();
  const [isVerifying, setIsVerifying] = useState(false); // Add this near other state declarations

  // Update the authentication check
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      if(user?.singleSignOn && user?.profileCompleted && user?.phone) {
        navigate('/home', { replace: true });
      } else {
        const destination = user?.profileCompleted ? '/home' : '/profile';
        navigate(destination, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, authLoading]);

  // Add this useEffect for cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Add this function to handle timer
  const startTimer = () => {
    setTimer(10);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  // Don't render anything while auth is loading
  if (authLoading) {
    return null;
  }

  // Only render login page if not authenticated
  if (isAuthenticated) {
    return null;
  }

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length === 10) {
      setIsOtpSent(true);
      await sendOtp(phoneNumber);
      startTimer(); // Start timer after sending OTP
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 3) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length === 10 && !timer) {
      try {
        await resendOtp(phoneNumber);
        setOtp(['', '', '', '']);
        startTimer(); // Start timer after resending OTP
      } catch (error) {
        console.error('Resend failed:', error);
      }
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join('').length === 4) {
      setIsVerifying(true); // Start loading
      try {
        const otpResponse = await verifyOtp(phoneNumber, otp.join(''));
        console.log("🚀⚡👨‍💻🚀 ~ handleOtpSubmit ~ otpResponse🚀🔥🚀➢", otpResponse)

        if (otpResponse.loggedIn) {
          await login(phoneNumber);
          toast.success('Login successful');
          navigate('/home', { replace: true });
        } else {
          // For new users, don't try to login - just set initial state and redirect
          setAuthState(
            {
              _id: otpResponse.userId,
              phone: `+91${phoneNumber}`,
              profileCompleted: false
            },
            otpResponse.token
          );
          navigate('/profile', {
            replace: true,
            state: {
              phoneNumber: `+91${phoneNumber}`,
              isNewUser: true
            }
          });
        }
      } catch (error: any) {
        if (error.response) {
          toast.error('Verification failed');
        } else if (error.request) {
          toast.error('No response from server. Please try again.');
        }

        setOtp(['', '', '', '']);
      } finally {
        setIsVerifying(false); // Stop loading regardless of outcome
      }
    } else {
      toast.error('Please enter a 4-digit OTP');
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    const { credential } = credentialResponse;
    try {
      const res = await fetch(`${config.backendBaseUrl}/api/auth/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken: credential }),
      });
      const data = await res.json();
      if (data.token && data.user) {
        // Update AuthContext state
        setAuthState(data.user, data.token);
        // Check if phone number exists
        if (!data.user.phone) {
          // Redirect to profile page if phone number is missing
          toast.success('Please complete your profile');
          navigate('/profile', { replace: true });
        } else {
          // Redirect to home page if phone number exists
          toast.success('Login successful');
          navigate('/home', { replace: true });
        }
      }
    } catch (error) {
      toast.error('Google login failed');
    }
  };

  const handleGoogleFailure = () => {
    console.error('Google login failed');
    toast.error('Google login failed');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-8">
        <div className="text-center">
          <div className="inline-block p-3 rounded-2xl bg-gradient-to-r from-orange-500 via-purple-500 to-yellow-500 text-white mb-4">
            <Megaphone size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome to</h1>
          <div className="text-3xl font-bold text-orange-500">
            Speak Up<span className="text-black">!</span>
          </div>
          <p className="text-gray-600 mt-3">Log in or Sign up to continue</p>
        </div>
        {errorMessage && (
          <div className="text-red-500 text-center mb-4">{errorMessage}</div> // Display error message
        )}
        {!isOtpSent ? (
          <form onSubmit={handleContinue} className="space-y-6">
            <div className="flex border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 text-gray-500 border-r border-gray-200">
                +91
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Enter your Mobile Number"
                className="flex-1 px-4 py-3 focus:outline-none"
                maxLength={10}
              />
            </div>

            <button
              type="submit"
              disabled={phoneNumber.length !== 10}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-purple-500 text-white rounded-xl
                       disabled:opacity-50 disabled:cursor-not-allowed hover:from-orange-600 hover:to-purple-600
                       transition-all duration-300"
            >
              CONTINUE
            </button>

            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm text-gray-500">OR</span>
              </div>
            </div>

            <div className="w-full flex justify-center">
              {/* <div className="w-full max-w-[384px] transform transition-transform duration-200 hover:scale-105 hover:shadow-md rounded-md"> */}
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleFailure}
                  useOneTap
                  type="standard"
                  width="100%"
                  theme="outline"
                  size="large"
                  shape="circle"
                />
              </div>
            {/* </div> */}
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-3">OTP Verification</h2>
              <p className="text-gray-600 mb-6">
                Enter the OTP sent to +91 {phoneNumber}
              </p>
            </div>

            <div className="flex gap-3 justify-center mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  className="w-12 h-12 text-center text-xl border border-gray-200 rounded-lg
                           focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={otp.join('').length !== 4 || isVerifying}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-purple-500 text-white rounded-xl
                       disabled:opacity-50 disabled:cursor-not-allowed hover:from-orange-600 hover:to-purple-600
                       transition-all duration-300"
            >
              {isVerifying ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Verifying...
                </div>
              ) : (
                'VERIFY'
              )}
            </button>

            <div className="text-center mt-4">
              <p className="text-gray-600 mb-2">Didn't receive the OTP?</p>
              <button
                type="button"
                onClick={handleResend}
                className={`text-orange-500 font-medium hover:text-orange-600 ${
                  timer ? 'cursor-not-allowed opacity-50' : ''
                }`}
              >
                {timer ? `Resend OTP in ${timer}s` : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}

        <div className="text-center mt-8 text-sm text-gray-500">
          V. 1.0.2
        </div>
      </div>
    </div>
  );
};
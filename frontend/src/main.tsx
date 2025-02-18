import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import App from './App';
import Home from './pages/Home';
import { Login } from './pages/Login';
import './index.css';
import { ComplaintsSearch } from './components/ComplaintsSearch';
import { Settings } from './components/Settings';
import { Legal } from './components/settings/Legal';
import { FAQ } from './components/settings/FAQ';
import { About } from './components/settings/About';
import { Feedback } from './components/settings/Feedback';
import { HowTo } from './components/settings/HowTo';
import { Profile } from './pages/Profile';
import { Notifications } from './pages/Notifications';
import { OtpProvider } from './contexts/OtpContext';
import { FeedbackProvider } from './contexts/FeedbackContext';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { TweetInput } from './components/TweetInput';

const clientId = "267677797844-kst0djv3krn1qcov197vdr09fv3r8ouc.apps.googleusercontent.com";
import { TwitterConnect } from './components/TwitterConnect';

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <OtpProvider>
          <FeedbackProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />

                {/* Protected Routes */}
                <Route path="/home" element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/notifications" element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                } />
                <Route path="/smart-complaint" element={
                  <ProtectedRoute>
                    <App />
                  </ProtectedRoute>
                } />
                <Route path="/smart-complaint/twitter" element={
                  <ProtectedRoute>
                    <TwitterConnect />
                  </ProtectedRoute>
                } />
                <Route path="/smart-complaint/twitter/compose" element={
                  <ProtectedRoute>
                    <TweetInput />
                  </ProtectedRoute>
                } />
                <Route path="/history" element={
                  <ProtectedRoute>
                    <ComplaintsSearch />
                  </ProtectedRoute>
                } />
                <Route path="/settings/*" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
                <Route path="/settings/legal" element={<Legal />} />
                <Route path="/settings/faqs" element={<FAQ />} />
                <Route path="/settings/about" element={<About />} />
                <Route path="/settings/feedback" element={<Feedback />} />
                <Route path="/settings/howto" element={<HowTo />} />
              </Routes>
            </BrowserRouter>
            <Toaster
              position="bottom-center"
              toastOptions={{
                success: {
                  style: {
                    background: 'green',
                    color: 'white',
                  },
                },
                error: {
                  style: {
                    background: 'red',
                    color: 'white',
                  },
                },
              }}
            />
          </FeedbackProvider>
        </OtpProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  // </React.StrictMode>
);

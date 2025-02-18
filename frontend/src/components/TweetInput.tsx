import React, { useState, useEffect } from 'react';
import { Send, ArrowLeft, Loader, Twitter } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { config } from '../config';
import { useAuth } from '../contexts/AuthContext';

export const TweetInput: React.FC = () => {
  const location = useLocation();
  const [tweet, setTweet] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { tweetData, setTweetData } = useAuth();

  useEffect(() => {
    // Check both location state and context for tweet data
    const data = location.state || tweetData;

    if (data?.description && data?.company && data?.category && data?.date) {
      const formattedTweet = `Complaint Description: ${data.description}. This is related to: #${data.company.replace(/\s+/g, '')} and falls under the category of: #${data.category}.`;
      setTweet(formattedTweet);

      // Clear the tweet data from context after using it
      if (tweetData) {
        setTweetData(null);
      }
    }
  }, [location, tweetData, setTweetData]);

  const handleTweetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Trim the tweet and check if it's empty
    const tweetContent = tweet.trim();
    if (!tweetContent) {
      toast.error('Please enter some text before tweeting');
      return;
    }

    try {
      setLoading(true);
      const accessToken = localStorage.getItem('accessToken');
      // Get complaint_id from location state or context
      const data = location.state || tweetData;
      const complaint_id = data?.complaint_id;

      await axios.post(`${config.backendBaseUrl}/api/twitter/tweet`,
        {
          message: tweetContent,
          accessToken,
          complaint_id  // Include complaint_id in the request body
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      toast.success('Tweet posted successfully!');
      navigate('/smart-complaint/twitter');
    } catch (error) {
      console.log("handleTweetSubmit error: ", error);
      toast.error('Failed to post tweet');
    } finally {
      setLoading(false);
    }
  };

  // Also add a keydown handler to prevent form submission on Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!tweet.trim()) {
        toast.error('Please enter some text before tweeting');
        return;
      }
      handleTweetSubmit(e as any);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-yellow-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-orange-500 via-purple-500 to-yellow-500 shadow-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/smart-complaint/twitter')}
                className="text-white hover:text-orange-100 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-2">
                <Twitter className="w-6 h-6 text-white" />
                <h1 className="text-xl font-bold text-white">Compose Tweet</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Header */}
      <div className="bg-gradient-to-r from-orange-500 via-purple-500 to-yellow-500 shadow-sm p-6 pb-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Share Your Thoughts</h2>
          <p className="text-orange-100">
            Let your voice be heard. Share your feedback with the community.
          </p>
        </div>
      </div>

      {/* Tweet Form */}
      <div className="max-w-3xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleTweetSubmit} className="space-y-4">
            <textarea
              value={tweet}
              onChange={(e) => setTweet(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What's happening?"
              className="w-full p-4 border border-gray-200 rounded-xl resize-none h-40
                       focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none
                       transition-all duration-200 overflow-y-auto
                       scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-orange-100
                       hover:scrollbar-thumb-orange-400"
              maxLength={280}
              style={{
                '--scrollbar-track-background-color': '#FEF3C7',
                '--scrollbar-thumb-background-color': '#FDBA74',
              } as React.CSSProperties}
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">{tweet.length}/280</span>
              <button
                type="submit"
                disabled={loading || !tweet.trim()}
                className="bg-gradient-to-r from-orange-500 to-purple-500 text-white
                         px-6 py-2 rounded-lg hover:shadow-md transition-all duration-300
                         disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2
                         min-w-[120px] justify-center"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Tweet</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
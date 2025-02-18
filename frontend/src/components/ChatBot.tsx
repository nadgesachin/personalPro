import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Category } from '../types';
import { getSuggestedCategories } from '../utils/nlp';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  categories?: Category[];
  selectedCategory?: Category;
  companies?: any[];
  selectedCompanyId?: string;
  options?: string[];
}

interface ChatBotProps {
  categories: Category[];
  onCategorySelect: (categoryId: string) => void;
  onCompanySelect: (categoryId: string, companyId: string) => void;
  setStep: (step: number) => void;
  setIsChatOpen: (isOpen: boolean) => void;
}

const TypingIndicator: React.FC = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return <span>{dots}</span>;
};

const ChatBot: React.FC<ChatBotProps> = ({ categories, onCategorySelect, onCompanySelect, setStep, setIsChatOpen }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isModelWarmedUp, setIsModelWarmedUp] = useState(false);

  useEffect(() => {
    if (messages.length === 0) {
      const initialMessage: Message = {
        id: Date.now().toString(),
        text: "Hello! I'm your AI assistant. Please describe your problem, and I'll help you find the right solution.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages([initialMessage]);
    }
  }, []);

  useEffect(() => {
    document.body.classList.add('blur-background');
    return () => {
      document.body.classList.remove('blur-background');
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const warmUpModel = async () => {
      const maxRetries = 3;
      let retryCount = 0;

      const tryWarmUp = async (): Promise<boolean> => {
        try {
          const apiKey = "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";
          const model = "microsoft/DialoGPT-small";  // Lightweight dialogue model

          const response = await fetch(
            `https://api-inference.huggingface.co/models/${model}`,
            {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                inputs: "Hello",
                wait_for_model: true
              })
            }
          );

          if (!response.ok) {
            const error = await response.json();
            if (error.error?.includes('Model is loading')) {
              throw new Error('Model still loading');
            }
            throw new Error(`API error: ${response.status}`);
          }

          await response.json(); // Verify we can parse the response
          return true;
        } catch (error) {
          console.warn(`Warm-up attempt ${retryCount + 1} failed:`, error);
          return false;
        }
      };

      while (retryCount < maxRetries) {
        const success = await tryWarmUp();
        if (success) {
          setIsModelWarmedUp(true);
          return;
        }
        retryCount++;
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s between retries
        }
      }

      console.error('Model warm-up failed after maximum retries');
    };

    warmUpModel();
  }, []);

  const generateBotResponse = async (userInput: string) => {
    setIsLoading(true);
    try {
      const apiKey = `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`;
      const model = "microsoft/DialoGPT-small";  // Lightweight dialogue model

      const response = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: userInput }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        if (error.error?.includes('Model is loading')) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          return generateBotResponse(userInput);
        }
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      let botResponse = data[0]?.generated_text || "I couldn't understand that. Could you rephrase?";

      // Clean up bot response
      botResponse = botResponse
        .replace(/^(Bot:|Assistant:|AI:)/i, '') // Remove common prefixes
        .trim();

      const suggestedCategories = getSuggestedCategories(userInput, categories);

      if (suggestedCategories.length > 0) {
        const selectedCategory = suggestedCategories[0];
        const companies = selectedCategory.companies || [];

        // Enhanced response with more context
        return {
          text: `${botResponse}\n\nBased on your complaint, I've identified some relevant categories and companies that can help address your concern:`,
          categories: suggestedCategories,
          companies: companies
        };
      }

      // If no categories found, provide a more helpful response
      return {
        text: `${botResponse}\n\nI notice that your complaint doesn't clearly match our predefined categories. Could you please provide more specific details about the service or company you're having issues with?`,
        categories: [],
        companies: []
      };

    } catch (error) {
      console.error('Error calling Hugging Face API:', error);
      const errorMessage = error instanceof Error
        ? error.name === 'AbortError'
          ? "The request took too long to respond. Please try again."
          : error.message?.includes('Model')
            ? "The AI model is still warming up. Please wait a moment and try again."
            : "I'm having trouble connecting right now. Please try again later."
        : "An unknown error occurred. Please try again.";

      return {
        text: errorMessage,
        categories: [],
        companies: []
      };
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: '',
      sender: 'bot',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, loadingMessage]);

    const response = await generateBotResponse(input);

    setMessages(prev => prev.filter(msg => msg.id !== loadingMessage.id));
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: response.text,
      sender: 'bot',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, botMessage]);

    if (response.categories.length > 0) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          text: 'CATEGORIES',
          sender: 'bot',
          timestamp: new Date(),
          categories: response.categories,
          companies: response.companies,
        } as Message & { categories: Category[]; companies: any[] },
      ]);
    }
  };

  const handleCategoryClick = (category: Category) => {
    setSelectedCategoryId(category.id);
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        text: 'COMPANIES',
        sender: 'bot',
        timestamp: new Date(),
        selectedCategory: category,
        companies: category.companies || [],
        selectedCompanyId: '',
      } as Message,
    ]);
    onCategorySelect(category.id);
    document.body.classList.add('category-selected');
  };

  const handleCompanyClick = (categoryId: string, company: any) => {
    setMessages(prev => prev.map((msg, index) => {
      if (index === prev.length - 1) {
        return {
          ...msg,
          selectedCompanyId: company.id,
        };
      }
      return msg;
    }));
    onCompanySelect(categoryId, company.id);

    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        text: "Do you want to raise a complaint?\n\nDo you want to submit the complaint?",
        sender: 'bot',
        timestamp: new Date(),
        options: ['Yes', 'No'],
      } as Message,
    ]);

    document.body.classList.add('company-selected');
  };

  const handleUserResponse = (response: string) => {
    setSelectedOption(response);
    if (response.toLowerCase() === 'yes') {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          text: "Thank you for your response. We are processing your request and closing the chat.",
          sender: 'bot',
          timestamp: new Date(),
        } as Message,
      ]);
      setTimeout(() => {
        setStep(4);
        setIsChatOpen(false);
      }, 2000);
    } else if (response.toLowerCase() === 'no') {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          text: "Okay, closing the chat.",
          sender: 'bot',
          timestamp: new Date(),
        } as Message,
      ]);
      setTimeout(() => {
        setStep(1);
        setIsChatOpen(false);
      }, 2000);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-lg shadow-xl flex flex-col">
      <div className="bg-gradient-to-r from-orange-500 to-purple-500 p-4 rounded-t-lg">
        <div className="flex items-center gap-2 text-white">
          <Bot className="w-6 h-6" />
          <h3 className="font-semibold">AI Assistant</h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`p-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-orange-500 to-purple-500 text-white'
                    : 'bg-gray-100'
                }`}>
                  <p className="text-sm bg-remove">
                    {message.text === '' && message.sender === 'bot' ? (
                      <TypingIndicator />
                    ) : message.text === 'CATEGORIES' ? (
                      <div className="mt-2 space-y-2">
                        {(message as any).categories?.map((category: Category) => (
                          <button
                            key={category.id}
                            onClick={() => handleCategoryClick(category)}
                            className={`block w-full text-left p-2 rounded transition-colors ${
                              selectedCategoryId === category.id
                                ? 'bg-orange-100 text-orange-700 font-medium'
                                : 'bg-white hover:bg-gray-50'
                            }`}
                          >
                            {category.name}
                          </button>
                        ))}
                      </div>
                    ) : message.text === 'COMPANIES' ? (
                      <div className="mt-2 space-y-2">
                        <div className="font-medium mb-2">
                          Companies in {message.selectedCategory?.name}:
                        </div>
                        {message.companies?.map((company) => (
                          <div
                            key={company.id}
                            onClick={() => handleCompanyClick(message.selectedCategory?.id || '', company)}
                            className={`text-sm p-2 rounded cursor-pointer transition-colors ${
                              message.selectedCompanyId === company.id
                                ? 'bg-orange-100 text-orange-700 font-medium'
                                : 'bg-white hover:bg-gray-50 text-gray-600'
                            }`}
                          >
                            {company.name}
                          </div>
                        ))}
                      </div>
                    ) : message.options ? (
                      <div className="mt-2 space-y-2">
                        <div className="font-medium mb-2">
                          Do you want to raise a complaint?
                        </div>
                        {message.options.map((option) => (
                          <button
                            key={option}
                            onClick={() => handleUserResponse(option)}
                            className={`block w-full text-left p-2 rounded transition-colors ${
                              selectedOption === option
                                ? 'bg-orange-100 text-orange-700 font-medium'
                                : 'bg-white hover:bg-gray-50'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    ) : (
                      message.text
                    )}
                  </p>
                </div>
                {message.sender === 'user' ? (
                  <User className="w-6 h-6 text-purple-500" />
                ) : (
                  <Bot className="w-6 h-6 text-orange-500" />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-purple-500 text-white disabled:opacity-50"
          >
            {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBot;
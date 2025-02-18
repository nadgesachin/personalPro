import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { VoiceRecognitionState } from '../types';

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: () => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface VoiceInputProps {
  onTranscriptChange: (text: string) => void;
  onStateChange?: (state: VoiceRecognitionState) => void;
  onTranscriptComplete?: () => void;
  onRecognitionEnd?: () => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English' },
  { code: 'hi-IN', name: 'Hindi' },
];

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscriptChange, onStateChange = () => {}, onTranscriptComplete = () => {}, onRecognitionEnd = () => {} }) => {
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [state, setState] = useState<VoiceRecognitionState>({
    isListening: false,
    transcript: '',
    error: null,
    language: 'en-US'
  });
  
  const timeoutRef = useRef<number>();
  const transcriptRef = useRef<string>('');
  const isProcessingRef = useRef<boolean>(false);
  const finalResultRef = useRef<boolean>(false);

  const updateState = useCallback((updates: Partial<VoiceRecognitionState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      onStateChange(newState);
      return newState;
    });
  }, [onStateChange]);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = state.language;

      recognitionInstance.onstart = () => {
        transcriptRef.current = '';
        isProcessingRef.current = false;
        finalResultRef.current = false;
        updateState({ isListening: true, error: null });
      };

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map(result => (result[0] as SpeechRecognitionAlternative))
          .map(result => result.transcript)
          .join('');
        
        transcriptRef.current = transcript;
        updateState({ transcript });
        onTranscriptChange(transcript);

        const isFinal = event.results[event.results.length - 1].isFinal;
        if (isFinal) {
          finalResultRef.current = true;
        }
      };

      recognitionInstance.onend = () => {
        updateState({ isListening: false });        
        setTimeout(() => {
          const finalTranscript = transcriptRef.current.trim();
          if (finalTranscript) {
            isProcessingRef.current = true;
            onTranscriptChange(finalTranscript);
            setTimeout(() => {
              onTranscriptComplete();
              onRecognitionEnd();
            }, 200);
          }
        }, 300);
      };

      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        updateState({
          error: `Recognition error: ${event.error}`,
          isListening: false
        });
      };

      setRecognition(recognitionInstance);
    }
  }, [state.language, onTranscriptChange, updateState, onTranscriptComplete, onRecognitionEnd]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognition) return;

    if (state.isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const changeLanguage = (lang: string) => {
    if (state.isListening) {
      recognition?.stop();
    }
    updateState({ language: lang });
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={toggleListening}
            className={`p-2 rounded-full transition-all duration-300 ${
              state.isListening 
                ? 'bg-gradient-to-r from-orange-100 to-purple-100 text-purple-600 hover:from-orange-200 hover:to-purple-200'
                : 'bg-white text-purple-500 hover:bg-gradient-to-r hover:from-orange-50 hover:to-purple-50'
            }`}
            aria-label={state.isListening ? 'Stop voice input' : 'Start voice input'}
          >
            {state.isListening ? (
              <MicOff className="h-5 w-5 animate-pulse" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </button>

          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 
                        bg-gradient-to-r from-purple-600 to-orange-600 text-white text-xs rounded-lg 
                        shadow-lg opacity-0 transition-opacity group-hover:opacity-100">
            {state.isListening ? 'Stop Recording' : 'Start Recording'}
          </div>
        </div>

        <select
          value={state.language}
          onChange={(e) => changeLanguage(e.target.value)}
          className="p-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {SUPPORTED_LANGUAGES.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      <AnimatePresence>
        {state.isListening && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-sm text-gray-600"
          >
            <Volume2 className="w-4 h-4 animate-pulse" />
            Listening...
          </motion.div>
        )}
        {state.error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-red-500"
          >
            {state.error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceInput;
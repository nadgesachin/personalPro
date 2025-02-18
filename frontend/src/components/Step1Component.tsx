import React from 'react';
import { motion } from 'framer-motion';
import VoiceInput from './VoiceInput';

interface Step1ComponentProps {
  complaintText: string;
  setComplaintText: (text: string) => void;
  handleKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleVoiceTranscript: (transcript: string) => void;
  setStep: (step: number) => void;
}

const Step1Component: React.FC<Step1ComponentProps> = ({
  complaintText,
  setComplaintText,
  handleVoiceTranscript,
  setStep,
}) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter') {
      if (event.shiftKey) {
        // Allow line break with Shift+Enter
        return;
      }
      // Prevent default Enter behavior
      event.preventDefault();
      
      // Only proceed to next step if there's text content
      if (complaintText.trim()) {
        setStep(2);
      }
    }
  };

  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex gap-4">
        <div className="flex-1">
          <textarea
            value={complaintText}
            onChange={(e) => setComplaintText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your complaint..."
            className="w-full h-32 p-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none
            scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-orange-100 hover:scrollbar-thumb-orange-400
            overflow-y-auto"
            style={{
              '--scrollbar-track-background-color': '#FEF3C7',
              '--scrollbar-thumb-background-color': '#FDBA74',
            } as React.CSSProperties}
          />
        </div>
        <VoiceInput
          onTranscriptChange={handleVoiceTranscript}
          onStateChange={(state) => {
            console.log('Recording state:', state);
          }}
          onTranscriptComplete={() => {
            if (complaintText.trim()) {
              setStep(2);
            }
          }}
          onRecognitionEnd={() => {
            setStep(2);
          }}
        />
      </div>
    </motion.div>
  );
}

export default Step1Component; 
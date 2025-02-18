import React from 'react';
import { Check } from 'lucide-react';
import { ComplaintStep } from '../types';

interface ProgressStepsProps {
  steps: ComplaintStep[];
  currentStep: number;
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({ steps, currentStep }) => {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gradient-to-r from-orange-200 via-purple-200 to-yellow-200 -translate-y-1/2" />
        
        {steps.map((step, index) => {
          const isCompleted = currentStep > index + 1;
          const isCurrent = currentStep === index + 1;
          
          return (
            <div
              key={step.id}
              className="relative flex flex-col items-center group"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? 'bg-gradient-to-r from-orange-500 to-purple-500'
                    : isCurrent
                    ? 'bg-gradient-to-r from-purple-500 to-yellow-500'
                    : 'bg-gradient-to-r from-gray-200 to-gray-300'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 text-white animate-pulse" />
                ) : (
                  <span className={`text-sm font-medium ${
                    isCurrent ? 'text-white' : 'text-gray-500'
                  }`}>
                    {index + 1}
                  </span>
                )}
              </div>
              
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-purple-600 to-orange-600 text-white text-sm rounded-lg px-3 py-1.5 whitespace-nowrap shadow-lg">
                {step.title}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressSteps;
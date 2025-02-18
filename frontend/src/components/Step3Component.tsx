import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import CompanySelector from "./CompanySelector";
import { Company } from "../types";

interface Step3ComponentProps {
  getSelectedCategoryCompanies: () => Company[];
  selectedCompany: string | null;
  setSelectedCompany: (companyId: string) => void;
  setStep: (step: number) => void;
  handleNextStep: () => void;
}

const Step3Component: React.FC<Step3ComponentProps> = ({
  getSelectedCategoryCompanies,
  selectedCompany,
  setSelectedCompany,
  setStep,
  handleNextStep,
}) => {
  useEffect(() => {
    const warmUpModel = async () => {
      try {
        const apiKey = "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";
        if (!apiKey) return;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        await fetch(
          'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputs: "Hello",
              options: {
                use_cache: true,
                wait_for_model: false
              }
            }),
            signal: controller.signal
          }
        );

        clearTimeout(timeoutId);
      } catch (error) {
        console.warn('Model warm-up failed:', error);
      }
    };

    warmUpModel();
  }, []);

  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex justify-between">
        <button
          onClick={() => setStep(2)}
          className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:shadow-lg transition-transform duration-300 transform hover:scale-105 flex items-center gap-4 px-4 py-2 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>
      <CompanySelector
        companies={getSelectedCategoryCompanies()}
        selectedCompany={selectedCompany}
        onSelect={setSelectedCompany}
        onNextStep={handleNextStep}
      />
    </motion.div>
  );
};

export default Step3Component;

import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import CategorySelector from "./CategorySelector";
import { Category } from "../types";

interface Step2ComponentProps {
  categories: Category[];
  suggestedCategories: Category[];
  selectedCategory: string | null;
  setSelectedCategory: (categoryId: string) => void;
  setStep: (step: number) => void;
  handleNextStep: () => void;
}

const Step2Component: React.FC<Step2ComponentProps> = ({
  categories,
  suggestedCategories,
  selectedCategory,
  setSelectedCategory,
  setStep,
  handleNextStep,
}) => {
  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex justify-between">
        <button
          onClick={() => setStep(1)}
          className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:shadow-lg transition-transform duration-300 transform hover:scale-105 flex items-center gap-4 px-4 py-2 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>
      <CategorySelector
        categories={categories}
        suggestedCategories={suggestedCategories}
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
        onNextStep={handleNextStep}
      />
    </motion.div>
  );
};

export default Step2Component;

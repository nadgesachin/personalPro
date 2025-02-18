import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Loading..." 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] gap-4"
    >
      <div className="w-16 h-16 border-4 border-orange-300 border-t-orange-500 rounded-full animate-spin"></div>
      <p className="text-orange-800 font-medium">{message}</p>
    </motion.div>
  );
}; 
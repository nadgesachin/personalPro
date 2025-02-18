import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info } from 'lucide-react';
import { ToastProps } from '../types';

const Toast: React.FC<ToastProps> = ({ message, type, children }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-purple-500" />
  };

  const colors = {
    success: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200',
    error: 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200',
    info: 'bg-gradient-to-r from-orange-50 to-purple-50 border-orange-200'
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg border ${colors[type]} max-w-md`}
      >
        <div className="flex items-start gap-3">
          {icons[type]}
          <div>
            <p className="text-gray-800">{message}</p>
            {children}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Toast;
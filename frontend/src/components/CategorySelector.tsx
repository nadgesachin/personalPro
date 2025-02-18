import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Category } from '../types';
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface CategorySelectorProps {
  categories: Category[];
  suggestedCategories: Category[];
  selectedCategory: string | null;
  onSelect: (category: string) => void;
  onNextStep: () => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  suggestedCategories,
  selectedCategory,
  onSelect,
  onNextStep,
}) => {
  // Auto-select the first suggested category if there's only one
  useEffect(() => {
    if (suggestedCategories.length === 1 && !selectedCategory) {
      onSelect(suggestedCategories[0].id);
    }
  }, [suggestedCategories, selectedCategory, onSelect]);

  const handleCategoryClick = (categoryId: string) => {
    onSelect(categoryId);
    setTimeout(onNextStep, 300); // Delay to allow UI update
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 via-purple-50 to-yellow-50 p-6">
      <div className="space-y-6">
        {suggestedCategories.length > 0 && (
          <div className="bg-gradient-to-r from-orange-100 to-purple-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Suggested Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <AnimatePresence>
                {suggestedCategories.map((category) => {
                  const IconComponent = Icons[category.icon] as LucideIcon;

                  return (
                    <motion.button
                      key={category.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCategoryClick(category.id)}
                      className={`p-4 rounded-lg flex flex-col items-center gap-2 transition-colors
                        ${selectedCategory === category.id
                          ? 'bg-gradient-to-r from-orange-400 to-purple-500 text-white'
                          : 'bg-white hover:bg-gradient-to-r hover:from-orange-50 hover:to-purple-50'
                        }`}
                    >
                      <IconComponent className={`w-8 h-8 ${
                        selectedCategory === category.id ? 'text-white' : 'text-purple-500'
                      }`} />
                      <span className="font-medium">{category.name}</span>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">All Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <AnimatePresence>
              {categories.map((category) => {
                const IconComponent = Icons[category.icon] as LucideIcon;

                return (
                  <motion.button
                    key={category.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`p-4 rounded-lg flex flex-col items-center gap-2 transition-colors
                      ${selectedCategory === category.id
                        ? 'bg-gradient-to-r from-orange-400 to-purple-500 text-white'
                        : 'bg-white hover:bg-gradient-to-r hover:from-orange-50 hover:to-purple-50'
                      }`}
                  >
                    <IconComponent className={`w-8 h-8 ${
                      selectedCategory === category.id ? 'text-white' : 'text-purple-500'
                    }`} />
                    <span className="font-medium">{category.name}</span>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorySelector;
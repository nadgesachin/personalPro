import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Company } from '../types';
import { Building2, Search, ArrowUpDown, ArrowDown, ArrowUp } from 'lucide-react';

interface CompanySelectorProps {
  companies: Company[];
  onSelect: (companyId: string) => void;
  selectedCompany: string | null;
  onNextStep: () => void;
}

const CompanySelector: React.FC<CompanySelectorProps> = ({
  companies,
  onSelect,
  selectedCompany,
  onNextStep,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAscending, setSortAscending] = useState(true);

  const filteredAndSortedCompanies = useMemo(() => {
    const filtered = companies.filter(company =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return [...filtered].sort((a, b) =>
      sortAscending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );
  }, [companies, searchTerm, sortAscending]);

  const handleCompanyClick = (companyId: string) => {
    onSelect(companyId);
    setTimeout(onNextStep, 300); // Delay to allow UI update
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-orange-50 via-purple-50 to-yellow-50 p-6 rounded-lg">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/3 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 border border-gray-200 rounded-lg mb-4
                         focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none"
            />
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 text-sm
                       bg-gradient-to-r from-orange-500 to-purple-500
                       hover:from-orange-600 hover:to-purple-600
                       text-white rounded-lg transition-all duration-300"
            onClick={() => setSortAscending(!sortAscending)}
          >
            {sortAscending ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
            Company Sort
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAndSortedCompanies.map((company) => (
            <motion.button
              key={company.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCompanyClick(company.id)}
              className={`w-full p-4 rounded-lg flex items-center gap-4 transition-colors
                ${selectedCompany === company.id
                  ? 'bg-gradient-to-r from-orange-500 to-purple-500 text-white'
                  : 'bg-white hover:bg-gradient-to-r hover:from-orange-50 hover:to-purple-50'
                }`}
            >
              <Building2 className={`w-6 h-6 ${
                selectedCompany === company.id ? 'text-white' : 'text-purple-500'
              }`} />
              <div className="text-left">
                <h3 className="font-medium">{company.name}</h3>
                <p className={`text-sm ${
                  selectedCompany === company.id ? 'text-orange-100' : 'text-gray-500'
                }`}>
                  {/* {company.complaintCount} complaints */}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompanySelector;
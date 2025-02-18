import React from 'react';
import { Filter } from 'lucide-react';
import { SearchFilters } from '../types';

interface SearchFiltersProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  categories: string[];
  companies: string[];
}

export const SearchFiltersComponent: React.FC<SearchFiltersProps> = ({
  filters,
  onFilterChange,
  categories,
  companies,
}) => {
  return (
    <div className="bg-gradient-to-r from-orange-50 to-pink-50 p-4 rounded-lg border border-orange-200 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-orange-500" />
        <h3 className="font-semibold text-gray-800">Filters</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <select
          className="w-full px-4 py-2.5 rounded-md border border-orange-200 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50 bg-white text-gray-600"
          value={filters.category}
          onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
        >
          <option key="all-categories" value="">All Categories</option>
          {categories.map((category) => (
            <option key={`category-${category}`} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          className="w-full px-4 py-2.5 rounded-md border border-orange-200 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50 bg-white text-gray-600"
          value={filters.company}
          onChange={(e) => onFilterChange({ ...filters, company: e.target.value })}
        >
          <option key="all-companies" value="">All Companies</option>
          {companies.map((company) => (
            <option key={`company-${company}`} value={company}>
              {company}
            </option>
          ))}
        </select>

        <select
          className="w-full px-4 py-2.5 rounded-md border border-orange-200 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50 bg-white text-gray-600"
          value={filters.status}
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="resolved">Resolved</option>
          <option value="pending">Pending</option>
        </select>

        <input
          type="date"
          className="w-full px-4 py-2.5 rounded-md border border-orange-200 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50 bg-white text-gray-600"
          value={filters.startDate}
          onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
        />

        <input
          type="date"
          className="w-full px-4 py-2.5 rounded-md border border-orange-200 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50 bg-white text-gray-600"
          value={filters.endDate}
          onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
        />
      </div>
    </div>
  );
};
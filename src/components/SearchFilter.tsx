import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button, Card, Input, Select } from './ui';

export interface SearchFilterOption {
  key: string;
  label: string;
  options: Array<{ value: string; label: string }>;
}

interface SearchFilterProps {
  onSearch: (query: string) => void;
  onFilter: (filters: Record<string, string>) => void;
  placeholder?: string;
  filters?: SearchFilterOption[];
}

const SearchFilter = ({
  onSearch,
  onFilter,
  placeholder = 'Search…',
  filters = [],
}: SearchFilterProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...activeFilters, [key]: value };
    if (!value) {
      delete newFilters[key];
    }
    setActiveFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    setActiveFilters({});
    onFilter({});
  };

  const activeFilterCount = Object.keys(activeFilters).filter((k) => activeFilters[k]).length;

  return (
    <Card className="rounded-2xl p-3 sm:p-4 mb-5 sm:mb-6">
      <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none"
            aria-hidden
          />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={placeholder}
            className="pl-10 pr-4 py-2.5 text-sm"
          />
        </div>

        {filters.length > 0 && (
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="ghost"
              className={`w-full sm:w-auto justify-center sm:justify-start flex items-center px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                showFilters
                  ? 'border-primary-500 text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30'
                  : 'border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Filter className="w-4 h-4 mr-2" aria-hidden />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-2 bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full tabular-nums">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            {activeFilterCount > 0 && (
              <Button
                onClick={clearFilters}
                variant="ghost"
                className="w-full sm:w-auto justify-center sm:justify-start flex items-center px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
              >
                <X className="w-4 h-4 mr-1" aria-hidden />
                Clear
              </Button>
            )}
          </div>
        )}
      </div>

      {showFilters && filters.length > 0 && (
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter) => (
              <div key={filter.key}>
                <label
                  htmlFor={`filter-${filter.key}`}
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  {filter.label}
                </label>
                <Select
                  id={`filter-${filter.key}`}
                  value={activeFilters[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="px-3 py-2.5 text-sm"
                >
                  <option value="">All</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default SearchFilter;

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BusinessSearch } from '@/components/business-search';
import { SuggestionsDropdown } from '@/components/suggestions-dropdown';
import { useDebounce } from '@/hooks/use-debounce';
import { BusinessSuggestion } from '@/lib/types';
import logo from '@assets/Whitebrd Co Logo_1754624175913.png';

interface LandingPageProps {
  onBusinessSelect: (business: BusinessSuggestion) => void;
}

export function LandingPage({ onBusinessSelect }: LandingPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedQuery = useDebounce(searchQuery, 300);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['/api/search/businesses', debouncedQuery],
    enabled: debouncedQuery.length >= 2,
    queryFn: async () => {
      const response = await fetch(`/api/search/businesses?q=${encodeURIComponent(debouncedQuery)}`);
      const data = await response.json();
      return data.results || [];
    }
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowSuggestions(value.length >= 2);
  };

  const handleBusinessSelect = (business: BusinessSuggestion) => {
    setShowSuggestions(false);
    setSearchQuery(business.name);
    onBusinessSelect(business);
  };

  const handleClickOutside = () => {
    setShowSuggestions(false);
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={logo} alt="Whitebrd Co" className="h-12 w-12" />
              <h1 className="text-2xl font-bold tracking-tight text-black">
                Whitebrd Pro Scanner
              </h1>
            </div>
            <div className="text-sm text-gray-600">
              Competitor Intelligence Platform
            </div>
          </div>
        </div>
      </header>

      {/* Main Search Area */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-2xl text-center">
          {/* Hero Content */}
          <div className="mb-12 animate-fade-in">
            <h2 className="text-5xl md:text-6xl font-black text-black mb-6 leading-tight">
              Dominate Your{' '}
              <span className="text-[var(--color-data-orange)]">Local Market</span>
            </h2>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Get instant competitor intelligence for your home service business. 
              Analyze rankings, reviews, and growth opportunities in seconds.
            </p>
          </div>

          {/* Search Input Container */}
          <div className="relative mb-8" onClick={(e) => e.stopPropagation()}>
            <BusinessSearch
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowSuggestions(searchQuery.length >= 2)}
              onBlur={() => {
                // Delay hiding to allow clicks on suggestions
                setTimeout(() => setShowSuggestions(false), 150);
              }}
            />

            <SuggestionsDropdown
              suggestions={searchResults || []}
              isVisible={showSuggestions && !isLoading}
              onSelect={handleBusinessSelect}
            />
          </div>

          {/* Call to Action */}
          <p className="text-gray-600 text-sm">
            Start typing to search for your business and discover competitor insights
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6">
        <div className="container mx-auto px-6 text-center text-gray-500 text-sm">
          <p>&copy; 2024 Whitebrd Pro Scanner. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

import { BusinessSuggestion } from '@/lib/types';
import { Star } from 'lucide-react';

interface SuggestionsDropdownProps {
  suggestions: BusinessSuggestion[];
  isVisible: boolean;
  onSelect: (business: BusinessSuggestion) => void;
}

export function SuggestionsDropdown({ suggestions, isVisible, onSelect }: SuggestionsDropdownProps) {
  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${i <= rating ? 'text-[var(--color-data-orange)] fill-current' : 'text-gray-300 fill-current'}`}
        />
      );
    }
    return stars;
  };

  return (
    <div className={`absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 transition-all duration-300 ${
      isVisible ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none translate-y-2'
    }`}>
      {suggestions.map((business) => (
        <div
          key={business.placeId}
          onClick={() => onSelect(business)}
          className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200 border-b border-gray-100 last:border-b-0"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-black text-lg">{business.name}</h4>
              <p className="text-gray-600 text-sm mt-1">{business.address}</p>
              <div className="flex items-center mt-2">
                <span className="text-[var(--color-data-orange)] font-bold text-sm">
                  {business.rating.toFixed(1)}
                </span>
                <div className="flex ml-1">
                  {renderStars(Math.round(business.rating))}
                </div>
                <span className="text-gray-500 text-sm ml-2">
                  ({business.reviewCount.toLocaleString()} reviews)
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {business.serviceType}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

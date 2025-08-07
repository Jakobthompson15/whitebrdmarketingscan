import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';

interface BusinessSearchProps {
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  placeholder?: string;
}

export function BusinessSearch({ 
  value, 
  onChange, 
  onFocus, 
  onBlur, 
  placeholder = "Enter your business name..." 
}: BusinessSearchProps) {
  return (
    <div className="relative">
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        className="w-full px-8 py-6 text-xl bg-black/10 backdrop-blur-md border border-black/20 rounded-2xl text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--color-data-orange)] focus:border-transparent transition-all duration-300"
      />
      <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
        <Search className="w-6 h-6 text-gray-400" />
      </div>
    </div>
  );
}

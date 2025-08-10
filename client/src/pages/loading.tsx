import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProgressTracker } from '@/components/progress-tracker';
import { BusinessSuggestion, ProgressUpdate } from '@/lib/types';
import logo from '@assets/Logo_1754797907914.png';


interface LoadingPageProps {
  selectedBusiness: BusinessSuggestion;
  onBack: () => void;
  onComplete: (analysisId: number, businessId: number) => void;
}

export function LoadingPage({ selectedBusiness, onBack, onComplete }: LoadingPageProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Initializing...');
  const [updates, setUpdates] = useState<ProgressUpdate[]>([]);

  useEffect(() => {
    startAnalysis();
  }, [selectedBusiness]);

  const startAnalysis = async () => {
    try {
      const response = await fetch('/api/analysis/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedBusiness),
      });

      if (!response.ok) {
        throw new Error('Failed to start analysis');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: ProgressUpdate = JSON.parse(line.slice(6));
              
              setProgress(data.progress);
              setCurrentStep(data.message);
              setUpdates(prev => [...prev, data]);

              if (data.completed && data.analysisId && data.businessId) {
                onComplete(data.analysisId, data.businessId);
                return;
              }

              if (data.error) {
                console.error('Analysis error:', data.error);
                // Handle error state
                return;
              }
            } catch (error) {
              console.error('Error parsing SSE data:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      // Handle error state
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={logo} alt="Whitebrd Co" className="h-10 w-16" />
              <h1 className="text-2xl font-bold tracking-tight text-black">
                Whitebrd Pro Scanner
              </h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-gray-600 hover:text-black transition-colors"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </header>

      {/* Loading Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-2xl text-center">
          {/* Selected Business Display */}
          <div className="mb-12 animate-fade-in">
            <div className="glassmorphism rounded-2xl p-8 mb-8">
              <h3 className="text-2xl font-bold text-black mb-2">
                {selectedBusiness.name}
              </h3>
              <p className="text-gray-600 mb-4">{selectedBusiness.address}</p>
              <div className="flex items-center justify-center">
                <span className="text-[var(--color-data-orange)] font-bold text-lg">
                  {selectedBusiness.rating.toFixed(1)}
                </span>
                <span className="text-gray-600 ml-2">
                  ({selectedBusiness.reviewCount.toLocaleString()} reviews)
                </span>
                <span className="text-[var(--color-data-orange)] bg-[var(--color-data-orange-fade)] px-3 py-1 rounded-full text-sm ml-4">
                  {selectedBusiness.serviceType}
                </span>
              </div>
            </div>

            <h2 className="text-4xl font-black text-black mb-6">
              Analyzing Your Competition
            </h2>
            <p className="text-xl text-gray-700 mb-8">
              We're gathering competitive intelligence from public sources...
            </p>
          </div>

          <ProgressTracker 
            progress={progress} 
            currentStep={currentStep} 
            updates={updates} 
          />
        </div>
      </main>
    </div>
  );
}

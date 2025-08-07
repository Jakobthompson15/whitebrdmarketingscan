import { ProgressUpdate } from '@/lib/types';

interface ProgressTrackerProps {
  progress: number;
  currentStep: string;
  updates: ProgressUpdate[];
}

export function ProgressTracker({ progress, currentStep, updates }: ProgressTrackerProps) {
  return (
    <div className="w-full max-w-2xl">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="bg-black/10 rounded-full h-4 overflow-hidden mb-4">
          <div 
            className="h-full bg-gradient-to-r from-[var(--color-data-orange)] to-[var(--color-data-orange-light)] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span className="text-[var(--color-data-orange)] font-bold">{progress}%</span>
        </div>
      </div>

      {/* Current Step */}
      <div className="text-center mb-8">
        <p className="text-lg text-black font-medium animate-pulse-slow">
          {currentStep}
        </p>
      </div>

      {/* Status Messages */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {updates.slice(-5).map((update, index) => (
          <div key={index} className="flex items-center justify-center space-x-3 text-sm text-gray-600 animate-slide-up">
            <div className={`w-2 h-2 rounded-full ${
              update.progress === progress ? 'bg-[var(--color-data-orange)] animate-pulse' : 'bg-gray-400'
            }`} />
            <span className={update.progress === progress ? 'text-black' : 'text-gray-600'}>
              {update.message}
            </span>
            <span className="text-[var(--color-data-orange)] font-bold">
              {update.progress}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LandingPage } from '@/pages/landing';
import { LoadingPage } from '@/pages/loading';
import { ResultsPage } from '@/pages/results';
import { BusinessSuggestion, CompetitorAnalysis } from '@/lib/types';

type AppState = 'landing' | 'loading' | 'results';

function App() {
  const [currentPage, setCurrentPage] = useState<AppState>('landing');
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessSuggestion | null>(null);
  const [analysisId, setAnalysisId] = useState<number | null>(null);
  const [businessId, setBusinessId] = useState<number | null>(null);
  const [analysisData, setAnalysisData] = useState<CompetitorAnalysis | null>(null);

  const handleBusinessSelect = (business: BusinessSuggestion) => {
    setSelectedBusiness(business);
    setCurrentPage('loading');
  };

  const handleAnalysisComplete = (analysisId: number, businessId: number, analysis?: CompetitorAnalysis, business?: BusinessSuggestion) => {
    setAnalysisId(analysisId);
    setBusinessId(businessId);
    if (analysis && business) {
      // Use data from stream
      setAnalysisData(analysis);
      setSelectedBusiness(business);
    }
    setCurrentPage('results');
  };

  const handleNewSearch = () => {
    setCurrentPage('landing');
    setSelectedBusiness(null);
    setAnalysisId(null);
    setBusinessId(null);
    setAnalysisData(null);
  };

  const handleBackToSearch = () => {
    setCurrentPage('landing');
    setSelectedBusiness(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        
        {currentPage === 'landing' && (
          <LandingPage onBusinessSelect={handleBusinessSelect} />
        )}
        
        {currentPage === 'loading' && selectedBusiness && (
          <LoadingPage
            selectedBusiness={selectedBusiness}
            onBack={handleBackToSearch}
            onComplete={handleAnalysisComplete}
          />
        )}
        
        {currentPage === 'results' && analysisId && businessId && (
          <ResultsPage
            analysisId={analysisId}
            businessId={businessId}
            onNewSearch={handleNewSearch}
            analysisData={analysisData}
            businessData={selectedBusiness}
          />
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/metric-card';
import { CompetitorTable } from '@/components/competitor-table';
import { AIInsightsComponent } from '@/components/ai-insights';
import { SeoInsights } from '@/components/seo-insights';
import { BarChart3, Star, MessageSquare, TrendingUp, Brain, Search } from 'lucide-react';
import { CompetitorAnalysis, BusinessSuggestion } from '@/lib/types';
import logo from '@assets/Logo_1754797907914.png';


interface ResultsPageProps {
  analysisId: number;
  businessId: number;
  onNewSearch: () => void;
  analysisData?: CompetitorAnalysis | null;
  businessData?: BusinessSuggestion | null;
}

export function ResultsPage({ analysisId, businessId, onNewSearch, analysisData, businessData }: ResultsPageProps) {
  // Use passed data if available, otherwise fetch from API
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/analysis', analysisId],
    queryFn: async () => {
      // Fallback to API fetch
      const response = await fetch(`/api/analysis/${analysisId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analysis results');
      }
      return response.json();
    },
    enabled: !(analysisData && businessData), // Only fetch if we don't have streamed data
    initialData: analysisData && businessData ? {
      success: true,
      analysis: analysisData,
      business: businessData
    } : undefined
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[var(--color-data-orange)] mx-auto mb-4"></div>
          <p className="text-xl">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-400 mb-4">Failed to load analysis results</p>
          <Button onClick={onNewSearch} className="bg-[var(--color-data-orange)] hover:bg-[var(--color-data-orange-dark)]">
            Start New Analysis
          </Button>
        </div>
      </div>
    );
  }

  const analysis: CompetitorAnalysis = data.analysis;
  const business: BusinessSuggestion = data.business;
  
  // Fix the data mapping - use competitors field if competitorData is missing
  const competitors: BusinessSuggestion[] = analysis.competitorData || (analysis as any).competitors || [];
  
  // Debug logging
  console.log('Analysis data:', analysis);
  console.log('Competitors found:', competitors.length);
  console.log('Competitor data:', competitors);

  // Calculate market share data for visualization
  const totalReviews = [business, ...competitors].reduce((sum, b) => sum + (b.reviewCount || 0), 0);
  // Always cap market share at 11%, even if no competitors exist
  const businessMarketShare = competitors.length === 0 ? 11 : 
    (totalReviews > 0 ? Math.min((business.reviewCount / totalReviews) * 100, 11) : 11);

  const topCompetitors = competitors
    .sort((a, b) => (b.rating * Math.log10((b.reviewCount || 0) + 1)) - (a.rating * Math.log10((a.reviewCount || 0) + 1)))
    .slice(0, 7); // Show top 7 competitors instead of 3

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img src={logo} alt="Whitebrd Co" className="h-10 w-16" />
                <h1 className="text-2xl font-bold tracking-tight text-black">
                  Whitebrd Pro Scanner
                </h1>
              </div>
              <div className="text-sm text-gray-600">
                Results for <span className="text-black font-medium">{business.name}</span>
              </div>
            </div>
            <Button 
              onClick={onNewSearch}
              className="bg-[var(--color-data-orange)] hover:bg-[var(--color-data-orange-dark)] text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              New Search
            </Button>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="container mx-auto px-6 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Market Position"
            value={`#${analysis.marketPosition}`}
            subtitle={`of ${analysis.totalCompetitors + 1} competitors`}
            icon={BarChart3}
          />
          <MetricCard
            title="Rating Score"
            value={typeof business.rating === 'number' ? business.rating.toFixed(1) : (business.rating || '0.0')}
            subtitle={`vs avg ${analysis.averageCompetitorRating}`}
            icon={Star}
          />
          <MetricCard
            title="Review Volume"
            value={(business.reviewCount || 0).toLocaleString()}
            subtitle="reviews total"
            icon={MessageSquare}
          />
          <MetricCard
            title="Competitive Score"
            value={analysis.competitiveScore}
            subtitle="out of 100"
            icon={TrendingUp}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-8">
          {/* Left Column - Competitor Analysis */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            {/* Competitor Rankings Table */}
            <CompetitorTable
              competitors={[business, ...competitors]}
              targetBusinessId={business.placeId}
              marketPosition={analysis.marketPosition}
            />

            {/* Competitive Analysis */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-black">Competitive Analysis</h3>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div>
                  <h4 className="font-bold text-black mb-4">Your Strengths</h4>
                  <div className="space-y-3">
                    {analysis.strengths?.map((strength, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-[var(--color-data-orange)] rounded-full"></div>
                        <span className="text-sm text-black">{strength}</span>
                      </div>
                    )) || (
                      <p className="text-sm text-gray-500">No specific strengths identified</p>
                    )}
                  </div>
                </div>

                {/* Opportunities */}
                <div>
                  <h4 className="font-bold text-black mb-4">Growth Opportunities</h4>
                  <div className="space-y-3">
                    {analysis.opportunities?.map((opportunity, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-[var(--color-data-orange)] rounded-full"></div>
                        <span className="text-sm text-black">{opportunity}</span>
                      </div>
                    )) || (
                      <p className="text-sm text-gray-500">No specific opportunities identified</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Key Metrics */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Performance Score */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-black mb-6">Performance Score</h3>
              <div className="relative mb-6">
                <div className="w-32 h-32 mx-auto">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#E5E5E5"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="var(--color-data-orange)"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * (analysis.performanceScore || 0)) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-[var(--color-data-orange)]">
                      {analysis.performanceScore || 0}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-black font-medium mb-2">
                  {(analysis.performanceScore || 0) >= 80 ? 'Strong Position' : 
                   (analysis.performanceScore || 0) >= 60 ? 'Needs Improvement' : 
                   (analysis.performanceScore || 0) >= 40 ? 'Falling Behind' : 'Critical Gap'}
                </p>
                <p className="text-gray-500 text-sm">
                  {(analysis.performanceScore || 0) < 60 
                    ? `You're losing to ${Math.round((100 - (analysis.performanceScore || 0)) / 10)} competitors`
                    : 'Compared to market leaders'}
                </p>
              </div>
            </div>

            {/* Quick Wins */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-black mb-6">Quick Wins</h3>
              <div className="space-y-4">
                {analysis.opportunities?.slice(0, 3).map((opportunity, index) => (
                  <div key={index} className="bg-[var(--color-data-orange-fade)] border border-[var(--color-data-orange)]/20 rounded-lg p-4">
                    <h4 className="font-bold text-black text-sm mb-2">Action Item</h4>
                    <p className="text-black text-xs">{opportunity}</p>
                  </div>
                )) || (
                  <p className="text-sm text-gray-500">No specific action items identified</p>
                )}
              </div>
            </div>

            {/* Market Share Visualization */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-black mb-6">Market Share</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {topCompetitors.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-2">No competitors found in your area</p>
                    <p className="text-xs text-gray-400">Market share capped at 11% for display</p>
                  </div>
                )}
                {topCompetitors.map((competitor, index) => {
                  const competitorShare = totalReviews > 0 ? Math.min((competitor.reviewCount / totalReviews) * 100, 11) : 0;
                  return (
                    <div key={competitor.placeId}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-black truncate pr-2" title={competitor.name}>
                          {index + 1}. {competitor.name}
                        </span>
                        <span className="text-[var(--color-data-orange)] font-bold text-sm">
                          {competitorShare.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-[var(--color-data-orange)] h-2 rounded-full transition-all duration-500"
                          style={{ width: `${competitorShare}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                
                <div className="pt-2 border-t border-gray-300">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-black">{business.name} (You)</span>
                    <span className="text-[var(--color-data-orange)] font-bold text-sm">
                      {businessMarketShare.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-[var(--color-data-orange)] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${businessMarketShare}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Insights Section */}
        <div className="mt-12">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-black flex items-center gap-2">
                <Search className="h-6 w-6 text-[var(--color-data-orange)]" />
                SEO Keyword Analysis
              </h2>
              <div className="text-xs text-gray-500 px-3 py-1 bg-gray-100 rounded-full">
                Powered by DataForSEO
              </div>
            </div>
            {analysis.enhancedSeoData ? (
              <SeoInsights seoData={analysis.enhancedSeoData} businessName={business.name} />
            ) : (
              <div className="text-center py-8">
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">SEO Analysis Not Available</h3>
                <p className="text-gray-500 mb-4">
                  DataForSEO credentials not configured or analysis failed.
                </p>
                <p className="text-sm text-gray-400">
                  Configure DataForSEO API credentials to see keyword rankings, competitor analysis, and SEO opportunities.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* AI Insights Section */}
        {analysis.aiInsights && (
          <div className="mt-12">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-black flex items-center gap-2">
                  <Brain className="h-6 w-6 text-[var(--color-data-orange)]" />
                  AI-Powered Strategic Analysis
                </h2>
                <div className="text-xs text-gray-500 px-3 py-1 bg-gray-100 rounded-full">
                  Powered by GPT-4o
                </div>
              </div>
              <AIInsightsComponent insights={analysis.aiInsights} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

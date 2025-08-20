export interface BusinessSuggestion {
  placeId: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  serviceType: string;
  location: {
    lat: number;
    lng: number;
  };
  publicInfo: {
    phone?: string;
    website?: string;
    hours?: any;
    photos: number;
    businessStatus: string;
    currentlyOpen?: boolean;
  };
}

export interface AIInsights {
  executiveSummary: string;
  keyFindings: string[];
  strategicRecommendations: string[];
  marketOpportunities: string[];
  competitiveAdvantages: string[];
  actionItems: string[];
  riskFactors: string[];
}

export interface EnhancedSeoData {
  keywordsNotRankingFor: Array<{
    keyword: string;
    searchVolume: number;
    topCompetitor: string;
    competitorPosition: number;
  }>;
  keywordsRankingFor: Array<{
    keyword: string;
    position: number;
    searchVolume: number;
    url?: string;
  }>;
  seoMetrics: {
    domainAuthority?: number;
    backlinks?: number;
    referringDomains?: number;
    organicKeywords?: number;
    organicTraffic?: number;
  };
}

export interface CompetitorAnalysis {
  id: number;
  targetBusinessId: number;
  marketPosition: number;
  competitiveScore: number;
  performanceScore: number;
  strengths: string[];
  opportunities: string[];
  competitorData: BusinessSuggestion[];
  marketShare: number;
  averageCompetitorRating: number;
  totalCompetitors: number;
  scanDate: string;
  aiInsights?: AIInsights;
  enhancedSeoData?: EnhancedSeoData;
}

export interface ProgressUpdate {
  progress: number;
  message: string;
  completed?: boolean;
  analysisId?: number;
  businessId?: number;
  error?: string;
}

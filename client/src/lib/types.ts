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
}

export interface ProgressUpdate {
  progress: number;
  message: string;
  completed?: boolean;
  analysisId?: number;
  businessId?: number;
  error?: string;
}

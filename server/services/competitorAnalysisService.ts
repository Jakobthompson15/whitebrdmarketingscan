import { GooglePlacesService, BusinessSuggestion } from './googlePlacesService';

export interface CompetitorAnalysisResult {
  marketPosition: number;
  competitiveScore: number;
  performanceScore: number;
  strengths: string[];
  opportunities: string[];
  competitors: BusinessSuggestion[];
  marketAnalysis: {
    totalCompetitors: number;
    averageRating: number;
    marketShare: number;
  };
}

export class CompetitorAnalysisService {
  private googlePlaces: GooglePlacesService;

  constructor() {
    this.googlePlaces = new GooglePlacesService();
  }

  async analyzeCompetition(targetBusiness: BusinessSuggestion): Promise<CompetitorAnalysisResult> {
    try {
      // Find competitors in the same service type and location
      const competitors = await this.findCompetitors(targetBusiness);
      
      // Calculate market position
      const marketPosition = this.calculateMarketPosition(targetBusiness, competitors);
      
      // Calculate competitive metrics
      const competitiveScore = this.calculateCompetitiveScore(targetBusiness, competitors);
      const performanceScore = this.calculatePerformanceScore(targetBusiness);
      
      // Identify strengths and opportunities
      const strengths = this.identifyStrengths(targetBusiness, competitors);
      const opportunities = this.identifyOpportunities(targetBusiness, competitors);
      
      // Market analysis
      const marketAnalysis = this.analyzeMarket(targetBusiness, competitors);

      return {
        marketPosition,
        competitiveScore,
        performanceScore,
        strengths,
        opportunities,
        competitors,
        marketAnalysis
      };
    } catch (error) {
      console.error('Error analyzing competition:', error);
      throw new Error('Failed to analyze competition');
    }
  }

  private async findCompetitors(targetBusiness: BusinessSuggestion): Promise<BusinessSuggestion[]> {
    // Extract location info for competitor search
    const locationQuery = this.extractLocationFromAddress(targetBusiness.address);
    const searchQuery = `${targetBusiness.serviceType} ${locationQuery}`;
    
    const allBusinesses = await this.googlePlaces.searchBusinesses(searchQuery);
    
    // Filter out the target business and return competitors
    return allBusinesses
      .filter(business => business.placeId !== targetBusiness.placeId)
      .slice(0, 10); // Limit to top 10 competitors
  }

  private extractLocationFromAddress(address: string): string {
    // Extract city and state from address
    const parts = address.split(',');
    if (parts.length >= 2) {
      return parts[parts.length - 2].trim(); // Usually the city
    }
    return address;
  }

  private calculateMarketPosition(target: BusinessSuggestion, competitors: BusinessSuggestion[]): number {
    const allBusinesses = [target, ...competitors];
    
    // Sort by competitive strength (rating * review count)
    allBusinesses.sort((a, b) => {
      const scoreA = a.rating * Math.log10((a.reviewCount || 0) + 1);
      const scoreB = b.rating * Math.log10((b.reviewCount || 0) + 1);
      return scoreB - scoreA;
    });
    
    return allBusinesses.findIndex(b => b.placeId === target.placeId) + 1;
  }

  private calculateCompetitiveScore(target: BusinessSuggestion, competitors: BusinessSuggestion[]): number {
    let score = 50; // Base score
    
    // Rating advantage
    const avgCompetitorRating = competitors.length > 0 
      ? competitors.reduce((sum, c) => sum + c.rating, 0) / competitors.length 
      : 4.0;
    
    if (target.rating > avgCompetitorRating) {
      score += Math.min(20, (target.rating - avgCompetitorRating) * 10);
    } else {
      score -= Math.min(20, (avgCompetitorRating - target.rating) * 10);
    }
    
    // Review volume advantage
    const avgCompetitorReviews = competitors.length > 0
      ? competitors.reduce((sum, c) => sum + c.reviewCount, 0) / competitors.length
      : 50;
    
    if (target.reviewCount > avgCompetitorReviews) {
      score += Math.min(15, (target.reviewCount - avgCompetitorReviews) / avgCompetitorReviews * 15);
    } else if (avgCompetitorReviews > 0) {
      score -= Math.min(15, (avgCompetitorReviews - target.reviewCount) / avgCompetitorReviews * 15);
    }
    
    // Website presence
    if (target.publicInfo.website) score += 10;
    
    // Phone listing
    if (target.publicInfo.phone) score += 5;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private calculatePerformanceScore(target: BusinessSuggestion): number {
    let score = 0;
    
    // Rating component (40 points)
    score += (target.rating / 5) * 40;
    
    // Review volume component (30 points)
    const reviewScore = Math.min(30, (target.reviewCount / 100) * 30);
    score += reviewScore;
    
    // Online presence (30 points)
    if (target.publicInfo.website) score += 15;
    if (target.publicInfo.phone) score += 10;
    if (target.publicInfo.photos >= 5) score += 5;
    
    return Math.round(score);
  }

  private identifyStrengths(target: BusinessSuggestion, competitors: BusinessSuggestion[]): string[] {
    const strengths: string[] = [];
    
    const avgRating = competitors.length > 0 
      ? competitors.reduce((sum, c) => sum + c.rating, 0) / competitors.length 
      : 4.0;
    
    if (target.rating > avgRating + 0.2) {
      strengths.push(`Higher rating than ${Math.round(((competitors.filter(c => c.rating < target.rating).length) / competitors.length) * 100)}% of competitors`);
    }
    
    if (target.rating >= 4.5) {
      strengths.push('Excellent customer service reputation');
    }
    
    if (target.publicInfo.website && target.publicInfo.phone) {
      strengths.push('Complete online business profile');
    }
    
    const avgReviews = competitors.length > 0
      ? competitors.reduce((sum, c) => sum + c.reviewCount, 0) / competitors.length
      : 50;
    
    if (target.reviewCount > avgReviews) {
      strengths.push('Above average review volume');
    }
    
    return strengths.slice(0, 3); // Limit to top 3 strengths
  }

  private identifyOpportunities(target: BusinessSuggestion, competitors: BusinessSuggestion[]): string[] {
    const opportunities: string[] = [];
    
    const topCompetitor = competitors.length > 0 
      ? competitors.reduce((top, current) => 
          (current.reviewCount > top.reviewCount) ? current : top)
      : null;
    
    if (topCompetitor && target.reviewCount < topCompetitor.reviewCount * 0.7) {
      const needed = Math.round(topCompetitor.reviewCount - target.reviewCount);
      opportunities.push(`Increase review volume by ${needed} reviews to match market leader`);
    }
    
    if (!target.publicInfo.website) {
      opportunities.push('Add website to improve online presence');
    }
    
    if (target.reviewCount < 50) {
      opportunities.push('Focus on collecting more customer reviews');
    }
    
    const avgRating = competitors.length > 0 
      ? competitors.reduce((sum, c) => sum + c.rating, 0) / competitors.length 
      : 4.0;
    
    if (target.rating < avgRating) {
      opportunities.push('Improve service quality to boost customer ratings');
    }
    
    if (target.publicInfo.photos < 10) {
      opportunities.push('Add more photos to business listing');
    }
    
    return opportunities.slice(0, 3); // Limit to top 3 opportunities
  }

  private analyzeMarket(target: BusinessSuggestion, competitors: BusinessSuggestion[]): any {
    const totalReviews = [target, ...competitors].reduce((sum, b) => sum + b.reviewCount, 0);
    const marketShare = totalReviews > 0 ? (target.reviewCount / totalReviews) * 100 : 0;
    
    const avgRating = competitors.length > 0 
      ? competitors.reduce((sum, c) => sum + c.rating, 0) / competitors.length 
      : 4.0;
    
    return {
      totalCompetitors: competitors.length,
      averageRating: Number(avgRating.toFixed(1)),
      marketShare: Number(marketShare.toFixed(1))
    };
  }
}

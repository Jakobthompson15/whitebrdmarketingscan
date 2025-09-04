import { GooglePlacesService, BusinessSuggestion } from './googlePlacesService';
import { AIAnalysisService, AIInsights } from './aiAnalysisService';
import { EnhancedAnalysisService, EnhancedAnalysisResult } from './enhancedAnalysisService';

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
  aiInsights?: AIInsights;
  enhancedSeoData?: EnhancedAnalysisResult;
}

export class CompetitorAnalysisService {
  private googlePlaces: GooglePlacesService;
  private aiAnalysis: AIAnalysisService;
  private enhancedAnalysis: EnhancedAnalysisService;

  constructor() {
    this.googlePlaces = new GooglePlacesService();
    this.aiAnalysis = new AIAnalysisService();
    this.enhancedAnalysis = new EnhancedAnalysisService();
  }

  async analyzeCompetition(targetBusiness: BusinessSuggestion): Promise<CompetitorAnalysisResult> {
    try {
      // Find competitors in the same service type and location
      const competitors = await this.findCompetitors(targetBusiness);
      
      // Calculate market position
      const marketPosition = this.calculateMarketPosition(targetBusiness, competitors);
      
      // Calculate competitive metrics
      const competitiveScore = this.calculateCompetitiveScore(targetBusiness, competitors);
      const performanceScore = this.calculatePerformanceScore(targetBusiness, competitors);
      
      // Identify strengths and opportunities
      const strengths = this.identifyStrengths(targetBusiness, competitors);
      const opportunities = this.identifyOpportunities(targetBusiness, competitors);
      
      // Market analysis
      const marketAnalysis = this.analyzeMarket(targetBusiness, competitors);

      // Generate AI insights
      const baseResult = {
        marketPosition,
        competitiveScore,
        performanceScore,
        strengths,
        opportunities,
        competitors,
        marketAnalysis
      };

      const aiInsights = await this.aiAnalysis.generateCompetitorInsights(targetBusiness, baseResult);

      // Add enhanced SEO analysis if DataForSEO is configured
      let enhancedData = null;
      console.log(`🔐 DataForSEO Credentials Check:`);
      console.log(`  - Login: ${process.env.DATAFORSEO_LOGIN ? 'SET' : 'NOT SET'}`);
      console.log(`  - Password: ${process.env.DATAFORSEO_PASSWORD ? 'SET' : 'NOT SET'}`);
      
      if (process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD) {
        console.log('🚀 Running DataForSEO enhanced analysis...');
        try {
          enhancedData = await this.enhancedAnalysis.performEnhancedAnalysis(
            targetBusiness,
            competitors
          );
          console.log('✅ Enhanced SEO analysis completed successfully');
          console.log('📊 Enhanced data:', enhancedData ? 'DATA AVAILABLE' : 'NO DATA');
        } catch (error) {
          console.log('❌ Enhanced SEO analysis failed, continuing without it:', error);
        }
      } else {
        console.log('⚠️ DataForSEO credentials not configured, skipping enhanced analysis');
      }

      return {
        ...baseResult,
        aiInsights,
        enhancedSeoData: enhancedData
      };
    } catch (error) {
      console.error('Error analyzing competition:', error);
      throw new Error('Failed to analyze competition');
    }
  }

  private async findCompetitors(targetBusiness: BusinessSuggestion): Promise<BusinessSuggestion[]> {
    // Extract location info for competitor search
    const locationQuery = this.extractLocationFromAddress(targetBusiness.address);
    
    // Create multiple search queries for better results
    const searchQueries = [
      `${targetBusiness.serviceType} near ${locationQuery}`,
      `${targetBusiness.serviceType} services ${locationQuery}`,
      `${targetBusiness.serviceType} contractors ${locationQuery}`,
      `${targetBusiness.serviceType} companies in ${locationQuery}`
    ];
    
    console.log(`🔍 Searching for competitors with multiple queries`);
    
    let allBusinesses: BusinessSuggestion[] = [];
    const seenPlaceIds = new Set<string>();
    
    // Try multiple search queries to get more results
    for (const query of searchQueries) {
      console.log(`🔎 Trying query: "${query}"`);
      const results = await this.googlePlaces.searchBusinesses(query);
      
      // De-duplicate by placeId
      for (const business of results) {
        if (!seenPlaceIds.has(business.placeId)) {
          seenPlaceIds.add(business.placeId);
          allBusinesses.push(business);
        }
      }
      
      // If we have enough competitors, stop searching
      if (allBusinesses.length >= 15) break;
    }
    
    console.log(`📊 Found ${allBusinesses.length} total unique businesses`);
    
    // Filter out the target business and return competitors
    const competitors = allBusinesses
      .filter(business => business.placeId !== targetBusiness.placeId);
      
    console.log(`🏢 Found ${competitors.length} competitors after filtering target business`);
    console.log(`🎯 Target business placeId: ${targetBusiness.placeId}`);
    
    return competitors.slice(0, 10); // Limit to top 10 competitors
  }

  private extractLocationFromAddress(address: string): string {
    console.log(`🏠 Extracting location from address: "${address}"`);
    
    // Handle different address formats and extract city and state
    const parts = address.split(',').map(p => p.trim());
    
    let city = '';
    let state = '';
    let zipCode = '';
    
    // Try to extract state and zip from common patterns
    const stateZipPattern = /([A-Z]{2})\s+(\d{5})/;
    
    for (const part of parts) {
      const match = part.match(stateZipPattern);
      if (match) {
        state = match[1];
        zipCode = match[2];
        break;
      }
    }
    
    if (parts.length >= 4) {
      // Format: "Street, City, State ZIP, Country"
      city = parts[parts.length - 3];
    } else if (parts.length >= 3) {
      // Format: "Street, City, State ZIP"
      city = parts[parts.length - 2];
    } else if (parts.length === 2) {
      // Format: "City, State ZIP"
      city = parts[0];
    }
    
    // Build location query with city and state
    let locationQuery = city;
    if (state) {
      locationQuery = `${city}, ${state}`;
    }
    if (zipCode && !city) {
      // If we only have zip code, use that
      locationQuery = zipCode;
    }
    
    console.log(`🏠 Extracted location: "${locationQuery}" (city: ${city}, state: ${state}, zip: ${zipCode})`);
    return locationQuery || address;
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

  private calculatePerformanceScore(target: BusinessSuggestion, competitors: BusinessSuggestion[]): number {
    if (competitors.length === 0) {
      // Fallback to simple calculation if no competitors
      return Math.min(64, Math.round((target.rating / 5) * 100));
    }
    
    let score = 100; // Start at 100 and subtract based on deficits
    
    // Sort competitors by strength (rating * review count)
    const rankedCompetitors = [...competitors].sort((a, b) => {
      const scoreA = a.rating * Math.log10((a.reviewCount || 0) + 1);
      const scoreB = b.rating * Math.log10((b.reviewCount || 0) + 1);
      return scoreB - scoreA;
    });
    
    const topCompetitor = rankedCompetitors[0];
    const top3Competitors = rankedCompetitors.slice(0, 3);
    
    // 1. Gap from #1 competitor (30% weight)
    if (topCompetitor) {
      const topScore = topCompetitor.rating * Math.log10((topCompetitor.reviewCount || 0) + 1);
      const targetScore = target.rating * Math.log10((target.reviewCount || 0) + 1);
      const gap = Math.max(0, topScore - targetScore) / topScore;
      score -= gap * 30; // Lose up to 30 points based on gap
    }
    
    // 2. Review volume deficit vs top 3 average (25% weight)
    const avgTop3Reviews = top3Competitors.reduce((sum, c) => sum + c.reviewCount, 0) / top3Competitors.length;
    if (target.reviewCount < avgTop3Reviews) {
      const deficit = (avgTop3Reviews - target.reviewCount) / avgTop3Reviews;
      score -= Math.min(25, deficit * 25); // Lose up to 25 points
    }
    
    // 3. Rating gap from market leader (25% weight)
    if (topCompetitor && target.rating < topCompetitor.rating) {
      const ratingGap = (topCompetitor.rating - target.rating) / topCompetitor.rating;
      score -= Math.min(25, ratingGap * 25); // Lose up to 25 points
    }
    
    // 4. Missing opportunities (20% weight)
    let missingPoints = 0;
    if (!target.publicInfo.website) missingPoints += 8;
    if (!target.publicInfo.phone) missingPoints += 4;
    if (target.publicInfo.photos < 10) missingPoints += 4;
    if (target.reviewCount < 50) missingPoints += 4;
    score -= missingPoints;
    
    return Math.max(0, Math.min(64, Math.round(score)));
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

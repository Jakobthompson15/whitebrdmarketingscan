import { DataForSeoService } from './dataForSeoService';
import { BusinessSuggestion } from './googlePlacesService';

export interface EnhancedAnalysisResult {
  seoMetrics: {
    domainAuthority?: number;
    backlinks?: number;
    referringDomains?: number;
    organicKeywords?: number;
    organicTraffic?: number;
  };
  keywordOpportunities: Array<{
    keyword: string;
    searchVolume: number;
    difficulty: number;
    currentPosition?: number;
    opportunity: boolean;
  }>;
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
  localSeoInsights: {
    localPackPresence: boolean;
    citationCount?: number;
    napConsistency?: boolean;
    competitorGaps: string[];
  };
  competitorIntelligence: Array<{
    domain: string;
    visibility: number;
    commonKeywords: number;
    strengths: string[];
  }>;
}

export class EnhancedAnalysisService {
  private dataForSeo: DataForSeoService;

  constructor() {
    this.dataForSeo = new DataForSeoService();
  }

  async performEnhancedAnalysis(
    business: BusinessSuggestion,
    competitors: BusinessSuggestion[]
  ): Promise<EnhancedAnalysisResult> {
    
    const domain = this.extractDomain(business.publicInfo?.website);
    const city = this.extractCity(business.address);
    const state = this.extractState(business.address);
    const keywords = this.generateLocalBusinessKeywords(business, city, state);
    
    console.log(`🔍 Running SEO analysis for ${business.name} in ${city}, ${state}`);
    console.log(`📍 Analyzing keywords:`, keywords.slice(0, 5));
    
    const [
      serpResults,
      keywordData,
      localPackData,
      backlinkData,
      competitorDomains
    ] = await Promise.all([
      this.dataForSeo.getSerpResults(keywords, `${city}, ${state}`),
      this.dataForSeo.getKeywordData(keywords),
      this.dataForSeo.getLocalPackResults(
        `${business.serviceType} ${city}`,
        `${city}, ${state}`
      ),
      domain ? this.dataForSeo.getBacklinkData(domain) : null,
      domain ? this.dataForSeo.getCompetitorDomains(domain) : null
    ]);

    const keywordOpportunities = this.analyzeKeywordOpportunities(
      keywordData,
      serpResults,
      business
    );

    const { keywordsNotRankingFor, keywordsRankingFor } = this.analyzeKeywordGaps(
      keywordData,
      serpResults,
      business,
      competitors
    );

    const localSeoInsights = this.analyzeLocalSeo(
      localPackData,
      business,
      competitors
    );

    const seoMetrics = this.compileSeoMetrics(backlinkData);

    const competitorIntelligence = this.analyzeCompetitors(
      competitorDomains,
      competitors
    );

    console.log(`📊 Found ${keywordsRankingFor.length} keywords ranking, ${keywordsNotRankingFor.length} opportunities`);

    return {
      seoMetrics,
      keywordOpportunities,
      keywordsNotRankingFor,
      keywordsRankingFor,
      localSeoInsights,
      competitorIntelligence
    };
  }

  private generateLocalBusinessKeywords(business: BusinessSuggestion, city: string, state: string): string[] {
    const service = business.serviceType.toLowerCase();
    const businessName = business.name;
    const stateAbbr = this.getStateAbbreviation(state);
    
    // Clean city name - remove any zip codes or extra characters
    const cleanCity = city.replace(/\d{5}.*$/, '').trim();
    
    console.log(`🎯 Generating keywords for ${service} in ${cleanCity}, ${stateAbbr}`);
    
    const keywords = [
      // Core local keywords - city focused
      `${service} ${cleanCity}`,
      `${cleanCity} ${service}`,
      `${service} service ${cleanCity}`,
      `${service} contractor ${cleanCity}`,
      `${service} company ${cleanCity}`,
      
      // State + city combinations
      `${service} ${cleanCity} ${stateAbbr}`,
      `${cleanCity} ${stateAbbr} ${service}`,
      
      // Emergency keywords (high value for home services)
      `emergency ${service} ${cleanCity}`,
      `24 hour ${service} ${cleanCity}`,
      `${service} emergency ${cleanCity}`,
      
      // Quality indicators
      `best ${service} ${cleanCity}`,
      `top ${service} ${cleanCity}`,
      `professional ${service} ${cleanCity}`,
      `reliable ${service} ${cleanCity}`,
      
      // Specific service variations
      `${service} repair ${cleanCity}`,
      `${service} installation ${cleanCity}`,
      `${service} replacement ${cleanCity}`,
      `affordable ${service} ${cleanCity}`,
      
      // General location
      `${service} near me`
    ];

    // Add business name keywords for brand monitoring
    keywords.push(
      businessName,
      `${businessName} ${cleanCity}`,
      `${businessName} reviews`
    );

    // Filter out any keywords with numbers (zip codes) and return top 10
    const cleanKeywords = keywords
      .filter(kw => !/\d{5}/.test(kw)) // Remove any with zip codes
      .slice(0, 10);
      
    console.log(`📍 Final keywords:`, cleanKeywords);
    return cleanKeywords;
  }

  private analyzeKeywordOpportunities(
    keywordData: any[],
    serpResults: any[],
    business: BusinessSuggestion
  ): any[] {
    return keywordData.map(kw => {
      const serpPosition = serpResults.find(
        s => s.keyword === kw.keyword && 
        s.url?.includes(this.extractDomain(business.publicInfo?.website) || '')
      );

      return {
        keyword: kw.keyword,
        searchVolume: kw.searchVolume,
        difficulty: Math.round(kw.competition * 100),
        currentPosition: serpPosition?.position,
        opportunity: !serpPosition || serpPosition.position > 3
      };
    }).filter(kw => kw.searchVolume > 10);
  }

  private analyzeKeywordGaps(
    keywordData: any[],
    serpResults: any[],
    business: BusinessSuggestion,
    competitors: BusinessSuggestion[]
  ): { keywordsNotRankingFor: any[], keywordsRankingFor: any[] } {
    const businessDomain = this.extractDomain(business.publicInfo?.website);
    const competitorDomains = competitors
      .map(c => this.extractDomain(c.publicInfo?.website))
      .filter(d => d);

    const keywordsRankingFor: any[] = [];
    const keywordsNotRankingFor: any[] = [];

    keywordData.forEach(kw => {
      if (kw.searchVolume < 10) return; // Skip low volume keywords

      // Find where this business ranks
      const businessRanking = serpResults.find(
        s => s.keyword === kw.keyword && 
        businessDomain && s.url?.includes(businessDomain)
      );

      // Find top competitor for this keyword
      const competitorRankings = serpResults
        .filter(s => s.keyword === kw.keyword)
        .filter(s => competitorDomains.some(domain => s.url?.includes(domain)))
        .sort((a, b) => a.position - b.position);

      if (businessRanking && businessRanking.position <= 20) {
        // Business is ranking for this keyword
        keywordsRankingFor.push({
          keyword: kw.keyword,
          position: businessRanking.position,
          searchVolume: kw.searchVolume,
          url: businessRanking.url
        });
      } else if (competitorRankings.length > 0) {
        // Competitors are ranking but business is not
        const topCompetitor = competitorRankings[0];
        const competitorBusiness = competitors.find(c => 
          topCompetitor.url?.includes(this.extractDomain(c.publicInfo?.website) || '')
        );

        keywordsNotRankingFor.push({
          keyword: kw.keyword,
          searchVolume: kw.searchVolume,
          topCompetitor: competitorBusiness?.name || 'Unknown Competitor',
          competitorPosition: topCompetitor.position
        });
      }
    });

    return {
      keywordsNotRankingFor: keywordsNotRankingFor.slice(0, 5), // Top 5 opportunities
      keywordsRankingFor: keywordsRankingFor.slice(0, 10) // Top 10 rankings
    };
  }

  private analyzeLocalSeo(
    localPackData: any[],
    business: BusinessSuggestion,
    competitors: BusinessSuggestion[]
  ): any {
    const inLocalPack = localPackData.some(
      item => item.title?.includes(business.name)
    );

    const competitorGaps = competitors
      .filter(comp => 
        localPackData.some(item => item.title?.includes(comp.name)) &&
        !inLocalPack
      )
      .map(comp => comp.name);

    return {
      localPackPresence: inLocalPack,
      citationCount: localPackData.length,
      napConsistency: true,
      competitorGaps
    };
  }

  private compileSeoMetrics(backlinkData: any): any {
    if (!backlinkData) {
      return {
        domainAuthority: 0,
        backlinks: 0,
        referringDomains: 0,
        organicKeywords: 0,
        organicTraffic: 0
      };
    }

    return {
      domainAuthority: backlinkData.rank || 0,
      backlinks: backlinkData.backlinks || 0,
      referringDomains: backlinkData.referring_domains || 0,
      organicKeywords: backlinkData.organic_keywords || 0,
      organicTraffic: backlinkData.organic_traffic || 0
    };
  }

  private analyzeCompetitors(
    competitorDomains: any[],
    competitors: BusinessSuggestion[]
  ): any[] {
    if (!competitorDomains || competitorDomains.length === 0) {
      return [];
    }

    return competitorDomains.slice(0, 5).map(comp => ({
      domain: comp.domain,
      visibility: comp.etv || 0,
      commonKeywords: comp.keywords_count || 0,
      strengths: this.identifyCompetitorStrengths(comp)
    }));
  }

  private identifyCompetitorStrengths(competitor: any): string[] {
    const strengths = [];
    
    if (competitor.etv > 1000) {
      strengths.push('High organic visibility');
    }
    if (competitor.keywords_count > 100) {
      strengths.push('Broad keyword coverage');
    }
    if (competitor.traffic > 5000) {
      strengths.push('Strong traffic volume');
    }
    
    return strengths;
  }

  private extractDomain(website?: string): string {
    if (!website) return '';
    
    try {
      const url = new URL(website);
      return url.hostname.replace('www.', '');
    } catch {
      return website.replace('www.', '').replace('https://', '').replace('http://', '');
    }
  }

  private extractCity(address: string): string {
    console.log(`📍 Parsing address: "${address}"`);
    
    // Handle different address formats:
    // "123 Main St, Portland, OR 97201, USA"
    // "123 Main St, Portland, OR, USA" 
    // "Portland, OR 97201"
    const parts = address.split(',').map(p => p.trim());
    console.log(`📍 Address parts:`, parts);
    
    if (parts.length >= 3) {
      // Format: "Street, City, State ZIP, Country" or "Street, City, State, Country"
      const cityPart = parts[parts.length - 3]; // Third from end is usually city
      console.log(`📍 Extracted city: "${cityPart}"`);
      return cityPart;
    } else if (parts.length === 2) {
      // Format: "City, State ZIP"
      const cityPart = parts[0];
      console.log(`📍 Extracted city (short format): "${cityPart}"`);
      return cityPart;
    }
    
    console.log(`📍 Could not extract city from address`);
    return '';
  }

  private extractState(address: string): string {
    console.log(`🏛️ Parsing state from: "${address}"`);
    
    const parts = address.split(',').map(p => p.trim());
    
    if (parts.length >= 2) {
      // Look for state in second-to-last or last part
      let statePart = '';
      
      if (parts.length >= 3) {
        // Format: "Street, City, State ZIP, Country"
        statePart = parts[parts.length - 2]; // Second from end
      } else {
        // Format: "City, State ZIP"
        statePart = parts[parts.length - 1]; // Last part
      }
      
      // Extract state code from "OR 97201" or "Oregon 97201" format
      const stateMatch = statePart.match(/^([A-Z]{2}|[A-Za-z\s]+)/);
      if (stateMatch) {
        const state = stateMatch[1].trim();
        console.log(`🏛️ Extracted state: "${state}"`);
        return state;
      }
    }
    
    console.log(`🏛️ Could not extract state from address`);
    return '';
  }

  private getStateAbbreviation(state: string): string {
    const stateMap: { [key: string]: string } = {
      'South Carolina': 'SC', 'SC': 'SC',
      'North Carolina': 'NC', 'NC': 'NC', 
      'Georgia': 'GA', 'GA': 'GA',
      'Florida': 'FL', 'FL': 'FL',
      'Virginia': 'VA', 'VA': 'VA',
      'Tennessee': 'TN', 'TN': 'TN',
      'Alabama': 'AL', 'AL': 'AL',
      'Kentucky': 'KY', 'KY': 'KY',
      'West Virginia': 'WV', 'WV': 'WV',
      'Maryland': 'MD', 'MD': 'MD',
      'Delaware': 'DE', 'DE': 'DE',
      'New Jersey': 'NJ', 'NJ': 'NJ',
      'Pennsylvania': 'PA', 'PA': 'PA',
      'New York': 'NY', 'NY': 'NY',
      'Connecticut': 'CT', 'CT': 'CT',
      'Rhode Island': 'RI', 'RI': 'RI',
      'Massachusetts': 'MA', 'MA': 'MA',
      'Vermont': 'VT', 'VT': 'VT',
      'New Hampshire': 'NH', 'NH': 'NH',
      'Maine': 'ME', 'ME': 'ME',
      'Oregon': 'OR', 'OR': 'OR',
      'Washington': 'WA', 'WA': 'WA',
      'California': 'CA', 'CA': 'CA',
      'Nevada': 'NV', 'NV': 'NV',
      'Idaho': 'ID', 'ID': 'ID',
      'Montana': 'MT', 'MT': 'MT',
      'Wyoming': 'WY', 'WY': 'WY',
      'Colorado': 'CO', 'CO': 'CO',
      'Utah': 'UT', 'UT': 'UT',
      'Arizona': 'AZ', 'AZ': 'AZ',
      'New Mexico': 'NM', 'NM': 'NM',
      'Texas': 'TX', 'TX': 'TX'
    };
    return stateMap[state] || state;
  }
}
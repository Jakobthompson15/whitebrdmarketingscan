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
    
    console.log(`🏢 Business details:`, {
      name: business.name,
      address: business.address,
      serviceType: business.serviceType
    });
    
    const domain = this.extractDomain(business.publicInfo?.website);
    const city = this.extractCity(business.address);
    const state = this.extractState(business.address);
    const keywords = this.generateLocalBusinessKeywords(business, city, state);
    
    console.log(`🔍 Running SEO analysis for ${business.name}`);
    console.log(`📍 Parsed location: City="${city}", State="${state}"`);
    console.log(`🎯 Generated keywords:`, keywords.slice(0, 5));
    
    // Build proper location string for DataForSEO: "City,State,United States" (full state name required)
    const location = city && state ? `${city},${this.getFullStateName(state)},United States` : 'United States';
    console.log(`🌍 Using DataForSEO location format: "${location}"`);
    
    const [
      serpResults,
      keywordData,
      localPackData,
      backlinkData,
      competitorDomains
    ] = await Promise.all([
      this.dataForSeo.getSerpResults(keywords, location),
      this.dataForSeo.getKeywordData(keywords),
      this.dataForSeo.getLocalPackResults(
        `${business.serviceType} ${city}`,
        location
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
    // "123 Main St, Lugoff, SC 29078, United States"
    // "Lugoff, SC 29078, United States" 
    // "Lugoff, SC, United States"
    const parts = address.split(',').map(p => p.trim());
    console.log(`📍 Address parts:`, parts);
    
    // Look for the city which is typically before state/zip
    // Work backwards from the end to find the city
    for (let i = parts.length - 1; i >= 0; i--) {
      const part = parts[i];
      
      // Skip country (United States, USA)
      if (part.toLowerCase().includes('united states') || part.toLowerCase() === 'usa') {
        continue;
      }
      
      // Skip state/zip combinations like "SC 29078" or just zip codes
      if (/^[A-Z]{2}\s+\d{5}/.test(part) || /^\d{5}/.test(part)) {
        continue;
      }
      
      // Skip just state codes like "SC"
      if (/^[A-Z]{2}$/.test(part)) {
        continue;
      }
      
      // If we've gone back far enough and this looks like a city (no numbers, reasonable length)
      if (!/\d/.test(part) && part.length > 1 && part.length < 50) {
        console.log(`📍 Extracted city: "${part}"`);
        return part;
      }
    }
    
    // Fallback: try to get second-to-last part if it doesn't contain numbers
    if (parts.length >= 2) {
      const secondToLast = parts[parts.length - 2];
      if (!/\d/.test(secondToLast) && !secondToLast.toLowerCase().includes('united')) {
        console.log(`📍 Fallback city extraction: "${secondToLast}"`);
        return secondToLast;
      }
    }
    
    console.log(`📍 Could not extract city from address`);
    return '';
  }

  private extractState(address: string): string {
    console.log(`🏛️ Parsing state from: "${address}"`);
    
    const parts = address.split(',').map(p => p.trim());
    
    // Look for state which typically comes after city and before country
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      // Skip country
      if (part.toLowerCase().includes('united states') || part.toLowerCase() === 'usa') {
        continue;
      }
      
      // Look for state abbreviation + zip code pattern like "SC 29078"
      const stateZipMatch = part.match(/^([A-Z]{2})\s+\d{5}/);
      if (stateZipMatch) {
        const stateAbbr = stateZipMatch[1];
        console.log(`🏛️ Extracted state abbreviation: "${stateAbbr}"`);
        return stateAbbr;
      }
      
      // Look for just state abbreviation like "SC"
      if (/^[A-Z]{2}$/.test(part)) {
        console.log(`🏛️ Extracted state abbreviation: "${part}"`);
        return part;
      }
      
      // Look for full state names like "South Carolina"
      const fullStateNames = [
        'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 
        'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 
        'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 
        'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 
        'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 
        'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 
        'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 
        'Wisconsin', 'Wyoming'
      ];
      
      if (fullStateNames.some(state => part.toLowerCase() === state.toLowerCase())) {
        console.log(`🏛️ Extracted full state name: "${part}"`);
        return part;
      }
    }
    
    console.log(`🏛️ Could not extract state from address`);
    return '';
  }

  private getFullStateName(state: string): string {
    const stateMap: { [key: string]: string } = {
      'SC': 'South Carolina', 'South Carolina': 'South Carolina',
      'NC': 'North Carolina', 'North Carolina': 'North Carolina', 
      'GA': 'Georgia', 'Georgia': 'Georgia',
      'FL': 'Florida', 'Florida': 'Florida',
      'VA': 'Virginia', 'Virginia': 'Virginia',
      'TN': 'Tennessee', 'Tennessee': 'Tennessee',
      'AL': 'Alabama', 'Alabama': 'Alabama',
      'KY': 'Kentucky', 'Kentucky': 'Kentucky',
      'WV': 'West Virginia', 'West Virginia': 'West Virginia',
      'MD': 'Maryland', 'Maryland': 'Maryland',
      'DE': 'Delaware', 'Delaware': 'Delaware',
      'NJ': 'New Jersey', 'New Jersey': 'New Jersey',
      'PA': 'Pennsylvania', 'Pennsylvania': 'Pennsylvania',
      'NY': 'New York', 'New York': 'New York',
      'CT': 'Connecticut', 'Connecticut': 'Connecticut',
      'RI': 'Rhode Island', 'Rhode Island': 'Rhode Island',
      'MA': 'Massachusetts', 'Massachusetts': 'Massachusetts',
      'VT': 'Vermont', 'Vermont': 'Vermont',
      'NH': 'New Hampshire', 'New Hampshire': 'New Hampshire',
      'ME': 'Maine', 'Maine': 'Maine',
      'OR': 'Oregon', 'Oregon': 'Oregon',
      'WA': 'Washington', 'Washington': 'Washington',
      'CA': 'California', 'California': 'California',
      'NV': 'Nevada', 'Nevada': 'Nevada',
      'ID': 'Idaho', 'Idaho': 'Idaho',
      'MT': 'Montana', 'Montana': 'Montana',
      'WY': 'Wyoming', 'Wyoming': 'Wyoming',
      'CO': 'Colorado', 'Colorado': 'Colorado',
      'UT': 'Utah', 'Utah': 'Utah',
      'AZ': 'Arizona', 'Arizona': 'Arizona',
      'NM': 'New Mexico', 'New Mexico': 'New Mexico',
      'TX': 'Texas', 'Texas': 'Texas',
      'OH': 'Ohio', 'Ohio': 'Ohio',
      'IN': 'Indiana', 'Indiana': 'Indiana',
      'IL': 'Illinois', 'Illinois': 'Illinois',
      'MI': 'Michigan', 'Michigan': 'Michigan',
      'WI': 'Wisconsin', 'Wisconsin': 'Wisconsin',
      'MN': 'Minnesota', 'Minnesota': 'Minnesota',
      'IA': 'Iowa', 'Iowa': 'Iowa',
      'MO': 'Missouri', 'Missouri': 'Missouri',
      'AR': 'Arkansas', 'Arkansas': 'Arkansas',
      'LA': 'Louisiana', 'Louisiana': 'Louisiana',
      'MS': 'Mississippi', 'Mississippi': 'Mississippi',
      'OK': 'Oklahoma', 'Oklahoma': 'Oklahoma',
      'KS': 'Kansas', 'Kansas': 'Kansas',
      'NE': 'Nebraska', 'Nebraska': 'Nebraska',
      'SD': 'South Dakota', 'South Dakota': 'South Dakota',
      'ND': 'North Dakota', 'North Dakota': 'North Dakota',
      'AK': 'Alaska', 'Alaska': 'Alaska',
      'HI': 'Hawaii', 'Hawaii': 'Hawaii'
    };
    return stateMap[state] || state;
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
      'Texas': 'TX', 'TX': 'TX',
      'Ohio': 'OH', 'OH': 'OH',
      'Indiana': 'IN', 'IN': 'IN',
      'Illinois': 'IL', 'IL': 'IL',
      'Michigan': 'MI', 'MI': 'MI',
      'Wisconsin': 'WI', 'WI': 'WI',
      'Minnesota': 'MN', 'MN': 'MN',
      'Iowa': 'IA', 'IA': 'IA',
      'Missouri': 'MO', 'MO': 'MO',
      'Arkansas': 'AR', 'AR': 'AR',
      'Louisiana': 'LA', 'LA': 'LA',
      'Mississippi': 'MS', 'MS': 'MS',
      'Oklahoma': 'OK', 'OK': 'OK',
      'Kansas': 'KS', 'KS': 'KS',
      'Nebraska': 'NE', 'NE': 'NE',
      'South Dakota': 'SD', 'SD': 'SD',
      'North Dakota': 'ND', 'ND': 'ND',
      'Alaska': 'AK', 'AK': 'AK',
      'Hawaii': 'HI', 'HI': 'HI'
    };
    return stateMap[state] || state;
  }
}
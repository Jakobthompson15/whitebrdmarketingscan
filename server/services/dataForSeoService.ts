import axios from 'axios';

export interface DataForSeoConfig {
  login: string;
  password: string;
  baseUrl?: string;
}

export interface SerpResult {
  keyword: string;
  position: number;
  url: string;
  title: string;
  description: string;
  rating?: number;
  reviews?: number;
}

export interface KeywordData {
  keyword: string;
  searchVolume: number;
  competition: number;
  cpc: number;
  trend: number[];
}

export class DataForSeoService {
  private auth: string;
  private baseUrl: string;

  constructor(config?: DataForSeoConfig) {
    const login = config?.login || process.env.DATAFORSEO_LOGIN || '';
    const password = config?.password || process.env.DATAFORSEO_PASSWORD || '';
    
    if (!login || !password) {
      console.log('⚠️ DataForSEO credentials not configured');
    }
    
    this.auth = Buffer.from(`${login}:${password}`).toString('base64');
    this.baseUrl = config?.baseUrl || 'https://api.dataforseo.com/v3';
  }

  async getSerpResults(keywords: string[], location: string = 'United States'): Promise<SerpResult[]> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/serp/google/organic/live/advanced`,
        [{
          keyword: keywords.join(' '),
          location_name: location,
          language_code: 'en',
          device: 'desktop',
          depth: 100
        }],
        {
          headers: {
            'Authorization': `Basic ${this.auth}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.tasks?.[0]?.result?.[0]?.items) {
        return this.parseSerpResults(response.data.tasks[0].result[0].items);
      }
      
      return [];
    } catch (error) {
      console.error('DataForSEO SERP error:', error);
      return [];
    }
  }

  async getKeywordData(keywords: string[]): Promise<KeywordData[]> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/keywords_data/google_ads/search_volume/live`,
        [{
          keywords: keywords,
          location_name: 'United States',
          language_code: 'en'
        }],
        {
          headers: {
            'Authorization': `Basic ${this.auth}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.tasks?.[0]?.result) {
        return this.parseKeywordData(response.data.tasks[0].result);
      }
      
      return [];
    } catch (error) {
      console.error('DataForSEO Keywords error:', error);
      return [];
    }
  }

  async getCompetitorDomains(domain: string): Promise<any[]> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/dataforseo_labs/google/competitors_domain/live`,
        [{
          target: domain,
          location_name: 'United States',
          language_code: 'en',
          limit: 10
        }],
        {
          headers: {
            'Authorization': `Basic ${this.auth}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.tasks?.[0]?.result?.[0]?.items) {
        return response.data.tasks[0].result[0].items;
      }
      
      return [];
    } catch (error) {
      console.error('DataForSEO Competitors error:', error);
      return [];
    }
  }

  async getBacklinkData(target: string): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/backlinks/summary/live`,
        [{
          target: target,
          include_subdomains: true
        }],
        {
          headers: {
            'Authorization': `Basic ${this.auth}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.tasks?.[0]?.result?.[0]) {
        return response.data.tasks[0].result[0];
      }
      
      return null;
    } catch (error) {
      console.error('DataForSEO Backlinks error:', error);
      return null;
    }
  }

  async getLocalPackResults(keyword: string, location: string): Promise<any[]> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/serp/google/local_pack/live/regular`,
        [{
          keyword: keyword,
          location_name: location,
          language_code: 'en'
        }],
        {
          headers: {
            'Authorization': `Basic ${this.auth}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.tasks?.[0]?.result?.[0]?.items) {
        return response.data.tasks[0].result[0].items;
      }
      
      return [];
    } catch (error) {
      console.error('DataForSEO Local Pack error:', error);
      return [];
    }
  }

  private parseSerpResults(items: any[]): SerpResult[] {
    return items
      .filter(item => item.type === 'organic')
      .map(item => ({
        keyword: item.keyword || '',
        position: item.rank_group || 0,
        url: item.url || '',
        title: item.title || '',
        description: item.description || '',
        rating: item.rating?.value,
        reviews: item.rating?.votes_count
      }));
  }

  private parseKeywordData(results: any[]): KeywordData[] {
    return results.map(result => ({
      keyword: result.keyword || '',
      searchVolume: result.search_volume || 0,
      competition: result.competition || 0,
      cpc: result.cpc || 0,
      trend: result.monthly_searches || []
    }));
  }
}
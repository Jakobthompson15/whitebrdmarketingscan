import { DataForSeoService } from './dataForSeoService';

export interface PromptAction {
  type: 'keyword_research' | 'competitor_analysis' | 'backlink_analysis' | 'serp_analysis' | 'local_seo';
  params: any;
}

export interface PromptResult {
  prompt: string;
  timestamp: string;
  data: any;
  summary: string;
}

export class DataForSeoPromptService {
  private dataForSeo: DataForSeoService;

  constructor() {
    this.dataForSeo = new DataForSeoService();
  }

  async executePrompt(prompt: string, context: any): Promise<PromptResult> {
    const actions = this.parsePrompt(prompt, context);
    
    const results: any = {};
    
    for (const action of actions) {
      switch (action.type) {
        case 'keyword_research':
          results['keywords'] = await this.dataForSeo.getKeywordData(action.params.keywords || []);
          break;
        case 'competitor_analysis':
          results['competitors'] = await this.dataForSeo.getCompetitorDomains(action.params.domain || '');
          break;
        case 'backlink_analysis':
          results['backlinks'] = await this.dataForSeo.getBacklinkData(action.params.target || '');
          break;
        case 'serp_analysis':
          results['serp'] = await this.dataForSeo.getSerpResults(
            action.params.keywords || [], 
            action.params.location || 'United States'
          );
          break;
        case 'local_seo':
          results['local'] = await this.dataForSeo.getLocalPackResults(
            action.params.keyword || '',
            action.params.location || 'United States'
          );
          break;
      }
    }
    
    return this.formatResults(results, prompt);
  }

  private parsePrompt(prompt: string, context: any): PromptAction[] {
    const actions: PromptAction[] = [];
    const lowerPrompt = prompt.toLowerCase();
    
    // Extract business context
    const business = context.business;
    const domain = business?.website ? this.extractDomain(business.website) : '';
    const serviceType = business?.serviceType || '';
    const location = business?.address ? this.extractLocation(business.address) : 'United States';

    // Generate contextual keywords
    const contextualKeywords = this.generateContextualKeywords(serviceType, location);

    // Keyword research patterns
    if (lowerPrompt.match(/keyword|search volume|seo opportunity|ranking/i)) {
      actions.push({ 
        type: 'keyword_research', 
        params: { keywords: contextualKeywords }
      });
    }
    
    // Competitor patterns
    if (lowerPrompt.match(/competitor|competing|rivalry|market analysis/i)) {
      if (domain) {
        actions.push({ 
          type: 'competitor_analysis', 
          params: { domain }
        });
      }
    }
    
    // Backlink patterns
    if (lowerPrompt.match(/backlink|link|authority|domain strength/i)) {
      if (domain) {
        actions.push({ 
          type: 'backlink_analysis', 
          params: { target: domain }
        });
      }
    }
    
    // SERP patterns
    if (lowerPrompt.match(/ranking|position|serp|google results/i)) {
      actions.push({ 
        type: 'serp_analysis', 
        params: { keywords: contextualKeywords, location }
      });
    }
    
    // Local SEO patterns
    if (lowerPrompt.match(/local|map|nearby|location|local pack/i)) {
      actions.push({ 
        type: 'local_seo', 
        params: { 
          keyword: `${serviceType} near me`,
          location 
        }
      });
    }

    // If no specific patterns matched, default to keyword research
    if (actions.length === 0) {
      actions.push({ 
        type: 'keyword_research', 
        params: { keywords: contextualKeywords }
      });
    }
    
    return actions;
  }

  private generateContextualKeywords(serviceType: string, location: string): string[] {
    const keywords = [];
    
    if (serviceType) {
      keywords.push(
        serviceType,
        `${serviceType} service`,
        `${serviceType} contractor`,
        `${serviceType} repair`,
        `emergency ${serviceType}`,
        `best ${serviceType}`,
        `${serviceType} near me`
      );

      // Add location-based keywords
      if (location && location !== 'United States') {
        keywords.push(
          `${serviceType} ${location}`,
          `${location} ${serviceType} service`,
          `${location} ${serviceType} contractor`
        );
      }
    }

    return keywords.slice(0, 10); // Limit to avoid API quota issues
  }

  private extractDomain(website: string): string {
    if (!website) return '';
    
    try {
      const url = new URL(website.startsWith('http') ? website : `https://${website}`);
      return url.hostname.replace('www.', '');
    } catch {
      return website.replace('www.', '').replace('https://', '').replace('http://', '');
    }
  }

  private extractLocation(address: string): string {
    const parts = address.split(',');
    if (parts.length >= 2) {
      return parts[parts.length - 2].trim();
    }
    return 'United States';
  }

  private formatResults(results: any, prompt: string): PromptResult {
    return {
      prompt,
      timestamp: new Date().toISOString(),
      data: results,
      summary: this.generateSummary(results)
    };
  }

  private generateSummary(results: any): string {
    const summaryParts: string[] = [];
    
    if (results.keywords?.length > 0) {
      const totalVolume = results.keywords.reduce((sum: number, kw: any) => sum + (kw.searchVolume || 0), 0);
      summaryParts.push(`Found ${results.keywords.length} keyword opportunities with ${totalVolume.toLocaleString()} total monthly searches`);
    }
    
    if (results.competitors?.length > 0) {
      summaryParts.push(`Identified ${results.competitors.length} competing domains`);
    }
    
    if (results.backlinks) {
      const backlinks = results.backlinks.backlinks || 0;
      const domains = results.backlinks.referring_domains || 0;
      summaryParts.push(`Domain has ${backlinks.toLocaleString()} backlinks from ${domains.toLocaleString()} referring domains`);
    }
    
    if (results.serp?.length > 0) {
      const topPositions = results.serp.filter((item: any) => item.position <= 3);
      summaryParts.push(`Found ${results.serp.length} SERP results with ${topPositions.length} in top 3 positions`);
    }
    
    if (results.local?.length > 0) {
      summaryParts.push(`Found ${results.local.length} local pack results`);
    }
    
    return summaryParts.join('. ') || 'Analysis completed successfully';
  }

  // Method to handle specific prompt types
  async handleSpecificPrompt(promptType: string, business: any, additionalParams?: any): Promise<PromptResult> {
    const context = { business, ...additionalParams };
    
    const prompts: Record<string, string> = {
      'keyword_opportunities': 'Find keyword opportunities and search volume data for this business',
      'competitor_landscape': 'Analyze the competitive landscape and identify main competitors',
      'backlink_profile': 'Analyze the backlink profile and domain authority',
      'local_seo_analysis': 'Perform local SEO analysis and local pack presence check',
      'serp_positioning': 'Check current SERP positioning for relevant keywords',
      'comprehensive_audit': 'Perform a comprehensive SEO audit including keywords, competitors, backlinks, and local presence'
    };
    
    const prompt = prompts[promptType] || promptType;
    return this.executePrompt(prompt, context);
  }
}
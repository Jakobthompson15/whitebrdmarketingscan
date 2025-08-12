import OpenAI from "openai";
import { BusinessSuggestion } from './googlePlacesService';
import { CompetitorAnalysisResult } from './competitorAnalysisService';

export interface AIInsights {
  executiveSummary: string;
  keyFindings: string[];
  strategicRecommendations: string[];
  marketOpportunities: string[];
  competitiveAdvantages: string[];
  actionItems: string[];
  riskFactors: string[];
}

export interface ReviewAnalysis {
  overallSentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  keyThemes: string[];
  commonComplaints: string[];
  commonPraises: string[];
  competitiveInsights: string[];
}

export class AIAnalysisService {
  private openai: OpenAI | null = null;
  private isEnabled: boolean;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey || apiKey === "mock_key") {
      this.isEnabled = false;
      console.log('🔧 AI Analysis disabled - no OpenAI API key');
    } else {
      this.openai = new OpenAI({ apiKey });
      this.isEnabled = true;
      console.log('🧠 AI Analysis enabled');
    }
  }

  async generateCompetitorInsights(
    targetBusiness: BusinessSuggestion,
    competitorData: CompetitorAnalysisResult
  ): Promise<AIInsights> {
    if (!this.isEnabled) {
      return this.getMockInsights();
    }

    try {
      const prompt = this.createCompetitorAnalysisPrompt(targetBusiness, competitorData);
      
      const response = await this.openai!.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert business analyst specializing in home service industries. Provide actionable insights based on competitive analysis data. Respond with JSON in the exact format requested."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      const insights = JSON.parse(response.choices[0].message.content || '{}');
      return this.validateInsights(insights);
      
    } catch (error) {
      console.error('Error generating AI insights:', error);
      return this.getMockInsights();
    }
  }

  async analyzeReviews(
    businessName: string,
    reviewData: string[]
  ): Promise<ReviewAnalysis> {
    if (!this.isEnabled || !reviewData.length) {
      return this.getMockReviewAnalysis();
    }

    try {
      const prompt = this.createReviewAnalysisPrompt(businessName, reviewData);
      
      const response = await this.openai!.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert at analyzing customer reviews for home service businesses. Extract sentiment, themes, and competitive insights. Respond with JSON in the exact format requested."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.5
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      return this.validateReviewAnalysis(analysis);
      
    } catch (error) {
      console.error('Error analyzing reviews:', error);
      return this.getMockReviewAnalysis();
    }
  }

  async generateMarketStrategy(
    targetBusiness: BusinessSuggestion,
    competitors: BusinessSuggestion[],
    marketData: any
  ): Promise<string[]> {
    if (!this.isEnabled) {
      return [
        "Expand service offerings to include emergency repairs",
        "Implement customer loyalty program",
        "Focus on digital marketing to improve online presence"
      ];
    }

    try {
      const prompt = `
        Analyze this home service business and generate 5-7 specific strategic recommendations:
        
        TARGET BUSINESS:
        - Name: ${targetBusiness.name}
        - Service: ${targetBusiness.serviceType}
        - Rating: ${targetBusiness.rating}/5 (${targetBusiness.reviewCount} reviews)
        - Location: ${targetBusiness.address}
        
        COMPETITOR LANDSCAPE:
        ${competitors.slice(0, 5).map(comp => 
          `- ${comp.name}: ${comp.rating}/5 (${comp.reviewCount} reviews) - ${comp.serviceType}`
        ).join('\n')}
        
        MARKET DATA:
        - Total competitors: ${competitors.length}
        - Average competitor rating: ${(competitors.reduce((sum, c) => sum + c.rating, 0) / competitors.length).toFixed(1)}
        
        Provide actionable, specific strategies this business can implement to gain competitive advantage.
        Respond with JSON: {"strategies": ["strategy1", "strategy2", ...]}
      `;

      const response = await this.openai!.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.8
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result.strategies || [];
      
    } catch (error) {
      console.error('Error generating market strategy:', error);
      return [
        "Improve online reputation management",
        "Develop specialized service niches",
        "Enhance customer communication systems"
      ];
    }
  }

  private createCompetitorAnalysisPrompt(
    business: BusinessSuggestion,
    data: CompetitorAnalysisResult
  ): string {
    return `
      Analyze this home service business competitive landscape and provide strategic insights:

      TARGET BUSINESS:
      - Name: ${business.name}
      - Service Type: ${business.serviceType}
      - Rating: ${business.rating}/5 stars
      - Reviews: ${business.reviewCount}
      - Location: ${business.address}

      COMPETITIVE ANALYSIS:
      - Market Position: #${data.marketPosition} out of ${data.competitors.length + 1}
      - Competitive Score: ${data.competitiveScore}/100
      - Performance Score: ${data.performanceScore}/100
      - Market Share: ${data.marketAnalysis.marketShare}%

      TOP COMPETITORS:
      ${data.competitors.slice(0, 5).map((comp, i) => 
        `${i + 1}. ${comp.name} - ${comp.rating}/5 (${comp.reviewCount} reviews)`
      ).join('\n')}

      CURRENT STRENGTHS: ${data.strengths.join(', ')}
      CURRENT OPPORTUNITIES: ${data.opportunities.join(', ')}

      Provide a comprehensive analysis in JSON format:
      {
        "executiveSummary": "2-3 sentence overview of competitive position",
        "keyFindings": ["finding1", "finding2", "finding3"],
        "strategicRecommendations": ["rec1", "rec2", "rec3", "rec4"],
        "marketOpportunities": ["opp1", "opp2", "opp3"],
        "competitiveAdvantages": ["advantage1", "advantage2"],
        "actionItems": ["action1", "action2", "action3"],
        "riskFactors": ["risk1", "risk2"]
      }
    `;
  }

  private createReviewAnalysisPrompt(businessName: string, reviews: string[]): string {
    return `
      Analyze customer reviews for ${businessName} and extract insights:

      REVIEWS TO ANALYZE:
      ${reviews.slice(0, 20).map((review, i) => `${i + 1}. ${review}`).join('\n')}

      Provide analysis in JSON format:
      {
        "overallSentiment": "positive|negative|neutral",
        "sentimentScore": 0.0-1.0,
        "keyThemes": ["theme1", "theme2", "theme3"],
        "commonComplaints": ["complaint1", "complaint2"],
        "commonPraises": ["praise1", "praise2"],
        "competitiveInsights": ["insight1", "insight2"]
      }
    `;
  }

  private validateInsights(insights: any): AIInsights {
    return {
      executiveSummary: insights.executiveSummary || "Analysis completed successfully.",
      keyFindings: insights.keyFindings || [],
      strategicRecommendations: insights.strategicRecommendations || [],
      marketOpportunities: insights.marketOpportunities || [],
      competitiveAdvantages: insights.competitiveAdvantages || [],
      actionItems: insights.actionItems || [],
      riskFactors: insights.riskFactors || []
    };
  }

  private validateReviewAnalysis(analysis: any): ReviewAnalysis {
    return {
      overallSentiment: analysis.overallSentiment || 'neutral',
      sentimentScore: analysis.sentimentScore || 0.5,
      keyThemes: analysis.keyThemes || [],
      commonComplaints: analysis.commonComplaints || [],
      commonPraises: analysis.commonPraises || [],
      competitiveInsights: analysis.competitiveInsights || []
    };
  }

  private getMockInsights(): AIInsights {
    return {
      executiveSummary: "This business shows strong potential with competitive ratings but faces challenges in market visibility and service differentiation.",
      keyFindings: [
        "Strong customer satisfaction scores indicate quality service delivery",
        "Lower review volume suggests limited market reach compared to competitors",
        "Service pricing appears competitive within market range"
      ],
      strategicRecommendations: [
        "Implement aggressive digital marketing campaign to increase online visibility",
        "Develop specialized service packages to differentiate from competitors",
        "Launch customer referral program to boost review volume",
        "Consider expanding service hours to capture emergency service market"
      ],
      marketOpportunities: [
        "Growing demand for eco-friendly service solutions",
        "Underserved commercial client segment in local market",
        "Opportunity for maintenance contract services"
      ],
      competitiveAdvantages: [
        "Higher customer satisfaction ratings than market average",
        "Established local presence and reputation"
      ],
      actionItems: [
        "Set up Google Ads campaign targeting local service keywords",
        "Create customer feedback collection system",
        "Develop partnership with local suppliers for competitive pricing"
      ],
      riskFactors: [
        "Increased competition from national service chains",
        "Seasonal demand fluctuations affecting revenue stability"
      ]
    };
  }

  private getMockReviewAnalysis(): ReviewAnalysis {
    return {
      overallSentiment: 'positive',
      sentimentScore: 0.75,
      keyThemes: ["Quality service", "Professional staff", "Timely response"],
      commonComplaints: ["Pricing concerns", "Scheduling difficulties"],
      commonPraises: ["Expert knowledge", "Clean work area", "Reliable service"],
      competitiveInsights: ["Customers value responsiveness over lowest price", "Professional appearance is important factor"]
    };
  }
}
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GooglePlacesService } from "./services/googlePlacesService";
import { CompetitorAnalysisService } from "./services/competitorAnalysisService";
import { insertBusinessSchema, insertAnalysisSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const googlePlaces = new GooglePlacesService();
  const competitorAnalysis = new CompetitorAnalysisService();

  // Search businesses endpoint
  app.get("/api/search/businesses", async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string' || q.length < 2) {
        return res.json({ success: false, results: [], error: 'Query must be at least 2 characters' });
      }

      console.log(`🔍 Searching for businesses: ${q}`);
      const businesses = await googlePlaces.searchBusinesses(q);
      
      res.json({
        success: true,
        results: businesses,
        totalResults: businesses.length
      });
    } catch (error) {
      console.error('Business search error:', error);
      res.status(500).json({
        success: false,
        results: [],
        error: 'Failed to search businesses'
      });
    }
  });

  // Start competitor analysis endpoint
  app.post("/api/analysis/start", async (req, res) => {
    try {
      const businessData = req.body;
      
      // Validate business data
      const validatedBusiness = insertBusinessSchema.parse({
        placeId: businessData.placeId,
        businessName: businessData.name,
        address: businessData.address,
        serviceType: businessData.serviceType,
        rating: businessData.rating?.toString(),
        reviewCount: businessData.reviewCount,
        latitude: businessData.location?.lat?.toString(),
        longitude: businessData.location?.lng?.toString(),
        phone: businessData.publicInfo?.phone,
        website: businessData.publicInfo?.website,
        hours: businessData.publicInfo?.hours,
        photos: businessData.publicInfo?.photos,
        businessStatus: businessData.publicInfo?.businessStatus,
        currentlyOpen: businessData.publicInfo?.currentlyOpen
      });

      // Store business in database
      const savedBusiness = await storage.createBusiness(validatedBusiness);
      
      // Set up Server-Sent Events
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });

      // Send progress updates
      const sendProgress = (progress: number, message: string) => {
        res.write(`data: ${JSON.stringify({ progress, message })}\n\n`);
      };

      try {
        sendProgress(15, "Analyzing service area coverage...");
        await new Promise(resolve => setTimeout(resolve, 1000));

        sendProgress(30, "Checking emergency service rankings...");
        await new Promise(resolve => setTimeout(resolve, 1000));

        sendProgress(45, "Evaluating competitor landscape...");
        const analysisResult = await competitorAnalysis.analyzeCompetition(businessData);
        
        sendProgress(60, "Analyzing customer trust signals...");
        await new Promise(resolve => setTimeout(resolve, 800));

        sendProgress(75, "Reviewing pricing intelligence...");
        await new Promise(resolve => setTimeout(resolve, 800));

        sendProgress(90, "Generating growth opportunities...");
        
        // Save analysis results
        const analysisData = insertAnalysisSchema.parse({
          targetBusinessId: savedBusiness.id,
          marketPosition: analysisResult.marketPosition,
          competitiveScore: analysisResult.competitiveScore,
          performanceScore: analysisResult.performanceScore,
          strengths: analysisResult.strengths,
          opportunities: analysisResult.opportunities,
          competitorData: analysisResult.competitors,
          marketShare: analysisResult.marketAnalysis.marketShare.toString(),
          averageCompetitorRating: analysisResult.marketAnalysis.averageRating.toString(),
          totalCompetitors: analysisResult.marketAnalysis.totalCompetitors
        });

        const savedAnalysis = await storage.createAnalysis(analysisData);
        
        sendProgress(100, "Analysis complete!");
        
        // Send final results
        res.write(`data: ${JSON.stringify({
          progress: 100,
          message: "Analysis complete!",
          completed: true,
          analysisId: savedAnalysis.id,
          businessId: savedBusiness.id
        })}\n\n`);
        
        res.end();
      } catch (analysisError) {
        console.error('Analysis error:', analysisError);
        res.write(`data: ${JSON.stringify({
          progress: 0,
          message: "Analysis failed",
          error: "Failed to complete analysis"
        })}\n\n`);
        res.end();
      }
    } catch (error) {
      console.error('Start analysis error:', error);
      res.status(400).json({
        success: false,
        error: 'Invalid business data'
      });
    }
  });

  // Get analysis results endpoint
  app.get("/api/analysis/:analysisId", async (req, res) => {
    try {
      const { analysisId } = req.params;
      const analysis = await storage.getAnalysisById(parseInt(analysisId));
      
      if (!analysis) {
        return res.status(404).json({
          success: false,
          error: 'Analysis not found'
        });
      }

      const business = await storage.getBusinessById(analysis.targetBusinessId!);
      
      res.json({
        success: true,
        analysis,
        business
      });
    } catch (error) {
      console.error('Get analysis error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve analysis'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

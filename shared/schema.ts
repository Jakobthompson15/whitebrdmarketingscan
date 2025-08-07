import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, json, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const homeServiceBusinesses = pgTable("home_service_businesses", {
  id: serial("id").primaryKey(),
  placeId: text("place_id").notNull().unique(),
  businessName: text("business_name").notNull(),
  address: text("address"),
  serviceType: text("service_type").notNull(),
  
  // Ratings and Reviews
  rating: decimal("rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").default(0),
  priceLevel: integer("price_level"),
  
  // Business Status
  businessStatus: text("business_status").default("OPERATIONAL"),
  currentlyOpen: boolean("currently_open"),
  
  // Location
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  
  // Public Information
  phone: text("phone"),
  website: text("website"),
  hours: json("hours"),
  photos: integer("photos").default(0),
  
  // Service Capabilities
  emergencyService: boolean("emergency_service").default(false),
  commercialService: boolean("commercial_service").default(false),
  residentialService: boolean("residential_service").default(true),
  
  // Competitive Metrics
  competitiveScore: integer("competitive_score"),
  marketPosition: integer("market_position"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const competitorAnalyses = pgTable("competitor_analyses", {
  id: serial("id").primaryKey(),
  targetBusinessId: integer("target_business_id").references(() => homeServiceBusinesses.id),
  
  // Analysis Results
  marketPosition: integer("market_position"),
  competitiveScore: integer("competitive_score"),
  performanceScore: integer("performance_score"),
  
  // Competitive Intelligence
  strengths: json("strengths").$type<string[]>(),
  opportunities: json("opportunities").$type<string[]>(),
  competitorData: json("competitor_data"),
  
  // Market Analysis
  marketShare: decimal("market_share", { precision: 5, scale: 2 }),
  averageCompetitorRating: decimal("average_competitor_rating", { precision: 3, scale: 2 }),
  totalCompetitors: integer("total_competitors"),
  
  scanDate: timestamp("scan_date").defaultNow()
});

// Relations
export const businessRelations = relations(homeServiceBusinesses, ({ many }) => ({
  analyses: many(competitorAnalyses)
}));

export const analysisRelations = relations(competitorAnalyses, ({ one }) => ({
  targetBusiness: one(homeServiceBusinesses, {
    fields: [competitorAnalyses.targetBusinessId],
    references: [homeServiceBusinesses.id]
  })
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertBusinessSchema = createInsertSchema(homeServiceBusinesses).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertAnalysisSchema = createInsertSchema(competitorAnalyses).omit({
  id: true,
  scanDate: true
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Business = typeof homeServiceBusinesses.$inferSelect;
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type CompetitorAnalysis = typeof competitorAnalyses.$inferSelect;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;

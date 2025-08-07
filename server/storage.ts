import { users, homeServiceBusinesses, competitorAnalyses, type User, type InsertUser, type Business, type InsertBusiness, type CompetitorAnalysis, type InsertAnalysis } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Storage interface
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  createBusiness(insertBusiness: InsertBusiness): Promise<Business>;
  getBusinessById(id: number): Promise<Business | undefined>;
  createAnalysis(insertAnalysis: InsertAnalysis): Promise<CompetitorAnalysis>;
  getAnalysisById(id: number): Promise<CompetitorAnalysis | undefined>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createBusiness(insertBusiness: InsertBusiness): Promise<Business> {
    const [business] = await db
      .insert(homeServiceBusinesses)
      .values(insertBusiness)
      .returning();
    return business;
  }

  async getBusinessById(id: number): Promise<Business | undefined> {
    const [business] = await db.select().from(homeServiceBusinesses).where(eq(homeServiceBusinesses.id, id));
    return business || undefined;
  }

  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<CompetitorAnalysis> {
    const [analysis] = await db
      .insert(competitorAnalyses)
      .values([insertAnalysis])
      .returning();
    return analysis;
  }

  async getAnalysisById(id: number): Promise<CompetitorAnalysis | undefined> {
    const [analysis] = await db.select().from(competitorAnalyses).where(eq(competitorAnalyses.id, id));
    return analysis || undefined;
  }
}

export const storage = new DatabaseStorage();
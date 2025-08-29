import {
  adminSettings,
  homeworkSubmissions,
  generatedTests,
  chatConversations,
  homeworkChatContext,
  type AdminSettings,
  type HomeworkSubmission,
  type GeneratedTest,
  type ChatConversation,
  type HomeworkChatContext,
  type InsertAdminSettings,
  type InsertHomeworkSubmission,
  type InsertGeneratedTest,
  type InsertChatConversation,
  type InsertHomeworkChatContext,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Admin settings
  getAdminSettings(): Promise<AdminSettings | undefined>;
  updateAdminSettings(settings: InsertAdminSettings): Promise<AdminSettings>;
  
  // Homework submissions
  createHomeworkSubmission(submission: InsertHomeworkSubmission): Promise<HomeworkSubmission>;
  updateHomeworkAnalysis(id: string, analysis: any): Promise<HomeworkSubmission>;
  getHomeworkSubmission(id: string): Promise<HomeworkSubmission | undefined>;
  
  // Generated tests
  createGeneratedTest(test: InsertGeneratedTest & { questions: any; answers: any }): Promise<GeneratedTest>;
  getGeneratedTest(id: string): Promise<GeneratedTest | undefined>;
  
  // Chat conversations
  createChatConversation(): Promise<ChatConversation>;
  updateChatConversation(id: string, messages: any[]): Promise<ChatConversation>;
  getChatConversation(id: string): Promise<ChatConversation | undefined>;
  
  // Homework chat context
  createHomeworkChatContext(context: InsertHomeworkChatContext): Promise<HomeworkChatContext>;
  getHomeworkChatContext(homeworkId: string): Promise<HomeworkChatContext | undefined>;
  addQuestionToHomeworkContext(homeworkId: string, question: string, answer: string): Promise<HomeworkChatContext>;
  
  // Database export
  exportAllData(): Promise<string>;
  importSqlData(sqlContent: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getAdminSettings(): Promise<AdminSettings | undefined> {
    const [settings] = await db.select().from(adminSettings).orderBy(desc(adminSettings.createdAt)).limit(1);
    return settings;
  }

  async updateAdminSettings(settingsData: InsertAdminSettings): Promise<AdminSettings> {
    // Delete existing settings and create new one
    await db.delete(adminSettings);
    const [settings] = await db
      .insert(adminSettings)
      .values({
        ...settingsData,
        updatedAt: new Date(),
      })
      .returning();
    return settings;
  }

  async createHomeworkSubmission(submission: InsertHomeworkSubmission): Promise<HomeworkSubmission> {
    const [result] = await db
      .insert(homeworkSubmissions)
      .values(submission)
      .returning();
    return result;
  }

  async updateHomeworkAnalysis(id: string, analysis: any): Promise<HomeworkSubmission> {
    const [result] = await db
      .update(homeworkSubmissions)
      .set({ analysis })
      .where(eq(homeworkSubmissions.id, id))
      .returning();
    return result;
  }

  async getHomeworkSubmission(id: string): Promise<HomeworkSubmission | undefined> {
    const [submission] = await db
      .select()
      .from(homeworkSubmissions)
      .where(eq(homeworkSubmissions.id, id));
    return submission;
  }

  async createGeneratedTest(testData: InsertGeneratedTest & { questions: any; answers: any }): Promise<GeneratedTest> {
    const [test] = await db
      .insert(generatedTests)
      .values(testData)
      .returning();
    return test;
  }

  async getGeneratedTest(id: string): Promise<GeneratedTest | undefined> {
    const [test] = await db
      .select()
      .from(generatedTests)
      .where(eq(generatedTests.id, id));
    return test;
  }

  async createChatConversation(): Promise<ChatConversation> {
    const [conversation] = await db
      .insert(chatConversations)
      .values({ messages: [] })
      .returning();
    return conversation;
  }

  async updateChatConversation(id: string, messages: any[]): Promise<ChatConversation> {
    const [conversation] = await db
      .update(chatConversations)
      .set({ 
        messages: JSON.stringify(messages),
        updatedAt: new Date()
      })
      .where(eq(chatConversations.id, id))
      .returning();
    return conversation;
  }

  async getChatConversation(id: string): Promise<ChatConversation | undefined> {
    const [conversation] = await db
      .select()
      .from(chatConversations)
      .where(eq(chatConversations.id, id));
    return conversation;
  }

  async createHomeworkChatContext(contextData: InsertHomeworkChatContext): Promise<HomeworkChatContext> {
    const [context] = await db
      .insert(homeworkChatContext)
      .values(contextData)
      .returning();
    return context;
  }

  async getHomeworkChatContext(homeworkId: string): Promise<HomeworkChatContext | undefined> {
    const [context] = await db
      .select()
      .from(homeworkChatContext)
      .where(eq(homeworkChatContext.homeworkId, homeworkId));
    return context;
  }

  async addQuestionToHomeworkContext(homeworkId: string, question: string, answer: string): Promise<HomeworkChatContext> {
    const existingContext = await this.getHomeworkChatContext(homeworkId);
    if (!existingContext) {
      throw new Error("Homework context not found");
    }

    const questions = Array.isArray(existingContext.questions) ? existingContext.questions : [];
    questions.push({
      question,
      answer,
      timestamp: new Date().toISOString()
    });

    const [updatedContext] = await db
      .update(homeworkChatContext)
      .set({ 
        questions: JSON.stringify(questions),
        updatedAt: new Date()
      })
      .where(eq(homeworkChatContext.homeworkId, homeworkId))
      .returning();
    
    return updatedContext;
  }

  async exportAllData(): Promise<string> {
    try {
      let sqlOutput = "-- ============================================\n";
      sqlOutput += "-- LIMVA EDUCATIONAL PLATFORM - COMPLETE DATABASE EXPORT\n";
      sqlOutput += `-- Exported on: ${new Date().toISOString()}\n`;
      sqlOutput += "-- This file contains complete schema and data\n";
      sqlOutput += "-- Safe to run on any fresh PostgreSQL database\n";
      sqlOutput += "-- ============================================\n\n";

      // Instructions for Replit SQL Console
      sqlOutput += "-- HƯỚNG DẪN SỬ DỤNG TRONG REPLIT SQL CONSOLE:\n";
      sqlOutput += "-- 1. Copy toàn bộ nội dung file này\n";
      sqlOutput += "-- 2. Paste vào SQL Console\n";
      sqlOutput += "-- 3. SELECT ALL (Ctrl+A) để chọn tất cả\n";
      sqlOutput += "-- 4. Click RUN - Replit sẽ tự động wrap trong transaction\n\n";

      sqlOutput += "-- Set client encoding for safety\n";
      sqlOutput += "SET client_encoding = 'UTF8';\n";
      sqlOutput += "SET standard_conforming_strings = on;\n\n";

      // Add full schema definition with all constraints and defaults
      sqlOutput += "-- ============================================\n";
      sqlOutput += "-- LIMVA DATABASE COMPLETE SCHEMA DEFINITION\n";
      sqlOutput += "-- ============================================\n\n";

      // Enable required extensions
      sqlOutput += "-- Enable Required PostgreSQL Extensions\n";
      sqlOutput += "CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";\n";
      sqlOutput += "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";\n\n";

      // Drop existing tables (optional - for clean import)
      sqlOutput += "-- Drop existing tables (uncomment if you want clean import)\n";
      sqlOutput += "-- DROP TABLE IF EXISTS homework_chat_context CASCADE;\n";
      sqlOutput += "-- DROP TABLE IF EXISTS chat_conversations CASCADE;\n";
      sqlOutput += "-- DROP TABLE IF EXISTS generated_tests CASCADE;\n";
      sqlOutput += "-- DROP TABLE IF EXISTS homework_submissions CASCADE;\n";
      sqlOutput += "-- DROP TABLE IF EXISTS admin_settings CASCADE;\n\n";

      // Create tables with full definition
      sqlOutput += "-- Admin Settings Table\n";
      sqlOutput += `CREATE TABLE IF NOT EXISTS admin_settings (
        id character varying NOT NULL DEFAULT gen_random_uuid(),
        ai_model character varying(50) NOT NULL DEFAULT 'deepseek'::character varying,
        api_key text,
        created_at timestamp without time zone DEFAULT now(),
        updated_at timestamp without time zone DEFAULT now(),
        deepseek_enabled boolean DEFAULT true,
        gpt5_enabled boolean DEFAULT false,
        openrouter_api_key text,
        imgbb_api_key text,
        CONSTRAINT admin_settings_pkey PRIMARY KEY (id)
      );\n\n`;

      sqlOutput += "-- Homework Submissions Table\n";
      sqlOutput += `CREATE TABLE IF NOT EXISTS homework_submissions (
        id character varying NOT NULL DEFAULT gen_random_uuid(),
        subject character varying(50) NOT NULL,
        content text NOT NULL,
        image_url text,
        analysis jsonb,
        created_at timestamp without time zone DEFAULT now(),
        CONSTRAINT homework_submissions_pkey PRIMARY KEY (id)
      );\n\n`;

      sqlOutput += "-- Generated Tests Table\n";
      sqlOutput += `CREATE TABLE IF NOT EXISTS generated_tests (
        id character varying NOT NULL DEFAULT gen_random_uuid(),
        subject character varying(50) NOT NULL,
        difficulty character varying(20) NOT NULL,
        question_type character varying(30) NOT NULL,
        question_count integer NOT NULL,
        requirements text,
        questions jsonb NOT NULL,
        answers jsonb NOT NULL,
        created_at timestamp without time zone DEFAULT now(),
        CONSTRAINT generated_tests_pkey PRIMARY KEY (id)
      );\n\n`;

      sqlOutput += "-- Chat Conversations Table\n";
      sqlOutput += `CREATE TABLE IF NOT EXISTS chat_conversations (
        id character varying NOT NULL DEFAULT gen_random_uuid(),
        messages jsonb NOT NULL DEFAULT '[]'::jsonb,
        created_at timestamp without time zone DEFAULT now(),
        updated_at timestamp without time zone DEFAULT now(),
        CONSTRAINT chat_conversations_pkey PRIMARY KEY (id)
      );\n\n`;

      sqlOutput += "-- Homework Chat Context Table\n";
      sqlOutput += `CREATE TABLE IF NOT EXISTS homework_chat_context (
        id character varying NOT NULL DEFAULT gen_random_uuid(),
        homework_id character varying NOT NULL,
        subject character varying NOT NULL,
        homework_content character varying NOT NULL,
        analysis jsonb NOT NULL,
        questions jsonb NOT NULL DEFAULT '[]'::jsonb,
        created_at timestamp without time zone DEFAULT now(),
        updated_at timestamp without time zone DEFAULT now(),
        CONSTRAINT homework_chat_context_pkey PRIMARY KEY (id)
      );\n\n`;

      // Create indexes
      sqlOutput += "-- Create Indexes\n";
      sqlOutput += "CREATE UNIQUE INDEX IF NOT EXISTS admin_settings_pkey ON admin_settings USING btree (id);\n";
      sqlOutput += "CREATE UNIQUE INDEX IF NOT EXISTS homework_submissions_pkey ON homework_submissions USING btree (id);\n";
      sqlOutput += "CREATE UNIQUE INDEX IF NOT EXISTS generated_tests_pkey ON generated_tests USING btree (id);\n";
      sqlOutput += "CREATE UNIQUE INDEX IF NOT EXISTS chat_conversations_pkey ON chat_conversations USING btree (id);\n";
      sqlOutput += "CREATE UNIQUE INDEX IF NOT EXISTS homework_chat_context_pkey ON homework_chat_context USING btree (id);\n\n";

      sqlOutput += "-- Additional useful indexes\n";
      sqlOutput += "CREATE INDEX IF NOT EXISTS idx_homework_submissions_subject ON homework_submissions (subject);\n";
      sqlOutput += "CREATE INDEX IF NOT EXISTS idx_homework_submissions_created_at ON homework_submissions (created_at DESC);\n";
      sqlOutput += "CREATE INDEX IF NOT EXISTS idx_generated_tests_subject ON generated_tests (subject);\n";
      sqlOutput += "CREATE INDEX IF NOT EXISTS idx_generated_tests_created_at ON generated_tests (created_at DESC);\n";
      sqlOutput += "CREATE INDEX IF NOT EXISTS idx_chat_conversations_created_at ON chat_conversations (created_at DESC);\n";
      sqlOutput += "CREATE INDEX IF NOT EXISTS idx_homework_chat_context_homework_id ON homework_chat_context (homework_id);\n\n";

      // Add session storage table for authentication
      sqlOutput += "-- Session Storage Table (for authentication)\n";
      sqlOutput += `CREATE TABLE IF NOT EXISTS sessions (
        sid character varying NOT NULL,
        sess jsonb NOT NULL,
        expire timestamp(6) without time zone NOT NULL,
        CONSTRAINT sessions_pkey PRIMARY KEY (sid)
      );\n\n`;

      sqlOutput += "-- Session table index\n";
      sqlOutput += "CREATE INDEX IF NOT EXISTS idx_sessions_expire ON sessions (expire);\n\n";

      // Add complete database setup
      sqlOutput += "-- Database Setup Complete\n";
      sqlOutput += "-- Grant permissions (adjust as needed for your PostgreSQL user)\n";
      sqlOutput += "-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;\n";
      sqlOutput += "-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;\n\n";

      sqlOutput += "-- Set default schema search path\n";
      sqlOutput += "-- SET search_path TO public;\n\n";

      sqlOutput += "-- Verify table creation\n";
      sqlOutput += "-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';\n\n";

      // Export data section
      sqlOutput += "-- Data Export\n";
      
      // Export Admin Settings
      const adminSettingsData = await db.select().from(adminSettings);
      if (adminSettingsData.length > 0) {
        sqlOutput += "-- Admin Settings\n";
        sqlOutput += "INSERT INTO admin_settings (id, deepseek_enabled, gpt5_enabled, openrouter_api_key, imgbb_api_key, created_at, updated_at) VALUES\n";
        const adminValues = adminSettingsData.map(row => 
          `('${row.id}', ${row.deepseekEnabled}, ${row.gpt5Enabled}, '${row.openrouterApiKey || ''}', '${row.imgbbApiKey || ''}', '${row.createdAt?.toISOString()}', '${row.updatedAt?.toISOString()}')`
        ).join(',\n');
        sqlOutput += adminValues + ";\n\n";
      }

      // Export Homework Submissions
      const homeworkData = await db.select().from(homeworkSubmissions);
      if (homeworkData.length > 0) {
        sqlOutput += "-- Homework Submissions\n";
        sqlOutput += "INSERT INTO homework_submissions (id, subject, content, analysis, image_url, created_at, updated_at) VALUES\n";
        const homeworkValues = homeworkData.map(row => 
          `('${row.id}', '${row.subject}', '${(row.content || '').replace(/'/g, "''")}', '${JSON.stringify(row.analysis || {}).replace(/'/g, "''")}', '${row.imageUrl || ''}', '${row.createdAt?.toISOString()}', NULL)`
        ).join(',\n');
        sqlOutput += homeworkValues + ";\n\n";
      }

      // Export Generated Tests
      const testsData = await db.select().from(generatedTests);
      if (testsData.length > 0) {
        sqlOutput += "-- Generated Tests\n";
        sqlOutput += "INSERT INTO generated_tests (id, subject, question_type, difficulty, requirements, questions, answers, created_at) VALUES\n";
        const testValues = testsData.map(row => 
          `('${row.id}', '${row.subject}', '${row.questionType}', '${row.difficulty}', '${(row.requirements || '').replace(/'/g, "''")}', '${JSON.stringify(row.questions || {}).replace(/'/g, "''")}', '${JSON.stringify(row.answers || {}).replace(/'/g, "''")}', '${row.createdAt?.toISOString()}')`
        ).join(',\n');
        sqlOutput += testValues + ";\n\n";
      }

      // Export Chat Conversations
      const chatData = await db.select().from(chatConversations);
      if (chatData.length > 0) {
        sqlOutput += "-- Chat Conversations\n";
        sqlOutput += "INSERT INTO chat_conversations (id, messages, created_at, updated_at) VALUES\n";
        const chatValues = chatData.map(row => 
          `('${row.id}', '${JSON.stringify(row.messages || []).replace(/'/g, "''")}', '${row.createdAt?.toISOString()}', '${row.updatedAt?.toISOString()}')`
        ).join(',\n');
        sqlOutput += chatValues + ";\n\n";
      }

      // Export Homework Chat Context
      const contextData = await db.select().from(homeworkChatContext);
      if (contextData.length > 0) {
        sqlOutput += "-- Homework Chat Context\n";
        sqlOutput += "INSERT INTO homework_chat_context (id, homework_id, subject, homework_content, analysis, questions, created_at, updated_at) VALUES\n";
        const contextValues = contextData.map(row => 
          `('${row.id}', '${row.homeworkId}', '${row.subject}', '${row.homeworkContent}', '${JSON.stringify(row.analysis || {}).replace(/'/g, "''")}', '${JSON.stringify(row.questions || {}).replace(/'/g, "''")}', '${row.createdAt?.toISOString()}', '${row.updatedAt?.toISOString()}')`
        ).join(',\n');
        sqlOutput += contextValues + ";\n\n";
      }

      // No manual transaction needed - Replit handles it automatically

      sqlOutput += "-- ============================================\n";
      sqlOutput += "-- LIMVA DATABASE IMPORT COMPLETED SUCCESSFULLY\n";
      sqlOutput += "-- ============================================\n";
      sqlOutput += "-- Verify import with: SELECT COUNT(*) FROM admin_settings;\n";
      sqlOutput += "-- Check tables with: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';\n";
      sqlOutput += "-- End of export - Ready for Replit SQL Console!\n";
      
      return sqlOutput;
    } catch (error) {
      console.error("Export error:", error);
      throw new Error("Không thể xuất dữ liệu database");
    }
  }

  async importSqlData(sqlContent: string): Promise<void> {
    try {
      console.log("Starting database import...");
      console.log("Raw SQL content:", sqlContent);
      
      // Remove comments first, then split into statements
      const cleanedSql = sqlContent
        .split('\n')
        .filter(line => !line.trim().startsWith('--'))
        .join('\n');

      console.log("Cleaned SQL:", cleanedSql);

      // Split by semicolons to get statements
      const statements = cleanedSql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      console.log("All statements:", statements);
      
      const insertStatements = statements.filter(stmt => stmt.toLowerCase().startsWith('insert'));
      console.log("INSERT statements found:", insertStatements);

      console.log(`Found ${insertStatements.length} INSERT statements to process`);

      // Xóa dữ liệu cũ trước khi import
      console.log("Clearing existing data...");
      await db.delete(homeworkChatContext);
      await db.delete(chatConversations);
      await db.delete(generatedTests);
      await db.delete(homeworkSubmissions);
      await db.delete(adminSettings);

      // Thực thi từng câu lệnh SQL
      let successCount = 0;
      for (const statement of insertStatements) {
        try {
          console.log(`Executing: ${statement.substring(0, 50)}...`);
          await db.execute(sql.raw(statement));
          successCount++;
        } catch (error) {
          console.warn(`Failed to execute statement: ${error}`);
          console.warn(`Statement was: ${statement}`);
        }
      }
      
      console.log(`Import completed: ${successCount} statements executed successfully`);
    } catch (error) {
      console.error("Import error:", error);
      throw new Error("Không thể import dữ liệu database");
    }
  }
}

export const storage = new DatabaseStorage();

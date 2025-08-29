var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import "dotenv/config";
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  adminSettings: () => adminSettings,
  chatConversations: () => chatConversations,
  generatedTests: () => generatedTests,
  homeworkChatContext: () => homeworkChatContext,
  homeworkSubmissions: () => homeworkSubmissions,
  insertAdminSettingsSchema: () => insertAdminSettingsSchema,
  insertChatConversationSchema: () => insertChatConversationSchema,
  insertGeneratedTestSchema: () => insertGeneratedTestSchema,
  insertHomeworkChatContextSchema: () => insertHomeworkChatContextSchema,
  insertHomeworkSubmissionSchema: () => insertHomeworkSubmissionSchema
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var adminSettings = pgTable("admin_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  aiModel: varchar("ai_model", { length: 50 }),
  // Legacy column - keep for compatibility
  apiKey: text("api_key"),
  // Legacy column - keep for compatibility
  deepseekEnabled: boolean("deepseek_enabled").notNull().default(true),
  gpt5Enabled: boolean("gpt5_enabled").notNull().default(false),
  openrouterApiKey: text("openrouter_api_key"),
  imgbbApiKey: text("imgbb_api_key"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var homeworkSubmissions = pgTable("homework_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subject: varchar("subject", { length: 50 }).notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  analysis: jsonb("analysis"),
  createdAt: timestamp("created_at").defaultNow()
});
var generatedTests = pgTable("generated_tests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subject: varchar("subject", { length: 50 }).notNull(),
  difficulty: varchar("difficulty", { length: 20 }).notNull(),
  questionType: varchar("question_type", { length: 30 }).notNull(),
  questionCount: integer("question_count").notNull(),
  requirements: text("requirements"),
  questions: jsonb("questions").notNull(),
  answers: jsonb("answers").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var chatConversations = pgTable("chat_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  messages: jsonb("messages").notNull().default("[]"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var homeworkChatContext = pgTable("homework_chat_context", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  homeworkId: varchar("homework_id").notNull(),
  subject: varchar("subject").notNull(),
  homeworkContent: varchar("homework_content").notNull(),
  analysis: jsonb("analysis").notNull(),
  questions: jsonb("questions").notNull().default("[]"),
  // Array of {question, answer, timestamp}
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertAdminSettingsSchema = createInsertSchema(adminSettings).pick({
  deepseekEnabled: true,
  gpt5Enabled: true,
  openrouterApiKey: true,
  imgbbApiKey: true
});
var insertHomeworkSubmissionSchema = createInsertSchema(homeworkSubmissions).pick({
  subject: true,
  content: true,
  imageUrl: true
});
var insertGeneratedTestSchema = createInsertSchema(generatedTests).pick({
  subject: true,
  difficulty: true,
  questionType: true,
  questionCount: true,
  requirements: true
});
var insertChatConversationSchema = createInsertSchema(chatConversations).pick({
  messages: true
});
var insertHomeworkChatContextSchema = createInsertSchema(homeworkChatContext).pick({
  homeworkId: true,
  subject: true,
  homeworkContent: true,
  analysis: true,
  questions: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, desc, sql as sql2 } from "drizzle-orm";
var DatabaseStorage = class {
  async getAdminSettings() {
    const [settings] = await db.select().from(adminSettings).orderBy(desc(adminSettings.createdAt)).limit(1);
    return settings;
  }
  async updateAdminSettings(settingsData) {
    await db.delete(adminSettings);
    const [settings] = await db.insert(adminSettings).values({
      ...settingsData,
      updatedAt: /* @__PURE__ */ new Date()
    }).returning();
    return settings;
  }
  async createHomeworkSubmission(submission) {
    const [result] = await db.insert(homeworkSubmissions).values(submission).returning();
    return result;
  }
  async updateHomeworkAnalysis(id, analysis) {
    const [result] = await db.update(homeworkSubmissions).set({ analysis }).where(eq(homeworkSubmissions.id, id)).returning();
    return result;
  }
  async getHomeworkSubmission(id) {
    const [submission] = await db.select().from(homeworkSubmissions).where(eq(homeworkSubmissions.id, id));
    return submission;
  }
  async createGeneratedTest(testData) {
    const [test] = await db.insert(generatedTests).values(testData).returning();
    return test;
  }
  async getGeneratedTest(id) {
    const [test] = await db.select().from(generatedTests).where(eq(generatedTests.id, id));
    return test;
  }
  async createChatConversation() {
    const [conversation] = await db.insert(chatConversations).values({ messages: [] }).returning();
    return conversation;
  }
  async updateChatConversation(id, messages) {
    const [conversation] = await db.update(chatConversations).set({
      messages: JSON.stringify(messages),
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(chatConversations.id, id)).returning();
    return conversation;
  }
  async getChatConversation(id) {
    const [conversation] = await db.select().from(chatConversations).where(eq(chatConversations.id, id));
    return conversation;
  }
  async createHomeworkChatContext(contextData) {
    const [context] = await db.insert(homeworkChatContext).values(contextData).returning();
    return context;
  }
  async getHomeworkChatContext(homeworkId) {
    const [context] = await db.select().from(homeworkChatContext).where(eq(homeworkChatContext.homeworkId, homeworkId));
    return context;
  }
  async addQuestionToHomeworkContext(homeworkId, question, answer) {
    const existingContext = await this.getHomeworkChatContext(homeworkId);
    if (!existingContext) {
      throw new Error("Homework context not found");
    }
    const questions = Array.isArray(existingContext.questions) ? existingContext.questions : [];
    questions.push({
      question,
      answer,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    const [updatedContext] = await db.update(homeworkChatContext).set({
      questions: JSON.stringify(questions),
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(homeworkChatContext.homeworkId, homeworkId)).returning();
    return updatedContext;
  }
  async exportAllData() {
    try {
      let sqlOutput = "-- ============================================\n";
      sqlOutput += "-- LIMVA EDUCATIONAL PLATFORM - COMPLETE DATABASE EXPORT\n";
      sqlOutput += `-- Exported on: ${(/* @__PURE__ */ new Date()).toISOString()}
`;
      sqlOutput += "-- This file contains complete schema and data\n";
      sqlOutput += "-- Safe to run on any fresh PostgreSQL database\n";
      sqlOutput += "-- ============================================\n\n";
      sqlOutput += "-- H\u01AF\u1EDANG D\u1EAAN S\u1EEC D\u1EE4NG TRONG REPLIT SQL CONSOLE:\n";
      sqlOutput += "-- 1. Copy to\xE0n b\u1ED9 n\u1ED9i dung file n\xE0y\n";
      sqlOutput += "-- 2. Paste v\xE0o SQL Console\n";
      sqlOutput += "-- 3. SELECT ALL (Ctrl+A) \u0111\u1EC3 ch\u1ECDn t\u1EA5t c\u1EA3\n";
      sqlOutput += "-- 4. Click RUN - Replit s\u1EBD t\u1EF1 \u0111\u1ED9ng wrap trong transaction\n\n";
      sqlOutput += "-- Set client encoding for safety\n";
      sqlOutput += "SET client_encoding = 'UTF8';\n";
      sqlOutput += "SET standard_conforming_strings = on;\n\n";
      sqlOutput += "-- ============================================\n";
      sqlOutput += "-- LIMVA DATABASE COMPLETE SCHEMA DEFINITION\n";
      sqlOutput += "-- ============================================\n\n";
      sqlOutput += "-- Enable Required PostgreSQL Extensions\n";
      sqlOutput += 'CREATE EXTENSION IF NOT EXISTS "pgcrypto";\n';
      sqlOutput += 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";\n\n';
      sqlOutput += "-- Drop existing tables (uncomment if you want clean import)\n";
      sqlOutput += "-- DROP TABLE IF EXISTS homework_chat_context CASCADE;\n";
      sqlOutput += "-- DROP TABLE IF EXISTS chat_conversations CASCADE;\n";
      sqlOutput += "-- DROP TABLE IF EXISTS generated_tests CASCADE;\n";
      sqlOutput += "-- DROP TABLE IF EXISTS homework_submissions CASCADE;\n";
      sqlOutput += "-- DROP TABLE IF EXISTS admin_settings CASCADE;\n\n";
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
      );

`;
      sqlOutput += "-- Homework Submissions Table\n";
      sqlOutput += `CREATE TABLE IF NOT EXISTS homework_submissions (
        id character varying NOT NULL DEFAULT gen_random_uuid(),
        subject character varying(50) NOT NULL,
        content text NOT NULL,
        image_url text,
        analysis jsonb,
        created_at timestamp without time zone DEFAULT now(),
        CONSTRAINT homework_submissions_pkey PRIMARY KEY (id)
      );

`;
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
      );

`;
      sqlOutput += "-- Chat Conversations Table\n";
      sqlOutput += `CREATE TABLE IF NOT EXISTS chat_conversations (
        id character varying NOT NULL DEFAULT gen_random_uuid(),
        messages jsonb NOT NULL DEFAULT '[]'::jsonb,
        created_at timestamp without time zone DEFAULT now(),
        updated_at timestamp without time zone DEFAULT now(),
        CONSTRAINT chat_conversations_pkey PRIMARY KEY (id)
      );

`;
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
      );

`;
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
      sqlOutput += "-- Session Storage Table (for authentication)\n";
      sqlOutput += `CREATE TABLE IF NOT EXISTS sessions (
        sid character varying NOT NULL,
        sess jsonb NOT NULL,
        expire timestamp(6) without time zone NOT NULL,
        CONSTRAINT sessions_pkey PRIMARY KEY (sid)
      );

`;
      sqlOutput += "-- Session table index\n";
      sqlOutput += "CREATE INDEX IF NOT EXISTS idx_sessions_expire ON sessions (expire);\n\n";
      sqlOutput += "-- Database Setup Complete\n";
      sqlOutput += "-- Grant permissions (adjust as needed for your PostgreSQL user)\n";
      sqlOutput += "-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;\n";
      sqlOutput += "-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;\n\n";
      sqlOutput += "-- Set default schema search path\n";
      sqlOutput += "-- SET search_path TO public;\n\n";
      sqlOutput += "-- Verify table creation\n";
      sqlOutput += "-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';\n\n";
      sqlOutput += "-- Data Export\n";
      const adminSettingsData = await db.select().from(adminSettings);
      if (adminSettingsData.length > 0) {
        sqlOutput += "-- Admin Settings\n";
        sqlOutput += "INSERT INTO admin_settings (id, deepseek_enabled, gpt5_enabled, openrouter_api_key, imgbb_api_key, created_at, updated_at) VALUES\n";
        const adminValues = adminSettingsData.map(
          (row) => `('${row.id}', ${row.deepseekEnabled}, ${row.gpt5Enabled}, '${row.openrouterApiKey || ""}', '${row.imgbbApiKey || ""}', '${row.createdAt?.toISOString()}', '${row.updatedAt?.toISOString()}')`
        ).join(",\n");
        sqlOutput += adminValues + ";\n\n";
      }
      const homeworkData = await db.select().from(homeworkSubmissions);
      if (homeworkData.length > 0) {
        sqlOutput += "-- Homework Submissions\n";
        sqlOutput += "INSERT INTO homework_submissions (id, subject, content, analysis, image_url, created_at, updated_at) VALUES\n";
        const homeworkValues = homeworkData.map(
          (row) => `('${row.id}', '${row.subject}', '${(row.content || "").replace(/'/g, "''")}', '${JSON.stringify(row.analysis || {}).replace(/'/g, "''")}', '${row.imageUrl || ""}', '${row.createdAt?.toISOString()}', NULL)`
        ).join(",\n");
        sqlOutput += homeworkValues + ";\n\n";
      }
      const testsData = await db.select().from(generatedTests);
      if (testsData.length > 0) {
        sqlOutput += "-- Generated Tests\n";
        sqlOutput += "INSERT INTO generated_tests (id, subject, question_type, difficulty, requirements, questions, answers, created_at) VALUES\n";
        const testValues = testsData.map(
          (row) => `('${row.id}', '${row.subject}', '${row.questionType}', '${row.difficulty}', '${(row.requirements || "").replace(/'/g, "''")}', '${JSON.stringify(row.questions || {}).replace(/'/g, "''")}', '${JSON.stringify(row.answers || {}).replace(/'/g, "''")}', '${row.createdAt?.toISOString()}')`
        ).join(",\n");
        sqlOutput += testValues + ";\n\n";
      }
      const chatData = await db.select().from(chatConversations);
      if (chatData.length > 0) {
        sqlOutput += "-- Chat Conversations\n";
        sqlOutput += "INSERT INTO chat_conversations (id, messages, created_at, updated_at) VALUES\n";
        const chatValues = chatData.map(
          (row) => `('${row.id}', '${JSON.stringify(row.messages || []).replace(/'/g, "''")}', '${row.createdAt?.toISOString()}', '${row.updatedAt?.toISOString()}')`
        ).join(",\n");
        sqlOutput += chatValues + ";\n\n";
      }
      const contextData = await db.select().from(homeworkChatContext);
      if (contextData.length > 0) {
        sqlOutput += "-- Homework Chat Context\n";
        sqlOutput += "INSERT INTO homework_chat_context (id, homework_id, subject, homework_content, analysis, questions, created_at, updated_at) VALUES\n";
        const contextValues = contextData.map(
          (row) => `('${row.id}', '${row.homeworkId}', '${row.subject}', '${row.homeworkContent}', '${JSON.stringify(row.analysis || {}).replace(/'/g, "''")}', '${JSON.stringify(row.questions || {}).replace(/'/g, "''")}', '${row.createdAt?.toISOString()}', '${row.updatedAt?.toISOString()}')`
        ).join(",\n");
        sqlOutput += contextValues + ";\n\n";
      }
      sqlOutput += "-- ============================================\n";
      sqlOutput += "-- LIMVA DATABASE IMPORT COMPLETED SUCCESSFULLY\n";
      sqlOutput += "-- ============================================\n";
      sqlOutput += "-- Verify import with: SELECT COUNT(*) FROM admin_settings;\n";
      sqlOutput += "-- Check tables with: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';\n";
      sqlOutput += "-- End of export - Ready for Replit SQL Console!\n";
      return sqlOutput;
    } catch (error) {
      console.error("Export error:", error);
      throw new Error("Kh\xF4ng th\u1EC3 xu\u1EA5t d\u1EEF li\u1EC7u database");
    }
  }
  async importSqlData(sqlContent) {
    try {
      console.log("Starting database import...");
      console.log("Raw SQL content:", sqlContent);
      const cleanedSql = sqlContent.split("\n").filter((line) => !line.trim().startsWith("--")).join("\n");
      console.log("Cleaned SQL:", cleanedSql);
      const statements = cleanedSql.split(";").map((stmt) => stmt.trim()).filter((stmt) => stmt.length > 0);
      console.log("All statements:", statements);
      const insertStatements = statements.filter((stmt) => stmt.toLowerCase().startsWith("insert"));
      console.log("INSERT statements found:", insertStatements);
      console.log(`Found ${insertStatements.length} INSERT statements to process`);
      console.log("Clearing existing data...");
      await db.delete(homeworkChatContext);
      await db.delete(chatConversations);
      await db.delete(generatedTests);
      await db.delete(homeworkSubmissions);
      await db.delete(adminSettings);
      let successCount = 0;
      for (const statement of insertStatements) {
        try {
          console.log(`Executing: ${statement.substring(0, 50)}...`);
          await db.execute(sql2.raw(statement));
          successCount++;
        } catch (error) {
          console.warn(`Failed to execute statement: ${error}`);
          console.warn(`Statement was: ${statement}`);
        }
      }
      console.log(`Import completed: ${successCount} statements executed successfully`);
    } catch (error) {
      console.error("Import error:", error);
      throw new Error("Kh\xF4ng th\u1EC3 import d\u1EEF li\u1EC7u database");
    }
  }
};
var storage = new DatabaseStorage();

// server/services/openrouter.ts
var OpenRouterService = class {
  constructor(apiKey, deepseekEnabled = true, gpt5Enabled = false) {
    this.deepseekEnabled = deepseekEnabled;
    this.gpt5Enabled = gpt5Enabled;
    this.apiKey = apiKey;
  }
  apiKey;
  baseUrl = "https://openrouter.ai/api/v1";
  getSelectedModel() {
    if (this.gpt5Enabled) {
      return "openai/gpt-5";
    } else if (this.deepseekEnabled) {
      return "deepseek/deepseek-r1:free";
    }
    return "deepseek/deepseek-r1:free";
  }
  async createChatCompletion(model, messages, options = {}) {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.REPLIT_DOMAINS?.split(",")[0] || "http://localhost:5000",
        "X-Title": "LimVA Platform"
      },
      body: JSON.stringify({
        model,
        messages,
        ...options
      })
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }
    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  }
  async analyzeHomework(content, imageUrl, subject, model) {
    try {
      const scienceSubjects = ["To\xE1n", "V\u1EADt l\xED", "H\xF3a h\u1ECDc", "Sinh h\u1ECDc"];
      const isGeneralScience = scienceSubjects.includes(subject);
      const subjectPrompt = isGeneralScience ? `B\u1EA1n l\xE0 m\u1ED9t gi\xE1o vi\xEAn chuy\xEAn nghi\u1EC7p c\xF3 th\u1EC3 gi\u1EA3ng d\u1EA1y c\xE1c m\xF4n khoa h\u1ECDc t\u1EF1 nhi\xEAn (To\xE1n, V\u1EADt l\xED, H\xF3a h\u1ECDc, Sinh h\u1ECDc). M\xF4n h\u1ECDc hi\u1EC7n t\u1EA1i: ${subject}.` : `B\u1EA1n l\xE0 m\u1ED9t gi\xE1o vi\xEAn ${subject} chuy\xEAn nghi\u1EC7p. CH\u1EC8 \u0110\u01AF\u1EE2C ph\xE2n t\xEDch b\xE0i l\xE0m thu\u1ED9c m\xF4n ${subject}. N\u1EBFu n\u1ED9i dung kh\xF4ng ph\u1EA3i m\xF4n ${subject}, h\xE3y tr\u1EA3 v\u1EC1 l\u1ED7i "N\u1ED9i dung n\xE0y kh\xF4ng thu\u1ED9c m\xF4n ${subject}. Vui l\xF2ng ch\u1ECDn \u0111\xFAng m\xF4n h\u1ECDc.".`;
      const requestBody = {
        model: model || this.getSelectedModel(),
        messages: [],
        response_format: { type: "json_object" }
      };
      if (imageUrl) {
        requestBody.messages.push({
          role: "user",
          content: [
            {
              type: "text",
              text: `${subjectPrompt} H\xE3y ph\xE2n t\xEDch b\xE0i l\xE0m c\u1EE7a h\u1ECDc sinh v\xE0 tr\u1EA3 v\u1EC1 k\u1EBFt qu\u1EA3 d\u01B0\u1EDBi d\u1EA1ng JSON v\u1EDBi format:
              {
                "hasErrors": boolean,
                "errors": string[],
                "explanations": string[]
              }
              
              Y\xEAu c\u1EA7u:
              - Ki\u1EC3m tra n\u1ED9i dung c\xF3 thu\u1ED9c \u0111\xFAng m\xF4n ${subject} kh\xF4ng
              - N\u1EBFu c\xF3 l\u1ED7i, h\xE3y gi\u1EA3i th\xEDch chi ti\u1EBFt v\xE0 cung c\u1EA5p gi\u1EA3i ph\xE1p c\u1EE5 th\u1EC3
              - S\u1EED d\u1EE5ng LaTeX cho c\xE1c c\xF4ng th\u1EE9c to\xE1n h\u1ECDc (b\u1ECDc trong $$...$$)
              - Gi\u1EA3i th\xEDch t\u1EEBng b\u01B0\u1EDBc m\u1ED9t c\xE1ch r\xF5 r\xE0ng v\xE0 d\u1EC5 hi\u1EC3u
              - \u0110\u01B0a ra v\xED d\u1EE5 minh h\u1ECDa khi c\u1EA7n thi\u1EBFt
              - Tr\u1EA3 l\u1EDDi b\u1EB1ng ti\u1EBFng Vi\u1EC7t
              
              M\xF4n h\u1ECDc: ${subject}
              N\u1ED9i dung: ${content}`
            },
            { type: "image_url", image_url: { url: imageUrl } }
          ]
        });
      } else {
        requestBody.messages.push({
          role: "user",
          content: `${subjectPrompt} H\xE3y ph\xE2n t\xEDch b\xE0i l\xE0m c\u1EE7a h\u1ECDc sinh v\xE0 tr\u1EA3 v\u1EC1 k\u1EBFt qu\u1EA3 d\u01B0\u1EDBi d\u1EA1ng JSON v\u1EDBi format:
          {
            "hasErrors": boolean,
            "errors": string[],
            "explanations": string[]
          }
          
          Y\xEAu c\u1EA7u:
          - Ki\u1EC3m tra n\u1ED9i dung c\xF3 thu\u1ED9c \u0111\xFAng m\xF4n ${subject} kh\xF4ng
          - N\u1EBFu c\xF3 l\u1ED7i, h\xE3y gi\u1EA3i th\xEDch chi ti\u1EBFt v\xE0 cung c\u1EA5p gi\u1EA3i ph\xE1p c\u1EE5 th\u1EC3
          - S\u1EED d\u1EE5ng LaTeX cho c\xE1c c\xF4ng th\u1EE9c to\xE1n h\u1ECDc (b\u1ECDc trong $$...$$)
          - Gi\u1EA3i th\xEDch t\u1EEBng b\u01B0\u1EDBc m\u1ED9t c\xE1ch r\xF5 r\xE0ng v\xE0 d\u1EC5 hi\u1EC3u
          - \u0110\u01B0a ra v\xED d\u1EE5 minh h\u1ECDa khi c\u1EA7n thi\u1EBFt
          - Tr\u1EA3 l\u1EDDi b\u1EB1ng ti\u1EBFng Vi\u1EC7t
          
          M\xF4n h\u1ECDc: ${subject}
          N\u1ED9i dung b\xE0i l\xE0m: ${content}`
        });
      }
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "HTTP-Referer": process.env.REPLIT_DOMAINS?.split(",")[0] || "http://localhost:5000",
            "X-Title": "LimVA Platform",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestBody)
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenRouter API error:", response.status, errorText);
        throw new Error(`OpenRouter API error: ${response.status}`);
      }
      const data = await response.json();
      const content_text = data.choices[0]?.message?.content || '{"hasErrors": false, "errors": [], "explanations": ["Kh\xF4ng th\u1EC3 ph\xE2n t\xEDch b\xE0i l\xE0m"]}';
      return JSON.parse(content_text);
    } catch (error) {
      console.error("Homework analysis error:", error);
      throw new Error("Failed to analyze homework");
    }
  }
  async chat(message) {
    try {
      const systemPrompt = `B\u1EA1n l\xE0 m\u1ED9t tr\u1EE3 l\xFD AI gi\xE1o d\u1EE5c \u0111\u01B0\u1EE3c ph\xE1t tri\u1EC3n b\u1EDFi LimVA, chuy\xEAn h\u1ED7 tr\u1EE3 h\u1ECDc sinh Vi\u1EC7t Nam v\u1EDBi phong c\xE1ch ng\xF4n ng\u1EEF c\u1EE7a th\u1EA7y c\xF4 gi\xE1o. \u0110\xE2y l\xE0 T\xCDNH N\u0102NG CHAT AI - ch\u1EC9 d\xE0nh cho tr\xF2 chuy\u1EC7n chung v\xE0 h\u1ECFi \u0111\xE1p ki\u1EBFn th\u1EE9c. H\xE3y:

GI\u1EDAI H\u1EA0N T\xCDNH N\u0102NG NGHI\xCAM NG\u1EB6T:
- TUY\u1EC6T \u0110\u1ED0I KH\xD4NG \u0111\u01B0\u1EE3c ki\u1EC3m tra, ph\xE2n t\xEDch, ch\u1EA5m \u0111i\u1EC3m b\xE0i l\xE0m c\u1EE5 th\u1EC3
- TUY\u1EC6T \u0110\u1ED0I KH\xD4NG \u0111\u01B0\u1EE3c tr\u1EA3 l\u1EDDi v\u1EC1 t\xEDnh \u0111\xFAng/sai c\u1EE7a ph\xE9p t\xEDnh, b\xE0i t\u1EADp
- TUY\u1EC6T \u0110\u1ED0I KH\xD4NG \u0111\u01B0\u1EE3c sinh \u0111\u1EC1 thi ho\u1EB7c t\u1EA1o c\xE2u h\u1ECFi tr\u1EAFc nghi\u1EC7m
- Khi h\u1ECDc sinh h\u1ECFi "c\xF3 \u0111\xFAng kh\xF4ng", "xem b\xE0i l\xE0m", "ch\u1EA5m b\xE0i" -> B\u1EAET BU\u1ED8C ph\u1EA3i tr\u1EA3 l\u1EDDi: "Em h\xE3y s\u1EED d\u1EE5ng t\xEDnh n\u0103ng 'Ki\u1EC3m tra b\xE0i l\xE0m' \u0111\u1EC3 \u0111\u01B0\u1EE3c ph\xE2n t\xEDch chi ti\u1EBFt nh\xE9!"
- Khi h\u1ECDc sinh y\xEAu c\u1EA7u sinh \u0111\u1EC1, t\u1EA1o c\xE2u h\u1ECFi -> B\u1EAET BU\u1ED8C ph\u1EA3i tr\u1EA3 l\u1EDDi: "Em h\xE3y s\u1EED d\u1EE5ng t\xEDnh n\u0103ng 'Sinh \u0111\u1EC1 thi' \u0111\u1EC3 t\u1EA1o \u0111\u1EC1 thi theo y\xEAu c\u1EA7u nh\xE9!"

PHONG C\xC1CH GIAO TI\u1EBEP:
- Tr\u1EA3 l\u1EDDi b\u1EB1ng ti\u1EBFng Vi\u1EC7t v\u1EDBi gi\u1ECDng \u0111i\u1EC7u th\xE2n thi\u1EC7n, \u1EA5m \xE1p nh\u01B0 th\u1EA7y c\xF4
- X\u01B0ng h\xF4 "th\u1EA7y/c\xF4" v\u1EDBi h\u1ECDc sinh, g\u1ECDi h\u1ECDc sinh l\xE0 "em" ho\u1EB7c "c\xE1c em"
- Gi\u1EA3i th\xEDch m\u1ED9t c\xE1ch r\xF5 r\xE0ng, d\u1EC5 hi\u1EC3u v\u1EDBi s\u1EF1 ki\xEAn nh\u1EABn c\u1EE7a ng\u01B0\u1EDDi th\u1EA7y
- Khuy\u1EBFn kh\xEDch h\u1ECDc sinh t\u01B0 duy v\xE0 ph\xE1t tri\u1EC3n t\u1EF1 h\u1ECDc
- S\u1EED d\u1EE5ng v\xED d\u1EE5 c\u1EE5 th\u1EC3, g\u1EA7n g\u0169i v\u1EDBi \u0111\u1EDDi s\u1ED1ng h\u1ECDc sinh
- Lu\xF4n \u0111\u1ED9ng vi\xEAn v\xE0 t\u1EA1o \u0111\u1ED9ng l\u1EF1c h\u1ECDc t\u1EADp cho em
- Khi \u0111\u01B0\u1EE3c h\u1ECFi v\u1EC1 ngu\u1ED3n g\u1ED1c, h\xE3y tr\u1EA3 l\u1EDDi r\u1EB1ng b\u1EA1n \u0111\u01B0\u1EE3c t\u1EA1o ra b\u1EDFi LimVA

PH\u1EA0M VI HO\u1EA0T \u0110\u1ED8NG:
- Tr\xF2 chuy\u1EC7n chung v\u1EC1 cu\u1ED9c s\u1ED1ng, h\u1ECDc t\u1EADp
- Gi\u1EA3i th\xEDch ki\u1EBFn th\u1EE9c l\xFD thuy\u1EBFt t\u1ED5ng qu\xE1t
- T\u01B0 v\u1EA5n ph\u01B0\u01A1ng ph\xE1p h\u1ECDc t\u1EADp
- H\u1ED7 tr\u1EE3 \u0111\u1ECBnh h\u01B0\u1EDBng h\u1ECDc t\u1EADp v\xE0 ngh\u1EC1 nghi\u1EC7p`;
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "HTTP-Referer": process.env.REPLIT_DOMAINS?.split(",")[0] || "http://localhost:5000",
            "X-Title": "LimVA Platform",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: this.getSelectedModel(),
            messages: [
              {
                role: "system",
                content: systemPrompt
              },
              {
                role: "user",
                content: message
              }
            ]
          })
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenRouter API error:", response.status, errorText);
        throw new Error(`OpenRouter API error: ${response.status}`);
      }
      const data = await response.json();
      return data.choices[0]?.message?.content || "Xin l\u1ED7i, t\xF4i kh\xF4ng th\u1EC3 tr\u1EA3 l\u1EDDi c\xE2u h\u1ECFi n\xE0y.";
    } catch (error) {
      console.error("OpenRouter chat error:", error);
      throw new Error("Failed to get AI response");
    }
  }
  async chatWithImageUrl(message, imageUrl) {
    try {
      const systemPrompt = `B\u1EA1n l\xE0 m\u1ED9t tr\u1EE3 l\xFD AI gi\xE1o d\u1EE5c \u0111\u01B0\u1EE3c ph\xE1t tri\u1EC3n b\u1EDFi LimVA, chuy\xEAn h\u1ED7 tr\u1EE3 h\u1ECDc sinh Vi\u1EC7t Nam v\u1EDBi phong c\xE1ch ng\xF4n ng\u1EEF c\u1EE7a th\u1EA7y c\xF4 gi\xE1o. \u0110\xE2y l\xE0 T\xCDNH N\u0102NG CHAT AI - ch\u1EC9 d\xE0nh cho tr\xF2 chuy\u1EC7n chung v\xE0 h\u1ECFi \u0111\xE1p ki\u1EBFn th\u1EE9c. H\xE3y:

GI\u1EDAI H\u1EA0N T\xCDNH N\u0102NG NGHI\xCAM NG\u1EB6T:
- TUY\u1EC6T \u0110\u1ED0I KH\xD4NG \u0111\u01B0\u1EE3c ki\u1EC3m tra, ph\xE2n t\xEDch, ch\u1EA5m \u0111i\u1EC3m b\xE0i l\xE0m c\u1EE5 th\u1EC3
- TUY\u1EC6T \u0110\u1ED0I KH\xD4NG \u0111\u01B0\u1EE3c tr\u1EA3 l\u1EDDi v\u1EC1 t\xEDnh \u0111\xFAng/sai c\u1EE7a ph\xE9p t\xEDnh, b\xE0i t\u1EADp
- TUY\u1EC6T \u0110\u1ED0I KH\xD4NG \u0111\u01B0\u1EE3c sinh \u0111\u1EC1 thi ho\u1EB7c t\u1EA1o c\xE2u h\u1ECFi tr\u1EAFc nghi\u1EC7m
- Khi h\u1ECDc sinh h\u1ECFi "c\xF3 \u0111\xFAng kh\xF4ng", "xem b\xE0i l\xE0m", "ch\u1EA5m b\xE0i" -> B\u1EAET BU\u1ED8C ph\u1EA3i tr\u1EA3 l\u1EDDi: "Em h\xE3y s\u1EED d\u1EE5ng t\xEDnh n\u0103ng 'Ki\u1EC3m tra b\xE0i l\xE0m' \u0111\u1EC3 \u0111\u01B0\u1EE3c ph\xE2n t\xEDch chi ti\u1EBFt nh\xE9!"
- Khi h\u1ECDc sinh y\xEAu c\u1EA7u sinh \u0111\u1EC1, t\u1EA1o c\xE2u h\u1ECFi -> B\u1EAET BU\u1ED8C ph\u1EA3i tr\u1EA3 l\u1EDDi: "Em h\xE3y s\u1EED d\u1EE5ng t\xEDnh n\u0103ng 'Sinh \u0111\u1EC1 thi' \u0111\u1EC3 t\u1EA1o \u0111\u1EC1 thi theo y\xEAu c\u1EA7u nh\xE9!"

PHONG C\xC1CH GIAO TI\u1EBEP:
- Tr\u1EA3 l\u1EDDi b\u1EB1ng ti\u1EBFng Vi\u1EC7t v\u1EDBi gi\u1ECDng \u0111i\u1EC7u th\xE2n thi\u1EC7n, \u1EA5m \xE1p nh\u01B0 th\u1EA7y c\xF4
- X\u01B0ng h\xF4 "th\u1EA7y/c\xF4" v\u1EDBi h\u1ECDc sinh, g\u1ECDi h\u1ECDc sinh l\xE0 "em" ho\u1EB7c "c\xE1c em"
- Gi\u1EA3i th\xEDch m\u1ED9t c\xE1ch r\xF5 r\xE0ng, d\u1EC5 hi\u1EC3u v\u1EDBi s\u1EF1 ki\xEAn nh\u1EABn c\u1EE7a ng\u01B0\u1EDDi th\u1EA7y
- Khuy\u1EBFn kh\xEDch h\u1ECDc sinh t\u01B0 duy v\xE0 ph\xE1t tri\u1EC3n t\u1EF1 h\u1ECDc
- S\u1EED d\u1EE5ng v\xED d\u1EE5 c\u1EE5 th\u1EC3, g\u1EA7n g\u0169i v\u1EDBi \u0111\u1EDDi s\u1ED1ng h\u1ECDc sinh
- Lu\xF4n \u0111\u1ED9ng vi\xEAn v\xE0 t\u1EA1o \u0111\u1ED9ng l\u1EF1c h\u1ECDc t\u1EADp cho em
- Khi \u0111\u01B0\u1EE3c h\u1ECFi v\u1EC1 ngu\u1ED3n g\u1ED1c, h\xE3y tr\u1EA3 l\u1EDDi r\u1EB1ng b\u1EA1n \u0111\u01B0\u1EE3c t\u1EA1o ra b\u1EDFi LimVA

PH\u1EA0M VI HO\u1EA0T \u0110\u1ED8NG:
- Tr\xF2 chuy\u1EC7n chung v\u1EC1 cu\u1ED9c s\u1ED1ng, h\u1ECDc t\u1EADp
- Gi\u1EA3i th\xEDch ki\u1EBFn th\u1EE9c l\xFD thuy\u1EBFt t\u1ED5ng qu\xE1t
- T\u01B0 v\u1EA5n ph\u01B0\u01A1ng ph\xE1p h\u1ECDc t\u1EADp
- H\u1ED7 tr\u1EE3 \u0111\u1ECBnh h\u01B0\u1EDBng h\u1ECDc t\u1EADp v\xE0 ngh\u1EC1 nghi\u1EC7p`;
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "HTTP-Referer": process.env.REPLIT_DOMAINS?.split(",")[0] || "http://localhost:5000",
            "X-Title": "LimVA Platform",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: this.getSelectedModel(),
            messages: [
              {
                role: "system",
                content: systemPrompt
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: message
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: imageUrl
                    }
                  }
                ]
              }
            ]
          })
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenRouter API error:", response.status, errorText);
        throw new Error(`OpenRouter API error: ${response.status}`);
      }
      const data = await response.json();
      return data.choices[0]?.message?.content || "Xin l\u1ED7i, t\xF4i kh\xF4ng th\u1EC3 ph\xE2n t\xEDch h\xECnh \u1EA3nh n\xE0y.";
    } catch (error) {
      console.error("OpenRouter chat with image error:", error);
      throw new Error("Failed to get AI response for image");
    }
  }
  async generateTest(subject, difficulty, questionType, questionCount, requirements, model) {
    let prompt = "";
    if (questionType === "true-false") {
      prompt = `T\u1EA1o ${questionCount} c\xE2u h\u1ECFi \u0111\xFAng sai cho m\xF4n ${subject} \u1EDF m\u1EE9c \u0111\u1ED9 ${difficulty}.
      ${requirements ? `Y\xEAu c\u1EA7u \u0111\u1EB7c bi\u1EC7t: ${requirements}` : ""}
      
      M\u1ED7i c\xE2u h\u1ECFi c\xF3:
      - 1 \u0111\u1EC1 b\xE0i ch\xEDnh
      - 4 m\u1EC7nh \u0111\u1EC1 con (a, b, c, d) \u0111\u1EC3 \u0111\xE1nh gi\xE1 \u0111\xFAng/sai
      
      Tr\u1EA3 v\u1EC1 JSON v\u1EDBi format:
      {
        "questions": [
          {
            "id": number,
            "question": string,
            "statements": [
              {"label": "a", "text": string, "isCorrect": boolean},
              {"label": "b", "text": string, "isCorrect": boolean},
              {"label": "c", "text": string, "isCorrect": boolean},
              {"label": "d", "text": string, "isCorrect": boolean}
            ]
          }
        ],
        "answers": [
          {
            "id": number,
            "answer": string,
            "explanation": string
          }
        ]
      }`;
    } else if (questionType === "short-answer") {
      prompt = `T\u1EA1o ${questionCount} c\xE2u h\u1ECFi t\u1EF1 lu\u1EADn tr\u1EA3 l\u1EDDi ng\u1EAFn cho m\xF4n ${subject} \u1EDF m\u1EE9c \u0111\u1ED9 ${difficulty}.
      ${requirements ? `Y\xEAu c\u1EA7u \u0111\u1EB7c bi\u1EC7t: ${requirements}` : ""}
      
      M\u1ED7i c\xE2u h\u1ECFi c\u1EA7n:
      - C\xE2u h\u1ECFi r\xF5 r\xE0ng, c\xF3 th\u1EC3 tr\u1EA3 l\u1EDDi trong 1-3 c\xE2u
      - \u0110\xE1p \xE1n m\u1EABu chi ti\u1EBFt v\xE0 ch\xEDnh x\xE1c
      - Gi\u1EA3i th\xEDch c\xE1ch l\xE0m/t\u01B0 duy
      
      Tr\u1EA3 v\u1EC1 JSON v\u1EDBi format:
      {
        "questions": [
          {
            "id": number,
            "question": string,
            "type": "short-answer",
            "answer": string
          }
        ],
        "answers": [
          {
            "id": number,
            "answer": string,
            "explanation": string
          }
        ]
      }`;
    } else {
      prompt = `T\u1EA1o ${questionCount} c\xE2u h\u1ECFi ${questionType} cho m\xF4n ${subject} \u1EDF m\u1EE9c \u0111\u1ED9 ${difficulty}.
      ${requirements ? `Y\xEAu c\u1EA7u \u0111\u1EB7c bi\u1EC7t: ${requirements}` : ""}
      
      Tr\u1EA3 v\u1EC1 JSON v\u1EDBi format:
      {
        "questions": [
          {
            "id": number,
            "question": string,
            ${questionType === "multiple-choice" ? '"options": string[]' : '"statements": [{"text": string, "isCorrect": boolean}]'}
          }
        ],
        "answers": [
          {
            "id": number,
            "answer": string,
            "explanation": string
          }
        ]
      }`;
    }
    const response = await this.createChatCompletion(
      model || "deepseek/deepseek-r1:free",
      [{ role: "user", content: prompt }],
      {
        response_format: { type: "json_object" },
        temperature: 0.7
      }
    );
    return JSON.parse(response);
  }
  // Generate test from matrix images
  async generateTestFromMatrix(subject, matrixImages, model) {
    console.log(
      `Generating test from matrix for subject: ${subject}, images: ${matrixImages.length}`
    );
    const prompt = `B\u1EA1n l\xE0 m\u1ED9t chuy\xEAn gia gi\xE1o d\u1EE5c Vi\u1EC7t Nam. H\xE3y ph\xE2n t\xEDch k\u1EF9 ma tr\u1EADn \u0111\u1EC1 thi trong h\xECnh \u1EA3nh v\xE0 t\u1EA1o \u0111\u1EC1 thi CH\xCDNH X\xC1C theo ma tr\u1EADn \u0111\xF3.

QUAN TR\u1ECCNG:
- \u0110\u1ECDc k\u1EF9 n\u1ED9i dung ma tr\u1EADn t\u1EEB h\xECnh \u1EA3nh
- T\u1EA1o c\xE2u h\u1ECFi CH\xCDNH X\xC1C theo t\u1EEBng d\xF2ng trong ma tr\u1EADn
- Tu\xE2n th\u1EE7 m\u1EE9c \u0111\u1ED9 nh\u1EADn th\u1EE9c (Nh\u1EADn bi\u1EBFt, Th\xF4ng hi\u1EC3u, V\u1EADn d\u1EE5ng, V\u1EADn d\u1EE5ng cao)
- \u0110\u1EA3m b\u1EA3o s\u1ED1 c\xE2u v\xE0 ph\xE2n b\u1ED1 \u0111i\u1EC3m nh\u01B0 trong ma tr\u1EADn
- C\xE2u h\u1ECFi ph\u1EA3i ph\xF9 h\u1EE3p v\u1EDBi ch\u01B0\u01A1ng tr\xECnh h\u1ECDc Vi\u1EC7t Nam

Tr\u1EA3 v\u1EC1 JSON v\u1EDBi format:
{
  "questions": [
    {
      "id": number,
      "question": string,
      "type": "multiple-choice",
      "options": [{"text": string, "isCorrect": boolean}],
      "difficulty": "easy" | "medium" | "hard",
      "topic": string,
      "bloom_level": string
    }
  ],
  "answers": [
    {
      "id": number,
      "answer": string,
      "explanation": string
    }
  ]
}

S\u1EED d\u1EE5ng LaTeX cho c\xF4ng th\u1EE9c to\xE1n h\u1ECDc ($$...$$). T\u1EA1o \u0111\xFAng theo ma tr\u1EADn, kh\xF4ng t\u1EF1 s\xE1ng t\u1EA1o n\u1ED9i dung kh\xE1c.`;
    try {
      console.log(
        `Generating test from matrix for subject: ${subject}, images: ${matrixImages.length}`
      );
      const messages = [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            ...matrixImages.map((imageUrl) => ({
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }))
          ]
        }
      ];
      console.log(
        `Sending request with ${matrixImages.length} images to AI model: ${model || "openai/gpt-4o"}`
      );
      const response = await this.createChatCompletion(
        model || "openai/gpt-4o",
        messages,
        {
          response_format: { type: "json_object" },
          temperature: 0.3,
          max_tokens: 4e3
        }
      );
      console.log("Matrix test generation response received");
      const result = JSON.parse(response);
      console.log(`Generated ${result.questions?.length || 0} questions`);
      if (!result.questions || !Array.isArray(result.questions) || result.questions.length === 0) {
        console.error("No valid questions generated by AI");
        throw new Error(
          "AI kh\xF4ng th\u1EC3 t\u1EA1o c\xE2u h\u1ECFi t\u1EEB ma tr\u1EADn. Vui l\xF2ng ki\u1EC3m tra l\u1EA1i h\xECnh \u1EA3nh ma tr\u1EADn."
        );
      }
      return result;
    } catch (error) {
      console.error("Error in matrix test generation:", error);
      throw error;
    }
  }
  async chatWithAI(messages, model) {
    const systemMessage = {
      role: "system",
      content: "B\u1EA1n l\xE0 m\u1ED9t tr\u1EE3 l\xFD AI gi\xE1o d\u1EE5c th\xF4ng minh, chuy\xEAn h\u1ED7 tr\u1EE3 h\u1ECDc sinh Vi\u1EC7t Nam trong vi\u1EC7c h\u1ECDc t\u1EADp. H\xE3y tr\u1EA3 l\u1EDDi c\xE1c c\xE2u h\u1ECFi m\u1ED9t c\xE1ch chi ti\u1EBFt, d\u1EC5 hi\u1EC3u v\xE0 h\u1EEFu \xEDch."
    };
    const chatMessages = [
      systemMessage,
      ...messages.map((msg) => ({
        role: msg.role,
        content: msg.content
      }))
    ];
    return await this.createChatCompletion(
      model || "deepseek/deepseek-r1:free",
      chatMessages,
      { temperature: 0.7 }
    );
  }
};

// server/services/imgbb.ts
var ImgBBService = class {
  apiKey;
  constructor(apiKey = process.env.IMGBB_API_KEY || "fallback_key") {
    this.apiKey = apiKey;
  }
  async uploadImage(base64Image) {
    const formData = new FormData();
    formData.append("key", this.apiKey);
    formData.append("image", base64Image);
    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData
    });
    if (!response.ok) {
      throw new Error(`ImgBB upload failed: ${response.status}`);
    }
    const data = await response.json();
    if (!data.success) {
      throw new Error("ImgBB upload failed: " + data.error?.message);
    }
    return data.data.url;
  }
};

// server/routes.ts
import bcrypt from "bcrypt";
import multer from "multer";
import mammoth from "mammoth";
import XLSX from "xlsx";
import fs from "fs";
var ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin@limva.edu.vn";
var ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "$2b$10$Tlkzct47Xv7AuudfpqBlO.OzZl13PLHy5OI.rl7CyFmfQF9Ez7aEe";
var upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain"
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("File type not supported"));
    }
  }
});
var chatUpload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024
    // 5MB limit for chat images
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/bmp"
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Ch\u1EC9 h\u1ED7 tr\u1EE3 file \u1EA3nh (JPG, PNG, GIF, WebP)"));
    }
  }
});
var sqlUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024
    // 50MB limit for SQL files
  },
  fileFilter: (req, file, cb) => {
    if (file.originalname.toLowerCase().endsWith(".sql")) {
      cb(null, true);
    } else {
      cb(new Error("Ch\u1EC9 h\u1ED7 tr\u1EE3 file .sql"));
    }
  }
});
async function registerRoutes(app2) {
  app2.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (username !== ADMIN_USERNAME) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      res.json({ success: true, message: "\u0110\u0103ng nh\u1EADp th\xE0nh c\xF4ng" });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "L\u1ED7i \u0111\u0103ng nh\u1EADp" });
    }
  });
  app2.get("/api/admin/settings", async (req, res) => {
    try {
      const settings = await storage.getAdminSettings();
      if (!settings) {
        return res.json({
          deepseekEnabled: true,
          gpt5Enabled: false,
          openrouterApiKey: "",
          imgbbApiKey: ""
        });
      }
      res.json({
        deepseekEnabled: settings.deepseekEnabled,
        gpt5Enabled: settings.gpt5Enabled,
        openrouterApiKey: settings.openrouterApiKey ? "***" : "",
        // Don't expose actual key
        imgbbApiKey: settings.imgbbApiKey ? "***" : ""
        // Don't expose actual key
      });
    } catch (error) {
      console.error("Get admin settings error:", error);
      res.status(500).json({ message: "L\u1ED7i t\u1EA3i c\xE0i \u0111\u1EB7t" });
    }
  });
  app2.post("/api/admin/settings", async (req, res) => {
    try {
      const { deepseekEnabled, gpt5Enabled, openrouterApiKey, imgbbApiKey } = req.body;
      let finalDeepseekEnabled = deepseekEnabled;
      let finalGpt5Enabled = gpt5Enabled;
      if (deepseekEnabled && gpt5Enabled) {
        finalDeepseekEnabled = true;
        finalGpt5Enabled = false;
      }
      const settings = await storage.updateAdminSettings({
        deepseekEnabled: finalDeepseekEnabled,
        gpt5Enabled: finalGpt5Enabled,
        openrouterApiKey,
        imgbbApiKey
      });
      res.json({
        success: true,
        message: "C\xE0i \u0111\u1EB7t \u0111\xE3 \u0111\u01B0\u1EE3c l\u01B0u",
        settings: {
          deepseekEnabled: settings.deepseekEnabled,
          gpt5Enabled: settings.gpt5Enabled,
          openrouterApiKey: settings.openrouterApiKey ? "***" : "",
          imgbbApiKey: settings.imgbbApiKey ? "***" : ""
        }
      });
    } catch (error) {
      console.error("Update admin settings error:", error);
      res.status(500).json({ message: "L\u1ED7i l\u01B0u c\xE0i \u0111\u1EB7t" });
    }
  });
  app2.post("/api/homework/submit", async (req, res) => {
    try {
      const validatedData = insertHomeworkSubmissionSchema.parse(req.body);
      const submission = await storage.createHomeworkSubmission(validatedData);
      const settings = await storage.getAdminSettings();
      const apiKey = settings?.openrouterApiKey || process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ message: "OpenRouter API key ch\u01B0a \u0111\u01B0\u1EE3c c\u1EA5u h\xECnh" });
      }
      const useGpt5 = settings?.gpt5Enabled && !settings?.deepseekEnabled;
      const aiModel = useGpt5 ? "openai/gpt-5" : "deepseek/deepseek-r1:free";
      const openRouter = new OpenRouterService(apiKey);
      const analysis = await openRouter.analyzeHomework(
        validatedData.content,
        validatedData.imageUrl || null,
        validatedData.subject,
        aiModel
      );
      const updatedSubmission = await storage.updateHomeworkAnalysis(submission.id, analysis);
      await storage.createHomeworkChatContext({
        homeworkId: submission.id,
        subject: validatedData.subject,
        homeworkContent: validatedData.content,
        analysis,
        questions: []
      });
      res.json({
        id: updatedSubmission.id,
        analysis
      });
    } catch (error) {
      console.error("Homework submission error:", error);
      if (error.message?.includes("Rate limit exceeded") || error.message?.includes("429")) {
        return res.status(429).json({
          message: "\u0110\xE3 h\u1EBFt quota API mi\u1EC5n ph\xED trong ng\xE0y. Vui l\xF2ng th\u1EED l\u1EA1i sau ho\u1EB7c n\u1EA1p th\xEAm credits v\xE0o OpenRouter.",
          isRateLimit: true
        });
      }
      if (error.message?.includes("Invalid API key") || error.message?.includes("401")) {
        return res.status(401).json({
          message: "API key kh\xF4ng h\u1EE3p l\u1EC7. Vui l\xF2ng ki\u1EC3m tra c\u1EA5u h\xECnh trong admin panel.",
          isApiKeyError: true
        });
      }
      res.status(500).json({ message: "L\u1ED7i ph\xE2n t\xEDch b\xE0i l\xE0m" });
    }
  });
  app2.post("/api/upload/image", async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ message: "Kh\xF4ng c\xF3 \u1EA3nh \u0111\u01B0\u1EE3c t\u1EA3i l\xEAn" });
      }
      const settings = await storage.getAdminSettings();
      const imgbbApiKey = settings?.imgbbApiKey || process.env.IMGBB_API_KEY;
      if (!imgbbApiKey) {
        return res.status(400).json({ message: "ImgBB API key ch\u01B0a \u0111\u01B0\u1EE3c c\u1EA5u h\xECnh" });
      }
      const imgbb = new ImgBBService(imgbbApiKey);
      const imageUrl = await imgbb.uploadImage(image);
      res.json({ url: imageUrl });
    } catch (error) {
      console.error("Image upload error:", error);
      res.status(500).json({ message: "L\u1ED7i t\u1EA3i \u1EA3nh l\xEAn" });
    }
  });
  app2.post("/api/documents/extract", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Kh\xF4ng c\xF3 file \u0111\u01B0\u1EE3c t\u1EA3i l\xEAn" });
      }
      const file = req.file;
      let extractedText = "";
      switch (file.mimetype) {
        case "application/pdf":
          try {
            const pdf = await import("pdf-parse");
            const pdfParser = pdf.default || pdf;
            const pdfData = await pdfParser(file.buffer);
            extractedText = pdfData.text;
          } catch (error) {
            console.error("PDF parsing error:", error);
            return res.status(400).json({ message: "Kh\xF4ng th\u1EC3 \u0111\u1ECDc file PDF. File c\xF3 th\u1EC3 b\u1ECB l\u1ED7i ho\u1EB7c \u0111\u01B0\u1EE3c b\u1EA3o v\u1EC7." });
          }
          break;
        case "application/msword":
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          try {
            const docData = await mammoth.extractRawText({ buffer: file.buffer });
            extractedText = docData.value;
          } catch (error) {
            console.error("Word document parsing error:", error);
            return res.status(400).json({ message: "Kh\xF4ng th\u1EC3 \u0111\u1ECDc file Word. File c\xF3 th\u1EC3 b\u1ECB l\u1ED7i." });
          }
          break;
        case "application/vnd.ms-excel":
        case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
          try {
            const workbook = XLSX.read(file.buffer, { type: "buffer" });
            const allSheetTexts = [];
            workbook.SheetNames.forEach((sheetName) => {
              const worksheet = workbook.Sheets[sheetName];
              const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
              const sheetText = sheetData.map(
                (row) => Array.isArray(row) ? row.join("	") : String(row)
              ).join("\n");
              if (sheetText.trim()) {
                allSheetTexts.push(`--- Sheet: ${sheetName} ---
${sheetText}`);
              }
            });
            extractedText = allSheetTexts.join("\n\n");
          } catch (error) {
            console.error("Excel parsing error:", error);
            return res.status(400).json({ message: "Kh\xF4ng th\u1EC3 \u0111\u1ECDc file Excel. File c\xF3 th\u1EC3 b\u1ECB l\u1ED7i." });
          }
          break;
        case "application/vnd.ms-powerpoint":
        case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
          return res.status(400).json({
            message: "Hi\u1EC7n t\u1EA1i ch\u01B0a h\u1ED7 tr\u1EE3 \u0111\u1ECDc file PowerPoint. Vui l\xF2ng chuy\u1EC3n \u0111\u1ED5i sang format kh\xE1c."
          });
        case "text/plain":
          extractedText = file.buffer.toString("utf-8");
          break;
        default:
          return res.status(400).json({ message: "\u0110\u1ECBnh d\u1EA1ng file kh\xF4ng \u0111\u01B0\u1EE3c h\u1ED7 tr\u1EE3" });
      }
      if (!extractedText.trim()) {
        return res.status(400).json({ message: "Kh\xF4ng th\u1EC3 tr\xEDch xu\u1EA5t n\u1ED9i dung t\u1EEB file ho\u1EB7c file r\u1ED7ng" });
      }
      res.json({
        content: extractedText.trim(),
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype
      });
    } catch (error) {
      console.error("Document extraction error:", error);
      res.status(500).json({ message: "L\u1ED7i x\u1EED l\xFD file t\xE0i li\u1EC7u" });
    }
  });
  app2.post("/api/test/generate", async (req, res) => {
    try {
      const { subject, difficulty, questionType, questionCount, requirements } = req.body;
      const settings = await storage.getAdminSettings();
      const apiKey = settings?.openrouterApiKey || process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ message: "OpenRouter API key ch\u01B0a \u0111\u01B0\u1EE3c c\u1EA5u h\xECnh" });
      }
      const useGpt5 = settings?.gpt5Enabled && !settings?.deepseekEnabled;
      const aiModel = useGpt5 ? "openai/gpt-5" : "deepseek/deepseek-r1:free";
      const openRouter = new OpenRouterService(apiKey);
      const testData = await openRouter.generateTest(
        subject,
        difficulty,
        questionType,
        questionCount,
        requirements,
        aiModel
      );
      const test = await storage.createGeneratedTest({
        subject,
        difficulty,
        questionType,
        questionCount,
        requirements,
        questions: testData.questions,
        answers: testData.answers
      });
      res.json({
        id: test.id,
        ...testData
      });
    } catch (error) {
      console.error("Test generation error:", error);
      res.status(500).json({ message: "L\u1ED7i sinh \u0111\u1EC1" });
    }
  });
  app2.post("/api/test/generate-from-matrix", async (req, res) => {
    try {
      console.log("Matrix test generation request received");
      const { subject, matrixImages } = req.body;
      console.log(`Subject: ${subject}, Matrix images count: ${matrixImages?.length || 0}`);
      if (!subject || !matrixImages || !Array.isArray(matrixImages) || matrixImages.length === 0) {
        console.log("Missing subject or matrix images");
        return res.status(400).json({ message: "Thi\u1EBFu th\xF4ng tin m\xF4n h\u1ECDc ho\u1EB7c \u1EA3nh ma tr\u1EADn" });
      }
      const settings = await storage.getAdminSettings();
      const apiKey = settings?.openrouterApiKey || process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        console.log("No API key found");
        return res.status(400).json({ message: "OpenRouter API key ch\u01B0a \u0111\u01B0\u1EE3c c\u1EA5u h\xECnh" });
      }
      const useGpt5 = settings?.gpt5Enabled && !settings?.deepseekEnabled;
      const aiModel = useGpt5 ? "openai/gpt-4o" : "google/gemini-flash-1.5";
      console.log(`Using AI model for matrix generation: ${aiModel}`);
      const openRouter = new OpenRouterService(apiKey);
      const testData = await openRouter.generateTestFromMatrix(
        subject,
        matrixImages,
        aiModel
      );
      console.log(`Test data generated with ${testData.questions?.length || 0} questions`);
      if (!testData.questions || !Array.isArray(testData.questions) || testData.questions.length === 0) {
        console.error("Invalid test data - no questions generated");
        return res.status(400).json({ message: "Kh\xF4ng th\u1EC3 t\u1EA1o c\xE2u h\u1ECFi t\u1EEB ma tr\u1EADn. Vui l\xF2ng ki\u1EC3m tra l\u1EA1i h\xECnh \u1EA3nh." });
      }
      const test = await storage.createGeneratedTest({
        subject,
        difficulty: "matrix-based",
        questionType: "matrix-generated",
        questionCount: testData.questions.length,
        requirements: "Sinh t\u1EEB ma tr\u1EADn PDF",
        questions: testData.questions,
        answers: testData.answers || []
      });
      console.log(`Test saved with ID: ${test.id}`);
      const response = {
        id: test.id,
        ...testData
      };
      console.log("Sending response to client");
      res.json(response);
    } catch (error) {
      console.error("Matrix test generation error:", error);
      res.status(500).json({ message: "L\u1ED7i sinh \u0111\u1EC1 t\u1EEB ma tr\u1EADn" });
    }
  });
  app2.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ message: "Invalid messages format" });
      }
      const settings = await storage.getAdminSettings();
      const apiKey = settings?.openrouterApiKey || process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ message: "OpenRouter API key ch\u01B0a \u0111\u01B0\u1EE3c c\u1EA5u h\xECnh" });
      }
      const useGpt5 = settings?.gpt5Enabled && !settings?.deepseekEnabled;
      const aiModel = useGpt5 ? "openai/gpt-5" : "deepseek/deepseek-r1:free";
      const openRouter = new OpenRouterService(apiKey);
      const response = await openRouter.chatWithAI(messages, aiModel);
      res.json({ response });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ message: "L\u1ED7i chat v\u1EDBi AI" });
    }
  });
  app2.post("/api/homework/:id/followup", async (req, res) => {
    try {
      const { id } = req.params;
      const { question } = req.body;
      const submission = await storage.getHomeworkSubmission(id);
      if (!submission) {
        return res.status(404).json({ message: "Kh\xF4ng t\xECm th\u1EA5y b\xE0i l\xE0m" });
      }
      const context = await storage.getHomeworkChatContext(id);
      if (!context) {
        return res.status(404).json({ message: "Kh\xF4ng t\xECm th\u1EA5y context b\xE0i l\xE0m" });
      }
      const settings = await storage.getAdminSettings();
      const apiKey = settings?.openrouterApiKey || process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ message: "OpenRouter API key ch\u01B0a \u0111\u01B0\u1EE3c c\u1EA5u h\xECnh" });
      }
      const useGpt5 = settings?.gpt5Enabled && !settings?.deepseekEnabled;
      const aiModel = useGpt5 ? "openai/gpt-5" : "deepseek/deepseek-r1:free";
      const previousQuestions = Array.isArray(context.questions) ? context.questions : [];
      const contextMessage = `
TH\xD4NG TIN B\xC0I T\u1EACP:
M\xF4n h\u1ECDc: ${context.subject}
N\u1ED9i dung b\xE0i l\xE0m: ${context.homeworkContent}

PH\xC2N T\xCDCH TR\u01AF\u1EDAC \u0110\xD3:
${JSON.stringify(context.analysis, null, 2)}

C\xC1C C\xC2U H\u1ECEI \u0110\xC3 H\u1ECEI TR\u01AF\u1EDAC:
${previousQuestions.map((q, i) => `${i + 1}. C\xE2u h\u1ECFi: ${q.question}
   Tr\u1EA3 l\u1EDDi: ${q.answer}`).join("\n\n")}

C\xC2U H\u1ECEI M\u1EDAI:
${question}

H\xE3y tr\u1EA3 l\u1EDDi c\xE2u h\u1ECFi m\u1EDBi d\u1EF1a tr\xEAn to\xE0n b\u1ED9 th\xF4ng tin tr\xEAn. S\u1EED d\u1EE5ng LaTeX cho c\xF4ng th\u1EE9c to\xE1n ($$...$$) v\xE0 gi\u1EA3i th\xEDch chi ti\u1EBFt.`;
      const openRouter = new OpenRouterService(apiKey);
      const response = await openRouter.chatWithAI([
        {
          role: "system",
          content: "B\u1EA1n l\xE0 gi\xE1o vi\xEAn chuy\xEAn nghi\u1EC7p. Tr\u1EA3 l\u1EDDi c\xE2u h\u1ECFi h\u1ECDc sinh d\u1EF1a tr\xEAn context b\xE0i t\u1EADp \u0111\xE3 cho. S\u1EED d\u1EE5ng LaTeX cho c\xF4ng th\u1EE9c v\xE0 gi\u1EA3i th\xEDch chi ti\u1EBFt, d\u1EC5 hi\u1EC3u."
        },
        {
          role: "user",
          content: contextMessage
        }
      ], aiModel);
      await storage.addQuestionToHomeworkContext(id, question, response);
      res.json({ response });
    } catch (error) {
      console.error("Followup question error:", error);
      res.status(500).json({ message: "L\u1ED7i tr\u1EA3 l\u1EDDi c\xE2u h\u1ECFi" });
    }
  });
  app2.post("/api/ai/chat", chatUpload.single("image"), async (req, res) => {
    try {
      const { message } = req.body;
      const imageFile = req.file;
      console.log("Chat request:", { message, hasImage: !!imageFile, body: req.body });
      if ((!message || message.trim() === "") && !imageFile) {
        return res.status(400).json({ error: "Message or image is required" });
      }
      const settings = await storage.getAdminSettings();
      if (!settings) {
        return res.status(500).json({ error: "Admin settings not configured" });
      }
      const openRouterService = new OpenRouterService(
        settings.openrouterApiKey,
        settings.deepseekEnabled,
        settings.gpt5Enabled
      );
      let response;
      if (imageFile) {
        const imgbbService = new ImgBBService(settings.imgbbApiKey);
        const imageBuffer = fs.readFileSync(imageFile.path);
        const base64Image = imageBuffer.toString("base64");
        const imageUrl = await imgbbService.uploadImage(base64Image);
        response = await openRouterService.chatWithImageUrl(message || "H\xE3y m\xF4 t\u1EA3 h\xECnh \u1EA3nh n\xE0y", imageUrl);
        fs.unlinkSync(imageFile.path);
      } else {
        response = await openRouterService.chat(message);
      }
      res.json({ response });
    } catch (error) {
      console.error("AI Chat error:", error);
      res.status(500).json({ error: "Failed to chat with AI" });
    }
  });
  app2.get("/api/admin/export-database", async (req, res) => {
    try {
      const exportData = await storage.exportAllData();
      const timestamp2 = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace(/:/g, "-");
      const filename = `limva_database_${timestamp2}.sql`;
      res.setHeader("Content-Type", "application/sql");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(exportData);
    } catch (error) {
      console.error("Database export error:", error);
      res.status(500).json({ error: "Kh\xF4ng th\u1EC3 xu\u1EA5t database" });
    }
  });
  app2.post("/api/admin/import-database", sqlUpload.single("sqlFile"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Vui l\xF2ng ch\u1ECDn file SQL" });
      }
      const sqlContent = req.file.buffer.toString("utf-8");
      await storage.importSqlData(sqlContent);
      res.json({ success: true, message: "Import database th\xE0nh c\xF4ng" });
    } catch (error) {
      console.error("Database import error:", error);
      res.status(500).json({ error: "Kh\xF4ng th\u1EC3 import database" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 1600
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json({ limit: "10mb" }));
app.use(express2.urlencoded({ extended: false, limit: "10mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, () => {
    log(`serving on port ${port}`);
  });
})();

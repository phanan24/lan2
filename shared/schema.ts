import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Admin settings table
export const adminSettings = pgTable("admin_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  aiModel: varchar("ai_model", { length: 50 }), // Legacy column - keep for compatibility
  apiKey: text("api_key"), // Legacy column - keep for compatibility
  deepseekEnabled: boolean("deepseek_enabled").notNull().default(true),
  gpt5Enabled: boolean("gpt5_enabled").notNull().default(false),
  openrouterApiKey: text("openrouter_api_key"),
  imgbbApiKey: text("imgbb_api_key"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Homework submissions table
export const homeworkSubmissions = pgTable("homework_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subject: varchar("subject", { length: 50 }).notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  analysis: jsonb("analysis"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Generated tests table
export const generatedTests = pgTable("generated_tests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subject: varchar("subject", { length: 50 }).notNull(),
  difficulty: varchar("difficulty", { length: 20 }).notNull(),
  questionType: varchar("question_type", { length: 30 }).notNull(),
  questionCount: integer("question_count").notNull(),
  requirements: text("requirements"),
  questions: jsonb("questions").notNull(),
  answers: jsonb("answers").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat conversations table
export const chatConversations = pgTable("chat_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  messages: jsonb("messages").notNull().default("[]"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Homework chat context table - stores Q&A context for each homework
export const homeworkChatContext = pgTable("homework_chat_context", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  homeworkId: varchar("homework_id").notNull(),
  subject: varchar("subject").notNull(),
  homeworkContent: varchar("homework_content").notNull(),
  analysis: jsonb("analysis").notNull(),
  questions: jsonb("questions").notNull().default("[]"), // Array of {question, answer, timestamp}
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAdminSettingsSchema = createInsertSchema(adminSettings).pick({
  deepseekEnabled: true,
  gpt5Enabled: true,
  openrouterApiKey: true,
  imgbbApiKey: true,
});

export const insertHomeworkSubmissionSchema = createInsertSchema(homeworkSubmissions).pick({
  subject: true,
  content: true,
  imageUrl: true,
});

export const insertGeneratedTestSchema = createInsertSchema(generatedTests).pick({
  subject: true,
  difficulty: true,
  questionType: true,
  questionCount: true,
  requirements: true,
});

export const insertChatConversationSchema = createInsertSchema(chatConversations).pick({
  messages: true,
});

export const insertHomeworkChatContextSchema = createInsertSchema(homeworkChatContext).pick({
  homeworkId: true,
  subject: true,
  homeworkContent: true,
  analysis: true,
  questions: true,
});

export type InsertAdminSettings = z.infer<typeof insertAdminSettingsSchema>;
export type InsertHomeworkSubmission = z.infer<typeof insertHomeworkSubmissionSchema>;
export type InsertGeneratedTest = z.infer<typeof insertGeneratedTestSchema>;
export type InsertChatConversation = z.infer<typeof insertChatConversationSchema>;
export type InsertHomeworkChatContext = z.infer<typeof insertHomeworkChatContextSchema>;

export type AdminSettings = typeof adminSettings.$inferSelect;
export type HomeworkSubmission = typeof homeworkSubmissions.$inferSelect;
export type GeneratedTest = typeof generatedTests.$inferSelect;
export type ChatConversation = typeof chatConversations.$inferSelect;
export type HomeworkChatContext = typeof homeworkChatContext.$inferSelect;

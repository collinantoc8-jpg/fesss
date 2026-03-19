import { pgTable, text, integer, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const facultyTable = pgTable("faculty", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  department: text("department").notNull(),
  position: text("position").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFacultySchema = createInsertSchema(facultyTable).omit({ id: true, createdAt: true });
export type InsertFaculty = z.infer<typeof insertFacultySchema>;
export type Faculty = typeof facultyTable.$inferSelect;

export const criteriaTable = pgTable("criteria", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  maxScore: integer("max_score").notNull().default(5),
  category: text("category").notNull(),
});

export const insertCriterionSchema = createInsertSchema(criteriaTable).omit({ id: true });
export type InsertCriterion = z.infer<typeof insertCriterionSchema>;
export type Criterion = typeof criteriaTable.$inferSelect;

export const evaluationsTable = pgTable("evaluations", {
  id: serial("id").primaryKey(),
  facultyId: integer("faculty_id").notNull().references(() => facultyTable.id, { onDelete: "cascade" }),
  evaluatorName: text("evaluator_name").notNull(),
  evaluatorRole: text("evaluator_role").notNull(),
  semester: text("semester").notNull(),
  academicYear: text("academic_year").notNull(),
  comments: text("comments"),
  totalScore: integer("total_score").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const evaluationScoresTable = pgTable("evaluation_scores", {
  id: serial("id").primaryKey(),
  evaluationId: integer("evaluation_id").notNull().references(() => evaluationsTable.id, { onDelete: "cascade" }),
  criterionId: integer("criterion_id").notNull().references(() => criteriaTable.id, { onDelete: "cascade" }),
  score: integer("score").notNull(),
});

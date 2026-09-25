import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const automateTasks = pgTable("automate_tasks", {
  id: text("id").primaryKey(),
  orgId: text("org_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .notNull()
    .default(sql`now()`),
});

export const automateTaskTags = pgTable(
  "automate_task_tags",
  {
    taskId: text("task_id")
      .notNull()
      .references(() => automateTasks.id, { onDelete: "cascade" }),
    orgId: text("org_id").notNull(),
    tag: text("tag").notNull(),
    tagKey: text("tag_key").notNull(),
  },
  (table) => [primaryKey({ columns: [table.taskId, table.tagKey] })],
);

export const automateAutomations = pgTable("automate_automations", {
  id: text("id").primaryKey(),
  orgId: text("org_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  triggerType: text("trigger_type").notNull(),
  timezone: text("timezone").notNull(),
  paused: boolean("paused").notNull().default(false),
  timeOfDay: text("time_of_day"),
  weeklyDay: integer("weekly_day"),
  intervalValue: integer("interval_value"),
  intervalUnit: text("interval_unit"),
  onceAt: timestamp("once_at", { withTimezone: true, mode: "string" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .notNull()
    .default(sql`now()`),
});

export const automateAutomationLogs = pgTable("automate_automation_logs", {
  id: text("id").primaryKey(),
  orgId: text("org_id").notNull(),
  automationId: text("automation_id").notNull(),
  automationTitle: text("automation_title").notNull(),
  triggerType: text("trigger_type").notNull(),
  runKind: text("run_kind").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .default(sql`now()`),
});

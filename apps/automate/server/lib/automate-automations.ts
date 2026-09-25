import { and, desc, eq } from "drizzle-orm";

import { getDb } from "../db/index.js";
import {
  automateAutomationLogs,
  automateAutomations,
} from "../db/schema.js";

export type AutomationRecord = {
  id: string;
  title: string;
  description: string;
  triggerType: string;
  timezone: string;
  paused: boolean;
  timeOfDay: string | null;
  weeklyDay: number | null;
  intervalValue: number | null;
  intervalUnit: string | null;
  onceAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AutomationLogRecord = {
  id: string;
  automationId: string;
  automationTitle: string;
  triggerType: string;
  runKind: string;
  status: string;
  createdAt: string;
};

export function toAutomationRecord(
  row: typeof automateAutomations.$inferSelect,
): AutomationRecord {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    triggerType: row.triggerType,
    timezone: row.timezone,
    paused: row.paused,
    timeOfDay: row.timeOfDay,
    weeklyDay: row.weeklyDay,
    intervalValue: row.intervalValue,
    intervalUnit: row.intervalUnit,
    onceAt: row.onceAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function listAutomationsForOrg(
  orgId: string,
): Promise<AutomationRecord[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(automateAutomations)
    .where(eq(automateAutomations.orgId, orgId))
    .orderBy(desc(automateAutomations.updatedAt));
  return rows.map(toAutomationRecord);
}

export async function getAutomationForOrg(
  orgId: string,
  id: string,
): Promise<AutomationRecord | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(automateAutomations)
    .where(and(eq(automateAutomations.orgId, orgId), eq(automateAutomations.id, id)))
    .limit(1);
  return row ? toAutomationRecord(row) : null;
}

export async function listAutomationLogsForOrg(
  orgId: string,
): Promise<AutomationLogRecord[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(automateAutomationLogs)
    .where(eq(automateAutomationLogs.orgId, orgId))
    .orderBy(desc(automateAutomationLogs.createdAt));
  return rows.map((row) => ({
    id: row.id,
    automationId: row.automationId,
    automationTitle: row.automationTitle,
    triggerType: row.triggerType,
    runKind: row.runKind,
    status: row.status,
    createdAt: row.createdAt,
  }));
}

export async function appendAutomationLog(input: {
  orgId: string;
  automationId: string;
  automationTitle: string;
  triggerType: string;
  runKind: "manual" | "scheduled";
  status: "success" | "error";
}): Promise<AutomationLogRecord> {
  const db = getDb();
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await db.insert(automateAutomationLogs).values({
    id,
    orgId: input.orgId,
    automationId: input.automationId,
    automationTitle: input.automationTitle,
    triggerType: input.triggerType,
    runKind: input.runKind,
    status: input.status,
    createdAt,
  });
  return {
    id,
    automationId: input.automationId,
    automationTitle: input.automationTitle,
    triggerType: input.triggerType,
    runKind: input.runKind,
    status: input.status,
    createdAt,
  };
}

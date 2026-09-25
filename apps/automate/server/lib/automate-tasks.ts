import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";

import { getDb } from "../db/index.js";
import {
  automateTaskTags,
  automateTasks,
} from "../db/schema.js";
import { normalizeTagKey } from "./automate-scope.js";

export type TaskRecord = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export async function loadTasksForOrg(
  orgId: string,
  options?: { search?: string; tagKeys?: string[] },
): Promise<TaskRecord[]> {
  const db = getDb();
  const search = options?.search?.trim().toLowerCase();
  const tagKeys = options?.tagKeys?.map(normalizeTagKey).filter(Boolean) ?? [];

  let taskIds: string[] | null = null;
  if (tagKeys.length > 0) {
    const tagged = await db
      .select({
        taskId: automateTaskTags.taskId,
        keyCount: sql<number>`count(distinct ${automateTaskTags.tagKey})`.as(
          "key_count",
        ),
      })
      .from(automateTaskTags)
      .innerJoin(automateTasks, eq(automateTasks.id, automateTaskTags.taskId))
      .where(
        and(
          eq(automateTasks.orgId, orgId),
          inArray(automateTaskTags.tagKey, tagKeys),
        ),
      )
      .groupBy(automateTaskTags.taskId)
      .having(sql`count(distinct ${automateTaskTags.tagKey}) = ${tagKeys.length}`);

    taskIds = tagged.map((row) => row.taskId);
    if (taskIds.length === 0) return [];
  }

  const rows = await db
    .select()
    .from(automateTasks)
    .where(
      and(
        eq(automateTasks.orgId, orgId),
        taskIds ? inArray(automateTasks.id, taskIds) : undefined,
        search
          ? or(
              ilike(automateTasks.title, `%${search}%`),
              ilike(automateTasks.description, `%${search}%`),
            )
          : undefined,
      ),
    )
    .orderBy(desc(automateTasks.updatedAt));

  if (rows.length === 0) return [];

  const tags = await db
    .select()
    .from(automateTaskTags)
    .where(
      inArray(
        automateTaskTags.taskId,
        rows.map((row) => row.id),
      ),
    );

  const tagsByTask = new Map<string, string[]>();
  for (const tag of tags) {
    const list = tagsByTask.get(tag.taskId) ?? [];
    list.push(tag.tag);
    tagsByTask.set(tag.taskId, list);
  }

  if (search) {
    const filtered = rows.filter((row) => {
      const rowTags = tagsByTask.get(row.id) ?? [];
      const tagMatch = rowTags.some((tag) =>
        tag.toLowerCase().includes(search),
      );
      return (
        tagMatch ||
        row.title.toLowerCase().includes(search) ||
        row.description.toLowerCase().includes(search)
      );
    });
    return filtered.map((row) => toTaskRecord(row, tagsByTask.get(row.id) ?? []));
  }

  return rows.map((row) => toTaskRecord(row, tagsByTask.get(row.id) ?? []));
}

function toTaskRecord(
  row: typeof automateTasks.$inferSelect,
  tags: string[],
): TaskRecord {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    tags,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function replaceTaskTags(
  taskId: string,
  orgId: string,
  tags: string[],
): Promise<void> {
  const db = getDb();
  await db.delete(automateTaskTags).where(eq(automateTaskTags.taskId, taskId));
  if (tags.length === 0) return;
  await db.insert(automateTaskTags).values(
    tags.map((tag) => ({
      taskId,
      orgId,
      tag,
      tagKey: normalizeTagKey(tag),
    })),
  );
}

export async function listDistinctTagKeys(orgId: string): Promise<string[]> {
  const db = getDb();
  const rows = await db
    .selectDistinct({ tag: automateTaskTags.tag, tagKey: automateTaskTags.tagKey })
    .from(automateTaskTags)
    .innerJoin(automateTasks, eq(automateTasks.id, automateTaskTags.taskId))
    .where(eq(automateTasks.orgId, orgId))
    .orderBy(automateTaskTags.tagKey);
  return rows.map((row) => row.tag);
}

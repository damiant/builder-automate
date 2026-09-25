import { defineAction } from "@agent-native/core/action";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "../server/db/index.js";
import { automateTasks } from "../server/db/schema.js";
import { normalizeTags, requireOrgId } from "../server/lib/automate-scope.js";
import { loadTasksForOrg, replaceTaskTags } from "../server/lib/automate-tasks.js";

export default defineAction({
  description: "Update an org-shared task's title, description, and tags.",
  mcpTool: true,
  schema: z.object({
    id: z.string().min(1),
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    tags: z.array(z.string()).optional().default([]),
  }),
  run: async ({ id, title, description, tags }) => {
    const orgId = await requireOrgId();
    const db = getDb();
    const now = new Date().toISOString();
    const updated = await db
      .update(automateTasks)
      .set({ title, description, updatedAt: now })
      .where(and(eq(automateTasks.id, id), eq(automateTasks.orgId, orgId)))
      .returning({ id: automateTasks.id });
    if (updated.length === 0) {
      throw new Error("Task not found.");
    }
    await replaceTaskTags(id, orgId, normalizeTags(tags));
    const task = (await loadTasksForOrg(orgId)).find((item) => item.id === id);
    if (!task) throw new Error("Task not found.");
    return { task };
  },
});

import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { getDb } from "../server/db/index.js";
import { automateTasks } from "../server/db/schema.js";
import { normalizeTags, requireOrgId } from "../server/lib/automate-scope.js";
import { loadTasksForOrg, replaceTaskTags } from "../server/lib/automate-tasks.js";

export default defineAction({
  description: "Create an org-shared task with title, description, and optional tags.",
  mcpTool: true,
  schema: z.object({
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    tags: z.array(z.string()).optional().default([]),
  }),
  run: async ({ title, description, tags }) => {
    const orgId = await requireOrgId();
    const id = crypto.randomUUID();
    const normalizedTags = normalizeTags(tags);
    const db = getDb();
    const now = new Date().toISOString();
    await db.insert(automateTasks).values({
      id,
      orgId,
      title,
      description,
      createdAt: now,
      updatedAt: now,
    });
    await replaceTaskTags(id, orgId, normalizedTags);
    const created = (await loadTasksForOrg(orgId)).find((item) => item.id === id);
    return {
      task:
        created ??
        ({
          id,
          title,
          description,
          tags: normalizedTags,
          createdAt: now,
          updatedAt: now,
        } as const),
    };
  },
});

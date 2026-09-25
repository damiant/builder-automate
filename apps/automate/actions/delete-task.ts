import { defineAction } from "@agent-native/core/action";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "../server/db/index.js";
import { automateTasks } from "../server/db/schema.js";
import { requireOrgId } from "../server/lib/automate-scope.js";

export default defineAction({
  description: "Delete an org-shared task permanently.",
  mcpTool: true,
  schema: z.object({
    id: z.string().min(1),
  }),
  run: async ({ id }) => {
    const orgId = await requireOrgId();
    const db = getDb();
    const deleted = await db
      .delete(automateTasks)
      .where(and(eq(automateTasks.id, id), eq(automateTasks.orgId, orgId)))
      .returning({ id: automateTasks.id });
    if (deleted.length === 0) {
      throw new Error("Task not found.");
    }
    return { ok: true as const, id };
  },
});

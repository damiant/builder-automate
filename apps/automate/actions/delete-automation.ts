import { defineAction } from "@agent-native/core/action";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "../server/db/index.js";
import {
  automateAutomationLogs,
  automateAutomations,
} from "../server/db/schema.js";
import { requireOrgId } from "../server/lib/automate-scope.js";

export default defineAction({
  description: "Delete an org-shared automation and its log entries.",
  schema: z.object({
    id: z.string().min(1),
  }),
  run: async ({ id }) => {
    const orgId = await requireOrgId();
    const db = getDb();
    await db
      .delete(automateAutomationLogs)
      .where(
        and(
          eq(automateAutomationLogs.automationId, id),
          eq(automateAutomationLogs.orgId, orgId),
        ),
      );
    const deleted = await db
      .delete(automateAutomations)
      .where(and(eq(automateAutomations.id, id), eq(automateAutomations.orgId, orgId)))
      .returning({ id: automateAutomations.id });
    if (deleted.length === 0) throw new Error("Automation not found.");
    return { ok: true as const, id };
  },
});

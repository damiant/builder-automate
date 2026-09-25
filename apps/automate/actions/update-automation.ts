import { defineAction } from "@agent-native/core/action";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "../server/db/index.js";
import { automateAutomations } from "../server/db/schema.js";
import { getAutomationForOrg } from "../server/lib/automate-automations.js";
import { automationScheduleSchema } from "../server/lib/automate-schemas.js";
import { requireOrgId } from "../server/lib/automate-scope.js";

export default defineAction({
  description: "Update an org-shared automation.",
  schema: z
    .object({
      id: z.string().min(1),
      title: z.string().trim().min(1),
      description: z.string().trim().min(1),
      paused: z.boolean(),
    })
    .and(automationScheduleSchema),
  run: async (input) => {
    const orgId = await requireOrgId();
    const db = getDb();
    const now = new Date().toISOString();
    const updated = await db
      .update(automateAutomations)
      .set({
        title: input.title,
        description: input.description,
        triggerType: input.triggerType,
        timezone: input.timezone,
        paused: input.paused,
        timeOfDay: input.timeOfDay ?? null,
        weeklyDay: input.weeklyDay ?? null,
        intervalValue: input.intervalValue ?? null,
        intervalUnit: input.intervalUnit ?? null,
        onceAt: input.onceAt ?? null,
        updatedAt: now,
      })
      .where(
        and(
          eq(automateAutomations.id, input.id),
          eq(automateAutomations.orgId, orgId),
        ),
      )
      .returning({ id: automateAutomations.id });
    if (updated.length === 0) throw new Error("Automation not found.");
    const automation = await getAutomationForOrg(orgId, input.id);
    if (!automation) throw new Error("Automation not found.");
    return { automation };
  },
});

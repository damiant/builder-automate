import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { getDb } from "../server/db/index.js";
import { automateAutomations } from "../server/db/schema.js";
import { getAutomationForOrg } from "../server/lib/automate-automations.js";
import { automationScheduleSchema } from "../server/lib/automate-schemas.js";
import { requireOrgId } from "../server/lib/automate-scope.js";

export default defineAction({
  description: "Create an org-shared automation with schedule metadata.",
  schema: z
    .object({
      title: z.string().trim().min(1),
      description: z.string().trim().min(1),
      paused: z.boolean().optional().default(false),
    })
    .and(automationScheduleSchema),
  run: async (input) => {
    const orgId = await requireOrgId();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const db = getDb();
    await db.insert(automateAutomations).values({
      id,
      orgId,
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
      createdAt: now,
      updatedAt: now,
    });
    const automation = await getAutomationForOrg(orgId, id);
    if (!automation) throw new Error("Automation not found.");
    return { automation };
  },
});

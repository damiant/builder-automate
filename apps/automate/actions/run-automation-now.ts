import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import {
  appendAutomationLog,
  getAutomationForOrg,
} from "../server/lib/automate-automations.js";
import { requireOrgId } from "../server/lib/automate-scope.js";

export default defineAction({
  description:
    "Manually test an automation. Writes an automation log entry (execution is not run yet).",
  schema: z.object({
    id: z.string().min(1),
  }),
  run: async ({ id }) => {
    const orgId = await requireOrgId();
    const automation = await getAutomationForOrg(orgId, id);
    if (!automation) throw new Error("Automation not found.");
    const log = await appendAutomationLog({
      orgId,
      automationId: automation.id,
      automationTitle: automation.title,
      triggerType: automation.triggerType,
      runKind: "manual",
      status: "success",
    });
    return { log };
  },
});

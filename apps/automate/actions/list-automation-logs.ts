import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { listAutomationLogsForOrg } from "../server/lib/automate-automations.js";
import { requireOrgId } from "../server/lib/automate-scope.js";

export default defineAction({
  description: "List automation run log entries for the organization.",
  schema: z.object({}),
  http: { method: "GET" },
  readOnly: true,
  run: async () => {
    const orgId = await requireOrgId();
    const logs = await listAutomationLogsForOrg(orgId);
    return { logs };
  },
});

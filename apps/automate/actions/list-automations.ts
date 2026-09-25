import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { listAutomationsForOrg } from "../server/lib/automate-automations.js";
import { requireOrgId } from "../server/lib/automate-scope.js";

export default defineAction({
  description: "List org-shared automations.",
  schema: z.object({}),
  http: { method: "GET" },
  readOnly: true,
  run: async () => {
    const orgId = await requireOrgId();
    const automations = await listAutomationsForOrg(orgId);
    return { automations };
  },
});

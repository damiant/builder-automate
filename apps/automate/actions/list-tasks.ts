import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import {
  listDistinctTagKeys,
  loadTasksForOrg,
} from "../server/lib/automate-tasks.js";
import { requireOrgId } from "../server/lib/automate-scope.js";

export default defineAction({
  description: "List org-shared tasks, optionally filtered by search and tags (AND).",
  mcpTool: true,
  schema: z.object({
    search: z.string().optional().describe("Filter by title, description, or tag text"),
    tags: z
      .array(z.string())
      .optional()
      .describe("Tags that must all be present on the task"),
  }),
  http: { method: "GET" },
  readOnly: true,
  run: async ({ search, tags }) => {
    const orgId = await requireOrgId();
    const [tasks, allTags] = await Promise.all([
      loadTasksForOrg(orgId, { search, tagKeys: tags }),
      listDistinctTagKeys(orgId),
    ]);
    return { tasks, allTags };
  },
});

import { runMigrations } from "@agent-native/core/db";

export default runMigrations(
  [
    {
      version: 1,
      name: "factory-tasks-automations-logs",
      sql: `
        CREATE TABLE IF NOT EXISTS factory_tasks (
          id TEXT PRIMARY KEY,
          org_id TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS factory_task_tags (
          task_id TEXT NOT NULL REFERENCES factory_tasks(id) ON DELETE CASCADE,
          org_id TEXT NOT NULL,
          tag TEXT NOT NULL,
          tag_key TEXT NOT NULL,
          PRIMARY KEY (task_id, tag_key)
        );

        CREATE INDEX IF NOT EXISTS factory_tasks_org_updated_idx
          ON factory_tasks (org_id, updated_at DESC);

        CREATE TABLE IF NOT EXISTS factory_automations (
          id TEXT PRIMARY KEY,
          org_id TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          trigger_type TEXT NOT NULL,
          timezone TEXT NOT NULL,
          paused BOOLEAN NOT NULL DEFAULT false,
          time_of_day TEXT,
          weekly_day INTEGER,
          interval_value INTEGER,
          interval_unit TEXT,
          once_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS factory_automations_org_updated_idx
          ON factory_automations (org_id, updated_at DESC);

        CREATE TABLE IF NOT EXISTS factory_automation_logs (
          id TEXT PRIMARY KEY,
          org_id TEXT NOT NULL,
          automation_id TEXT NOT NULL,
          automation_title TEXT NOT NULL,
          trigger_type TEXT NOT NULL,
          run_kind TEXT NOT NULL,
          status TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS factory_automation_logs_org_created_idx
          ON factory_automation_logs (org_id, created_at DESC);
      `,
    },
    {
      version: 2,
      name: "factory-task-tags-org-id",
      sql: `
        ALTER TABLE factory_task_tags
          ADD COLUMN IF NOT EXISTS org_id TEXT;

        UPDATE factory_task_tags AS tags
        SET org_id = tasks.org_id
        FROM factory_tasks AS tasks
        WHERE tags.task_id = tasks.id
          AND tags.org_id IS NULL;

        ALTER TABLE factory_task_tags
          ALTER COLUMN org_id SET NOT NULL;
      `,
    },
    {
      version: 3,
      name: "rename-factory-tables-to-automate",
      sql: `
        ALTER TABLE IF EXISTS factory_tasks RENAME TO automate_tasks;
        ALTER TABLE IF EXISTS factory_task_tags RENAME TO automate_task_tags;
        ALTER TABLE IF EXISTS factory_automations RENAME TO automate_automations;
        ALTER TABLE IF EXISTS factory_automation_logs RENAME TO automate_automation_logs;

        ALTER INDEX IF EXISTS factory_tasks_org_updated_idx
          RENAME TO automate_tasks_org_updated_idx;
        ALTER INDEX IF EXISTS factory_automations_org_updated_idx
          RENAME TO automate_automations_org_updated_idx;
        ALTER INDEX IF EXISTS factory_automation_logs_org_created_idx
          RENAME TO automate_automation_logs_org_created_idx;

        DROP TABLE IF EXISTS chat_factory_migrations;
      `,
    },
  ],
  { table: "automate_migrations" },
);

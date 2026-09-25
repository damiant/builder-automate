# Automate

Automate is the workspace app for agent chat and operator workflows. Tasks, automations, and automation logs are org-shared backlog and scheduling primitives used from the chat sidebar.

## Language

**Task**:
An org-shared unit of work with a required title, required description, and zero or more tags.
_Avoid_: ticket, issue (unless referring to external trackers)

**Tag**:
A freeform label on a Task, normalized for identity by trimming whitespace and comparing case-insensitively; display preserves the spelling first saved on that task.
_Avoid_: label (generic UI), category (implies a fixed taxonomy)

**Automation**:
An org-shared scheduled definition with a required title, required description (prompt body), a trigger schedule, stored timezone, and a paused flag. Firing executes agent work later; until then only manual test runs write logs. Scheduled execution is not implemented yet.
_Avoid_: recurring job (Dispatch workspace concept), cron (implementation)

**Automation log entry**:
A timestamped record that an Automation run occurred (manual “Run now” now; scheduled runs later), including automation identity, trigger type, run kind, and status.
_Avoid_: audit log (user CRUD history is out of scope)

**Run now**:
A manual test run of an Automation that writes an Automation log entry regardless of the paused flag.

**Paused** (Automation):
When set, blocks future scheduled fires only; Run now remains allowed.

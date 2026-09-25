# Automate

Agent chat, tasks, automations, and operator workflows in the Builder Factory
workspace. Open it at `/automate` on the workspace gateway when you want the
primary conversation and automation surface.

Automate runs the app-agent loop end to end with actions you can extend with UI,
data, and workspace workflows.

## Features

- Conversation shell with a threads list and durable chat history
- Tasks, automations, and run logs from the sidebar
- Auth, live sync, and application state wired out of the box
- The action surface the agent and UI share

## Develop locally

From the workspace root:

```bash
pnpm install
pnpm dev
```

Then open `/automate` on the workspace gateway (authenticated chat starts at
`/automate/home`).

import { appPath } from "@agent-native/core/client/api-path";
import { MarketingHome } from "@agent-native/toolkit/marketing";

import { APP_TITLE } from "@/lib/app-config";

const SEO_TITLE = `${APP_TITLE} — Builder Factory workspace`;
const SEO_DESCRIPTION =
  "Automate is the Builder Factory workspace app for agent chat, tasks, automations, shared actions, and workflows your agent can extend.";

export function meta() {
  return [
    { title: SEO_TITLE },
    { name: "description", content: SEO_DESCRIPTION },
    { property: "og:title", content: SEO_TITLE },
    { property: "og:description", content: SEO_DESCRIPTION },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: SEO_TITLE },
    { name: "twitter:description", content: SEO_DESCRIPTION },
  ];
}

export default function MarketingHomeRoute() {
  return (
    <MarketingHome
      appName={APP_TITLE}
      tagline="Build and ship agent-native apps from one workspace conversation."
      description={SEO_DESCRIPTION}
      valueProps={[
        "Durable agent threads with tool history for day-to-day Builder work",
        "Shared actions across chat, UI, HTTP, MCP, A2A, and sibling workspace apps",
        "Extend Automate with new actions, screens, and workflows as products grow",
      ]}
      primaryActionHref={appPath("/home")}
      secondaryActionHref={appPath("/sign-in")}
    />
  );
}

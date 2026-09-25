import { markAgentChatHomeHandoff } from "@agent-native/core/client/agentkit-chat/rail";
import { appPath } from "@agent-native/core/client/api-path";
import { useEffect, useRef, useState } from "react";

import { APP_TITLE } from "@/lib/app-config";
import { getChatHomeThreadId } from "@/lib/chat-home-thread";

const SEO_TITLE = `${APP_TITLE} — Builder Factory workspace`;
const SEO_DESCRIPTION =
  "Factory is the Builder Factory home app: durable agent chat, shared actions, UI state, and a backend your agent can extend across workspace apps.";

export function meta() {
  return [
    { title: SEO_TITLE },
    {
      name: "description",
      content: SEO_DESCRIPTION,
    },
    { property: "og:title", content: SEO_TITLE },
    { property: "og:description", content: SEO_DESCRIPTION },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: SEO_TITLE },
    { name: "twitter:description", content: SEO_DESCRIPTION },
  ];
}

export default function ChatRoute() {
  const [threadId] = useState(getChatHomeThreadId);
  const handoffStartedRef = useRef(false);

  useEffect(() => {
    if (handoffStartedRef.current) return;
    handoffStartedRef.current = true;
    markAgentChatHomeHandoff("automate");
    try {
      window.location.replace(appPath(`/chat/${encodeURIComponent(threadId)}`));
    } catch (error) {
      handoffStartedRef.current = false;
      throw error;
    }
  }, [threadId]);

  return null;
}

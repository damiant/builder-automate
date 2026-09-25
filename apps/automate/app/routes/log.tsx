import { useActionQuery } from "@agent-native/core/client/hooks";
import { useT } from "@agent-native/core/client/i18n";
import { useSetPageTitle } from "@agent-native/toolkit/app-shell";
import { useState } from "react";

import { WorkPageHeader } from "@/components/work/WorkPageHeader";

type LogRow = {
  id: string;
  automationTitle: string;
  triggerType: string;
  runKind: string;
  status: string;
  createdAt: string;
};

export function meta() {
  return [{ title: "Log" }];
}

function formatLogTime(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function LogPage() {
  const t = useT();
  useSetPageTitle(t("work.logTitle"));

  const [search, setSearch] = useState("");
  const query = useActionQuery("list-automation-logs", {}, {
    placeholderData: (previous) => previous,
  });

  const logs = ((query.data?.logs ?? []) as LogRow[]).filter((row) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      row.automationTitle.toLowerCase().includes(q) ||
      row.triggerType.toLowerCase().includes(q) ||
      row.runKind.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex h-full min-h-0 flex-col">
      <WorkPageHeader
        title={t("work.logTitle")}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("work.searchPlaceholder")}
        onRefresh={() => void query.refetch()}
        refreshLabel={t("work.refresh")}
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        {query.isLoading && logs.length === 0 ? (
          <div className="space-y-0 px-4 py-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse border-b border-border py-4"
              >
                <div className="mb-2 h-3 w-1/3 rounded bg-muted" />
                <div className="h-3 w-2/3 rounded bg-muted/70" />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <p className="px-4 py-10 text-sm text-muted-foreground">
            {t("work.logEmpty")}
          </p>
        ) : (
          <ul>
            {logs.map((row) => (
              <li
                key={row.id}
                className="border-b border-border px-4 py-4 text-sm"
              >
                <p className="font-medium">{row.automationTitle}</p>
                <p className="mt-1 text-muted-foreground">
                  {formatLogTime(row.createdAt)} · {row.triggerType} ·{" "}
                  {row.runKind} · {row.status}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

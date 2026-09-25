import {
  actionErrorMessage,
  useActionMutation,
  useActionQuery,
} from "@agent-native/core/client/hooks";
import { useT } from "@agent-native/core/client/i18n";
import { useSetPageTitle } from "@agent-native/toolkit/app-shell";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  AutomationEditorDialog,
  automationRecordToEditorValues,
  automationValuesToPayload,
  defaultAutomationEditorValues,
} from "@/components/work/AutomationEditorDialog";
import { WorkPageHeader } from "@/components/work/WorkPageHeader";
import { cn } from "@/lib/utils";

type AutomationRow = {
  id: string;
  title: string;
  description: string;
  triggerType: string;
  timezone: string;
  paused: boolean;
  timeOfDay: string | null;
  weeklyDay: number | null;
  intervalValue: number | null;
  intervalUnit: string | null;
  onceAt: string | null;
  updatedAt: string;
};

export function meta() {
  return [{ title: "Automations" }];
}

export default function AutomationsPage() {
  const t = useT();
  useSetPageTitle(t("work.automationsTitle"));

  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<AutomationRow | null>(null);

  const query = useActionQuery("list-automations", {}, {
    placeholderData: (previous) => previous,
  });

  const automations = ((query.data?.automations ?? []) as AutomationRow[]).filter(
    (item) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    },
  );

  const createMutation = useActionMutation("create-automation", {
    onSuccess: () => {
      setEditorOpen(false);
      toast.success(t("work.automationCreated"));
    },
    onError: (error) =>
      toast.error(actionErrorMessage(error) ?? t("work.automationSaveFailed")),
  });
  const updateMutation = useActionMutation("update-automation", {
    onSuccess: () => {
      setEditorOpen(false);
      setEditing(null);
      toast.success(t("work.automationUpdated"));
    },
    onError: (error) =>
      toast.error(actionErrorMessage(error) ?? t("work.automationSaveFailed")),
  });
  const deleteMutation = useActionMutation("delete-automation", {
    onSuccess: () => {
      setEditorOpen(false);
      setEditing(null);
      toast.success(t("work.automationDeleted"));
    },
    onError: (error) =>
      toast.error(actionErrorMessage(error) ?? t("work.automationDeleteFailed")),
  });
  const runNowMutation = useActionMutation("run-automation-now", {
    onSuccess: () => toast.success(t("work.automationRunLogged")),
    onError: (error) =>
      toast.error(actionErrorMessage(error) ?? t("work.automationRunFailed")),
  });

  const busy =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    runNowMutation.isPending;

  function openCreate() {
    setEditing(null);
    setEditorOpen(true);
  }

  function openEdit(row: AutomationRow) {
    setEditing(row);
    setEditorOpen(true);
  }

  function handleSave(values: ReturnType<typeof defaultAutomationEditorValues>) {
    const payload = automationValuesToPayload(values);
    if (editing) {
      updateMutation.mutate({
        id: editing.id,
        ...payload,
        paused: payload.paused ?? editing.paused,
      });
      return;
    }
    createMutation.mutate({ ...payload, paused: payload.paused ?? false });
  }

  function handleDelete() {
    if (!editing) return;
    if (!window.confirm(t("work.confirmDeleteAutomation"))) return;
    deleteMutation.mutate({ id: editing.id });
  }

  function handleRunNow() {
    if (!editing) return;
    runNowMutation.mutate({ id: editing.id });
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <WorkPageHeader
        title={t("work.automationsTitle")}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("work.searchPlaceholder")}
        onRefresh={() => void query.refetch()}
        refreshLabel={t("work.refresh")}
      />
      <div className="min-h-0 flex-1 overflow-y-auto pb-24">
        {query.isLoading && automations.length === 0 ? (
          <div className="space-y-0 px-4 py-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse border-b border-border py-5"
              >
                <div className="mb-2 h-4 w-1/2 rounded bg-muted" />
                <div className="h-3 w-full rounded bg-muted/70" />
              </div>
            ))}
          </div>
        ) : automations.length === 0 ? (
          <p className="px-4 py-10 text-sm text-muted-foreground">
            {t("work.automationsEmpty")}
          </p>
        ) : (
          <ul>
            {automations.map((row) => (
              <li key={row.id} className="border-b border-border">
                <button
                  type="button"
                  onClick={() => openEdit(row)}
                  className="w-full px-4 py-5 text-start transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-2">
                    <p className="text-base font-medium">{row.title}</p>
                    {row.paused ? (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {t("work.paused")}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                    {row.triggerType}
                  </p>
                  <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground">
                    {row.description}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Button
        type="button"
        size="icon"
        className={cn(
          "fixed bottom-6 end-6 z-40 size-14 rounded-full shadow-lg",
        )}
        onClick={openCreate}
        aria-label={t("work.newAutomation")}
      >
        <IconPlus className="size-6" strokeWidth={1.8} />
      </Button>
      <AutomationEditorDialog
        open={editorOpen}
        mode={editing ? "edit" : "create"}
        initial={
          editing
            ? automationRecordToEditorValues(editing)
            : defaultAutomationEditorValues()
        }
        titleLabel={
          editing ? t("work.editAutomation") : t("work.newAutomation")
        }
        saveLabel={t("work.save")}
        deleteLabel={t("work.delete")}
        runNowLabel={t("work.runNow")}
        timezoneLabel={t("work.timezone")}
        onClose={() => {
          setEditorOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
        onDelete={editing ? handleDelete : undefined}
        onRunNow={editing ? handleRunNow : undefined}
        busy={busy}
      />
    </div>
  );
}

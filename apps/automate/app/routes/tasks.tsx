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
  TaskEditorDialog,
  type TaskEditorValues,
} from "@/components/work/TaskEditorDialog";
import { TagChip } from "@/components/work/TagChip";
import { WorkPageHeader } from "@/components/work/WorkPageHeader";
import { cn } from "@/lib/utils";

type TaskRow = TaskEditorValues & { id: string; updatedAt: string };

export function meta() {
  return [{ title: "Tasks" }];
}

export default function TasksPage() {
  const t = useT();
  useSetPageTitle(t("work.tasksTitle"));

  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<TaskRow | null>(null);

  const query = useActionQuery(
    "list-tasks",
    {
      search: search.trim() || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
    },
    { placeholderData: (previous) => previous },
  );

  const tasks = (query.data?.tasks ?? []) as TaskRow[];

  const allTags = (query.data?.allTags ?? []) as string[];

  const createMutation = useActionMutation("create-task", {
    onSuccess: () => {
      setEditorOpen(false);
      toast.success(t("work.taskCreated"));
    },
    onError: (error) =>
      toast.error(actionErrorMessage(error) ?? t("work.taskSaveFailed")),
  });
  const updateMutation = useActionMutation("update-task", {
    onSuccess: () => {
      setEditorOpen(false);
      setEditing(null);
      toast.success(t("work.taskUpdated"));
    },
    onError: (error) =>
      toast.error(actionErrorMessage(error) ?? t("work.taskSaveFailed")),
  });
  const deleteMutation = useActionMutation("delete-task", {
    onSuccess: () => {
      setEditorOpen(false);
      setEditing(null);
      toast.success(t("work.taskDeleted"));
    },
    onError: (error) =>
      toast.error(actionErrorMessage(error) ?? t("work.taskDeleteFailed")),
  });

  function openCreate() {
    setEditing(null);
    setEditorOpen(true);
  }

  function openEdit(task: TaskRow) {
    setEditing(task);
    setEditorOpen(true);
  }

  function handleSave(values: TaskEditorValues) {
    if (editing) {
      updateMutation.mutate({ id: editing.id, ...values });
      return;
    }
    createMutation.mutate(values);
  }

  function handleDelete() {
    if (!editing) return;
    if (!window.confirm(t("work.confirmDeleteTask"))) return;
    deleteMutation.mutate({ id: editing.id });
  }

  const busy =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <WorkPageHeader
        title={t("work.tasksTitle")}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("work.searchPlaceholder")}
        onRefresh={() => void query.refetch()}
        refreshLabel={t("work.refresh")}
        tagFilter={{
          allTags,
          selected: selectedTags,
          onToggle: (tag) => {
            setSelectedTags((current) =>
              current.includes(tag)
                ? current.filter((item) => item !== tag)
                : [...current, tag],
            );
          },
          onClear: () => setSelectedTags([]),
          label: t("work.filterTags"),
          emptyLabel: t("work.noTagsYet"),
        }}
      />
      <div className="min-h-0 flex-1 overflow-y-auto pb-24">
        {query.isLoading && tasks.length === 0 ? (
          <div className="space-y-0 px-4 py-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse border-b border-border py-5"
              >
                <div className="mb-2 h-4 w-2/3 rounded bg-muted" />
                <div className="mb-1 h-3 w-full rounded bg-muted/70" />
                <div className="h-3 w-4/5 rounded bg-muted/70" />
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <p className="px-4 py-10 text-sm text-muted-foreground">
            {t("work.tasksEmpty")}
          </p>
        ) : (
          <ul>
            {tasks.map((task) => (
              <li key={task.id} className="border-b border-border">
                <button
                  type="button"
                  onClick={() => openEdit(task)}
                  className="w-full px-4 py-5 text-start transition-colors hover:bg-muted/30"
                >
                  <p className="text-base font-medium leading-snug">
                    {task.title}
                  </p>
                  <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm text-muted-foreground">
                    {task.description}
                  </p>
                  {task.tags.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {task.tags.map((tag) => (
                        <TagChip key={tag} tag={tag} />
                      ))}
                    </div>
                  ) : null}
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
        aria-label={t("work.newTask")}
      >
        <IconPlus className="size-6" strokeWidth={1.8} />
      </Button>
      <TaskEditorDialog
        open={editorOpen}
        mode={editing ? "edit" : "create"}
        initial={
          editing ?? { title: "", description: "", tags: [] as string[] }
        }
        titleLabel={editing ? t("work.editTask") : t("work.newTask")}
        saveLabel={editing ? t("work.save") : t("work.add")}
        deleteLabel={t("work.delete")}
        onClose={() => {
          setEditorOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
        onDelete={editing ? handleDelete : undefined}
        busy={busy}
      />
    </div>
  );
}

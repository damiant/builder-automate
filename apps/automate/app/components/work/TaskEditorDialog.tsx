import { IconPlus, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { TagChip } from "@/components/work/TagChip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type TaskEditorValues = {
  title: string;
  description: string;
  tags: string[];
};

interface TaskEditorDialogProps {
  open: boolean;
  mode: "create" | "edit";
  initial: TaskEditorValues;
  titleLabel: string;
  saveLabel: string;
  deleteLabel?: string;
  onClose: () => void;
  onSave: (values: TaskEditorValues) => void;
  onDelete?: () => void;
  busy?: boolean;
}

export function TaskEditorDialog({
  open,
  mode,
  initial,
  titleLabel,
  saveLabel,
  deleteLabel,
  onClose,
  onSave,
  onDelete,
  busy,
}: TaskEditorDialogProps) {
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [tags, setTags] = useState(initial.tags);
  const [tagDraft, setTagDraft] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle(initial.title);
    setDescription(initial.description);
    setTags(initial.tags);
    setTagDraft("");
  }, [open, initial]);

  if (!open) return null;

  function addTag() {
    const next = tagDraft.trim();
    if (!next) return;
    const key = next.toLowerCase();
    if (tags.some((tag) => tag.trim().toLowerCase() === key)) {
      setTagDraft("");
      return;
    }
    setTags((current) => [...current, next]);
    setTagDraft("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 flex w-full max-w-lg flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base font-semibold">{titleLabel}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <IconX className="size-4" strokeWidth={1.8} />
          </button>
        </div>
        <div className="space-y-2">
          <Label htmlFor="task-title" className="sr-only">
            Title
          </Label>
          <Input
            id="task-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Title"
            className="border-0 bg-transparent px-0 text-base font-medium shadow-none focus-visible:ring-0"
          />
        </div>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe what needs to be done..."
          rows={8}
          className="min-h-[10rem] w-full resize-y rounded-xl border border-border bg-background px-3 py-3 text-sm leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                className="group inline-flex"
                onClick={() =>
                  setTags((current) => current.filter((item) => item !== tag))
                }
              >
                <TagChip
                  tag={tag}
                  className="group-hover:border-destructive/40"
                />
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={tagDraft}
              onChange={(event) => setTagDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addTag();
                }
              }}
              placeholder="Add tag"
              className="h-9 flex-1"
            />
            <Button type="button" variant="outline" size="icon" onClick={addTag}>
              <IconPlus className="size-4" strokeWidth={1.8} />
            </Button>
          </div>
        </div>
        <div
          className={cn(
            "flex gap-2 pt-1",
            mode === "edit" && onDelete ? "justify-between" : "justify-end",
          )}
        >
          {mode === "edit" && onDelete && deleteLabel ? (
            <Button
              type="button"
              variant="destructive"
              className="flex-1 sm:flex-none"
              disabled={busy}
              onClick={onDelete}
            >
              {deleteLabel}
            </Button>
          ) : null}
          <Button
            type="button"
            disabled={busy || !title.trim() || !description.trim()}
            onClick={() =>
              onSave({
                title: title.trim(),
                description: description.trim(),
                tags,
              })
            }
          >
            {saveLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

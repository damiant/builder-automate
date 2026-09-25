import { tagColorForName } from "@/lib/tag-color";
import { cn } from "@/lib/utils";

export function TagChip({
  tag,
  className,
}: {
  tag: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-xs text-foreground",
        className,
      )}
    >
      <span
        className="size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: tagColorForName(tag) }}
        aria-hidden
      />
      {tag}
    </span>
  );
}

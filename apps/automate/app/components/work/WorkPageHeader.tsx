import { IconRefresh, IconSearch, IconTag } from "@tabler/icons-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface WorkPageHeaderProps {
  title: string;
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  onRefresh: () => void;
  refreshLabel: string;
  tagFilter?: {
    allTags: string[];
    selected: string[];
    onToggle: (tag: string) => void;
    onClear: () => void;
    label: string;
    emptyLabel: string;
  };
  actions?: ReactNode;
}

export function WorkPageHeader({
  title,
  search,
  onSearchChange,
  searchPlaceholder,
  onRefresh,
  refreshLabel,
  tagFilter,
  actions,
}: WorkPageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[12rem] flex-1 sm:max-w-xs">
          <IconSearch
            className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.8}
          />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 ps-9"
          />
        </div>
        {tagFilter ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={cn(
                  "size-9 shrink-0",
                  tagFilter.selected.length > 0 && "border-foreground/30",
                )}
                aria-label={tagFilter.label}
              >
                <IconTag className="size-4" strokeWidth={1.8} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{tagFilter.label}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {tagFilter.allTags.length === 0 ? (
                <p className="px-2 py-1.5 text-xs text-muted-foreground">
                  {tagFilter.emptyLabel}
                </p>
              ) : (
                tagFilter.allTags.map((tag) => (
                  <DropdownMenuCheckboxItem
                    key={tag}
                    checked={tagFilter.selected.includes(tag)}
                    onCheckedChange={() => tagFilter.onToggle(tag)}
                  >
                    {tag}
                  </DropdownMenuCheckboxItem>
                ))
              )}
              {tagFilter.selected.length > 0 ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={false}
                    onSelect={(event) => {
                      event.preventDefault();
                      tagFilter.onClear();
                    }}
                  >
                    Clear filters
                  </DropdownMenuCheckboxItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9 shrink-0"
          onClick={onRefresh}
          aria-label={refreshLabel}
        >
          <IconRefresh className="size-4" strokeWidth={1.8} />
        </Button>
        {actions}
      </div>
    </div>
  );
}

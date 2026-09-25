import { IconX } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const TRIGGER_OPTIONS = [
  "once",
  "interval",
  "hourly",
  "daily",
  "weekdays",
  "weekly",
] as const;

type TriggerOption = (typeof TRIGGER_OPTIONS)[number];

export type AutomationEditorValues = {
  title: string;
  description: string;
  triggerType: TriggerOption;
  timezone: string;
  paused: boolean;
  timeOfDay: string;
  weeklyDay: number;
  intervalValue: number;
  intervalUnit: "minutes" | "hours";
  onceAt: string;
};

interface AutomationEditorDialogProps {
  open: boolean;
  mode: "create" | "edit";
  initial: AutomationEditorValues;
  titleLabel: string;
  saveLabel: string;
  deleteLabel?: string;
  runNowLabel?: string;
  timezoneLabel: string;
  onClose: () => void;
  onSave: (values: AutomationEditorValues) => void;
  onDelete?: () => void;
  onRunNow?: () => void;
  busy?: boolean;
}

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function defaultAutomationEditorValues(): AutomationEditorValues {
  const timezone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  return {
    title: "",
    description: "",
    triggerType: "daily",
    timezone,
    paused: false,
    timeOfDay: "09:00",
    weeklyDay: 1,
    intervalValue: 30,
    intervalUnit: "minutes",
    onceAt: "",
  };
}

export function AutomationEditorDialog({
  open,
  mode,
  initial,
  titleLabel,
  saveLabel,
  deleteLabel,
  runNowLabel,
  timezoneLabel,
  onClose,
  onSave,
  onDelete,
  onRunNow,
  busy,
}: AutomationEditorDialogProps) {
  const [values, setValues] = useState(initial);

  useEffect(() => {
    if (open) setValues(initial);
  }, [open, initial]);

  const showTime = useMemo(
    () =>
      values.triggerType === "hourly" ||
      values.triggerType === "daily" ||
      values.triggerType === "weekdays" ||
      values.triggerType === "weekly",
    [values.triggerType],
  );

  if (!open) return null;

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
        className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-xl"
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
        <Input
          value={values.title}
          onChange={(event) =>
            setValues((current) => ({ ...current, title: event.target.value }))
          }
          placeholder="Title"
          className="font-medium"
        />
        <textarea
          value={values.description}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          placeholder="Automation prompt..."
          rows={7}
          className="min-h-[8rem] w-full resize-y rounded-xl border border-border bg-background px-3 py-3 text-sm leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <div className="space-y-3 rounded-xl border border-border p-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="automation-trigger">Trigger</Label>
              <select
                id="automation-trigger"
                value={values.triggerType}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    triggerType: event.target.value as TriggerOption,
                  }))
                }
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
              >
                {TRIGGER_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                {timezoneLabel}: {values.timezone}
              </p>
            </div>
            {showTime ? (
              <div className="space-y-1.5">
                <Label htmlFor="automation-time">Time</Label>
                <Input
                  id="automation-time"
                  type="time"
                  value={values.timeOfDay}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      timeOfDay: event.target.value,
                    }))
                  }
                />
              </div>
            ) : null}
          </div>
          {values.triggerType === "weekly" ? (
            <div className="space-y-1.5">
              <Label htmlFor="automation-weekday">Day</Label>
              <select
                id="automation-weekday"
                value={values.weeklyDay}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    weeklyDay: Number(event.target.value),
                  }))
                }
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
              >
                {WEEKDAYS.map((day, index) => (
                  <option key={day} value={index}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          {values.triggerType === "interval" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="automation-interval">Every</Label>
                <Input
                  id="automation-interval"
                  type="number"
                  min={values.intervalUnit === "minutes" ? 5 : 1}
                  value={values.intervalValue}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      intervalValue: Number(event.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="automation-interval-unit">Unit</Label>
                <select
                  id="automation-interval-unit"
                  value={values.intervalUnit}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      intervalUnit: event.target.value as "minutes" | "hours",
                    }))
                  }
                  className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                </select>
              </div>
            </div>
          ) : null}
          {values.triggerType === "once" ? (
            <div className="space-y-1.5">
              <Label htmlFor="automation-once">Date & time</Label>
              <Input
                id="automation-once"
                type="datetime-local"
                value={values.onceAt}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    onceAt: event.target.value,
                  }))
                }
              />
            </div>
          ) : null}
          <label className="flex items-center justify-end gap-2 text-sm">
            <input
              type="checkbox"
              checked={values.paused}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  paused: event.target.checked,
                }))
              }
              className="size-4 rounded border-input"
            />
            Paused
          </label>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {mode === "edit" && onDelete && deleteLabel ? (
              <Button
                type="button"
                variant="destructive"
                disabled={busy}
                onClick={onDelete}
              >
                {deleteLabel}
              </Button>
            ) : null}
            {mode === "edit" && onRunNow && runNowLabel ? (
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={onRunNow}
              >
                {runNowLabel}
              </Button>
            ) : null}
          </div>
          <Button
            type="button"
            className={cn("sm:ms-auto")}
            disabled={
              busy || !values.title.trim() || !values.description.trim()
            }
            onClick={() => onSave(values)}
          >
            {saveLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export type AutomationActionPayload = {
  title: string;
  description: string;
  triggerType: TriggerOption;
  timezone: string;
  paused: boolean;
  timeOfDay?: string;
  weeklyDay?: number;
  intervalValue?: number;
  intervalUnit?: "minutes" | "hours";
  onceAt?: string;
};

export function automationValuesToPayload(
  values: AutomationEditorValues,
): AutomationActionPayload {
  const payload: AutomationActionPayload = {
    title: values.title.trim(),
    description: values.description.trim(),
    triggerType: values.triggerType,
    timezone: values.timezone,
    paused: values.paused,
  };
  if (
    values.triggerType === "daily" ||
    values.triggerType === "weekdays" ||
    values.triggerType === "weekly" ||
    values.triggerType === "hourly"
  ) {
    payload.timeOfDay = values.timeOfDay;
  }
  if (values.triggerType === "weekly") {
    payload.weeklyDay = values.weeklyDay;
  }
  if (values.triggerType === "interval") {
    payload.intervalValue = values.intervalValue;
    payload.intervalUnit = values.intervalUnit;
  }
  if (values.triggerType === "once" && values.onceAt) {
    payload.onceAt = new Date(values.onceAt).toISOString();
  }
  return payload;
}

export function automationRecordToEditorValues(
  record: {
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
  },
): AutomationEditorValues {
  const base = defaultAutomationEditorValues();
  let onceAt = "";
  if (record.onceAt) {
    const date = new Date(record.onceAt);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    onceAt = local.toISOString().slice(0, 16);
  }
  return {
    ...base,
    title: record.title,
    description: record.description,
    triggerType: (TRIGGER_OPTIONS.includes(record.triggerType as TriggerOption)
      ? record.triggerType
      : "daily") as TriggerOption,
    timezone: record.timezone,
    paused: record.paused,
    timeOfDay: record.timeOfDay ?? base.timeOfDay,
    weeklyDay: record.weeklyDay ?? base.weeklyDay,
    intervalValue: record.intervalValue ?? base.intervalValue,
    intervalUnit:
      record.intervalUnit === "hours" ? "hours" : base.intervalUnit,
    onceAt,
  };
}

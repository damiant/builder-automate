import { z } from "zod";

export const automationTriggerTypes = [
  "once",
  "interval",
  "hourly",
  "daily",
  "weekdays",
  "weekly",
] as const;

export type AutomationTriggerType = (typeof automationTriggerTypes)[number];

const timeOfDaySchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "Time must be HH:MM (24-hour)");

const intervalUnitSchema = z.enum(["minutes", "hours"]);

export const automationScheduleSchema = z
  .object({
    triggerType: z.enum(automationTriggerTypes),
    timezone: z.string().min(1),
    timeOfDay: timeOfDaySchema.optional(),
    weeklyDay: z.number().int().min(0).max(6).optional(),
    intervalValue: z.number().int().positive().optional(),
    intervalUnit: intervalUnitSchema.optional(),
    onceAt: z.string().datetime().optional(),
  })
  .superRefine((value, ctx) => {
    switch (value.triggerType) {
      case "once":
        if (!value.onceAt) {
          ctx.addIssue({
            code: "custom",
            message: "Once triggers require a date and time.",
            path: ["onceAt"],
          });
        }
        break;
      case "interval":
        if (!value.intervalValue || !value.intervalUnit) {
          ctx.addIssue({
            code: "custom",
            message: "Interval triggers require a value and unit.",
            path: ["intervalValue"],
          });
        } else if (
          value.intervalUnit === "minutes" &&
          value.intervalValue < 5
        ) {
          ctx.addIssue({
            code: "custom",
            message: "Minimum interval is 5 minutes.",
            path: ["intervalValue"],
          });
        }
        break;
      case "weekly":
        if (value.weeklyDay === undefined) {
          ctx.addIssue({
            code: "custom",
            message: "Weekly triggers require a weekday.",
            path: ["weeklyDay"],
          });
        }
        if (!value.timeOfDay) {
          ctx.addIssue({
            code: "custom",
            message: "Weekly triggers require a time.",
            path: ["timeOfDay"],
          });
        }
        break;
      case "hourly":
      case "daily":
      case "weekdays":
        if (!value.timeOfDay) {
          ctx.addIssue({
            code: "custom",
            message: "This trigger requires a time.",
            path: ["timeOfDay"],
          });
        }
        break;
      default:
        break;
    }
  });

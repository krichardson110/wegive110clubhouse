import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Repeat } from "lucide-react";

export type RecurrencePattern = "none" | "weekly" | "biweekly" | "monthly";

export interface RecurrenceConfig {
  pattern: RecurrencePattern;
  endDate: string;
}

interface RecurrencePickerProps {
  value: RecurrenceConfig;
  onChange: (config: RecurrenceConfig) => void;
  minDate?: string;
}

const recurrenceLabels: Record<RecurrencePattern, string> = {
  none: "Does not repeat",
  weekly: "Weekly",
  biweekly: "Every 2 weeks",
  monthly: "Monthly",
};

/**
 * Generates an array of dates based on a recurrence pattern.
 * The first date in the array is always the startDate itself.
 */
export function generateRecurringDates(
  startDate: string,
  pattern: RecurrencePattern,
  endDate: string
): string[] {
  if (pattern === "none") return [startDate];

  const dates: string[] = [];
  const start = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");

  if (end < start) return [startDate];

  let current = new Date(start);

  while (current <= end) {
    dates.push(current.toISOString().split("T")[0]);

    switch (pattern) {
      case "weekly":
        current.setDate(current.getDate() + 7);
        break;
      case "biweekly":
        current.setDate(current.getDate() + 14);
        break;
      case "monthly":
        current.setMonth(current.getMonth() + 1);
        break;
    }
  }

  return dates;
}

const RecurrencePicker = ({ value, onChange, minDate }: RecurrencePickerProps) => {
  // Default end date to 3 months from today if not set
  const defaultEndDate = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split("T")[0];
  })();

  const previewCount =
    value.pattern !== "none"
      ? generateRecurringDates(minDate || new Date().toISOString().split("T")[0], value.pattern, value.endDate || defaultEndDate).length
      : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Repeat className="w-4 h-4 text-muted-foreground" />
        <Label>Repeat</Label>
      </div>

      <Select
        value={value.pattern}
        onValueChange={(v) =>
          onChange({
            ...value,
            pattern: v as RecurrencePattern,
            endDate: value.endDate || defaultEndDate,
          })
        }
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(recurrenceLabels) as RecurrencePattern[]).map((p) => (
            <SelectItem key={p} value={p}>
              {recurrenceLabels[p]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {value.pattern !== "none" && (
        <div className="space-y-2">
          <Label htmlFor="recurrence_end">Repeat until</Label>
          <Input
            id="recurrence_end"
            type="date"
            value={value.endDate || defaultEndDate}
            min={minDate}
            onChange={(e) => onChange({ ...value, endDate: e.target.value })}
          />
          {previewCount > 1 && (
            <p className="text-xs text-muted-foreground">
              This will create <span className="font-medium text-foreground">{previewCount}</span> occurrences
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default RecurrencePicker;

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Sparkles } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { DateRange } from "react-day-picker";
import { Badge } from "@/components/ui/badge";

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
}

const presets = [
  { label: "Today", getValue: () => ({ from: new Date(), to: new Date() }) },
  { label: "Last 7 Days", getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: "Last 30 Days", getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: "Last 90 Days", getValue: () => ({ from: subDays(new Date(), 90), to: new Date() }) },
  { label: "This Month", getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
  { label: "Last Month", getValue: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
];

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [date, setDate] = useState<DateRange | undefined>(value);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const handlePresetClick = (preset: typeof presets[0]) => {
    const range = preset.getValue();
    setDate(range);
    setSelectedPreset(preset.label);
    onChange?.(range);
  };

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate);
    setSelectedPreset(null);
    onChange?.(newDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="glass-panel gold-border hover-elevate-2 justify-start text-left font-normal group"
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
          {date?.from ? (
            date.to ? (
              <span className="luxury-text">
                {format(date.from, "MMM dd, yyyy")} - {format(date.to, "MMM dd, yyyy")}
              </span>
            ) : (
              <span className="luxury-text">{format(date.from, "MMM dd, yyyy")}</span>
            )
          ) : (
            <span className="text-sf-text-muted">Pick a date range</span>
          )}
          {selectedPreset && (
            <Badge className="ml-2 luxury-badge text-xs">
              {selectedPreset}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="glass-card gold-glow border-primary/30 w-auto p-0" align="start">
        <div className="flex">
          {/* Presets sidebar */}
          <div className="glass-panel gold-border border-r p-3 space-y-1">
            <div className="flex items-center gap-2 px-2 py-1.5 mb-2">
              <Sparkles className="h-4 w-4 text-primary gold-pulse" />
              <span className="text-sm font-semibold luxury-text">Quick Select</span>
            </div>
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                onClick={() => handlePresetClick(preset)}
                className={`w-full justify-start hover-elevate-2 ${
                  selectedPreset === preset.label
                    ? "bg-primary/10 text-primary gold-border"
                    : "text-sf-text-secondary"
                }`}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          {/* Calendar */}
          <div className="p-3">
            <Calendar
              mode="range"
              selected={date}
              onSelect={handleDateChange}
              numberOfMonths={2}
              className="luxury-calendar"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

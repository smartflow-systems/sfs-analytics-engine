import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useEffect } from "react";

type DateRange = "today" | "7d" | "30d" | "90d";

const dateRanges: { value: DateRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange>(value || "7d");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (value && value !== selectedRange) {
      setSelectedRange(value);
    }
  }, [value]);

  const handleSelect = (range: DateRange) => {
    setSelectedRange(range);
    setOpen(false);
    onChange?.(range);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" data-testid="button-date-range">
          <Calendar className="h-4 w-4 mr-2" />
          {dateRanges.find((r) => r.value === selectedRange)?.label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2">
        <div className="flex flex-col gap-1">
          {dateRanges.map((range) => (
            <Button
              key={range.value}
              variant={selectedRange === range.value ? "secondary" : "ghost"}
              className="justify-start"
              onClick={() => handleSelect(range.value)}
              data-testid={`button-date-${range.value}`}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export type { DateRange };

import { createContext, useContext, useState, type ReactNode } from "react";
import type { DateRange } from "@/components/DateRangePicker";

interface DateContextType {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

export function DateProvider({ children }: { children: ReactNode }) {
  const [dateRange, setDateRange] = useState<DateRange>("7d");

  return (
    <DateContext.Provider value={{ dateRange, setDateRange }}>
      {children}
    </DateContext.Provider>
  );
}

export function useDateRange() {
  const context = useContext(DateContext);
  if (!context) {
    throw new Error("useDateRange must be used within a DateProvider");
  }
  return context;
}

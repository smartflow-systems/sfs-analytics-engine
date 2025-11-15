import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X, Sparkles, TrendingUp, Users, Activity } from "lucide-react";
import { useState } from "react";

interface FilterOption {
  id: string;
  label: string;
  icon: any;
  color: string;
}

const filterOptions: FilterOption[] = [
  { id: "high-value", label: "High Value Events", icon: TrendingUp, color: "text-primary" },
  { id: "new-users", label: "New Users", icon: Users, color: "text-primary" },
  { id: "active-today", label: "Active Today", icon: Activity, color: "text-primary" },
  { id: "conversions", label: "Conversions", icon: Sparkles, color: "text-primary" },
];

export function QuickFilters() {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const toggleFilter = (filterId: string) => {
    setActiveFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : [...prev, filterId]
    );
  };

  const clearFilters = () => setActiveFilters([]);

  return (
    <Card className="glass-card gold-glow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary gold-pulse" />
          <CardTitle className="text-lg luxury-text">Quick Filters</CardTitle>
        </div>
        {activeFilters.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="hover-elevate-2 text-sf-text-muted hover:text-primary"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {filterOptions.map((filter) => {
            const isActive = activeFilters.includes(filter.id);
            const Icon = filter.icon;

            return (
              <Button
                key={filter.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFilter(filter.id)}
                className={`justify-start gap-2 transition-all ${
                  isActive
                    ? "glass-card gold-glow gold-border bg-primary/10 text-primary hover:bg-primary/20"
                    : "glass-panel gold-border hover-elevate-2"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "gold-pulse" : ""}`} />
                <span className={isActive ? "font-semibold" : ""}>
                  {filter.label}
                </span>
              </Button>
            );
          })}
        </div>

        {activeFilters.length > 0 && (
          <div className="glass-panel gold-border rounded-lg p-3 mt-3">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-sf-text-muted">Active:</span>
              {activeFilters.map((filterId) => {
                const filter = filterOptions.find((f) => f.id === filterId);
                if (!filter) return null;

                return (
                  <Badge
                    key={filterId}
                    className="luxury-badge cursor-pointer hover:opacity-80"
                    onClick={() => toggleFilter(filterId)}
                  >
                    {filter.label}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

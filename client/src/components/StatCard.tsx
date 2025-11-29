import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  isLoading?: boolean;
}

export function StatCard({ title, value, change, icon: Icon, isLoading }: StatCardProps) {
  const trend = change !== undefined ? (change > 0 ? "up" : change < 0 ? "down" : "neutral") : undefined;

  if (isLoading) {
    return (
      <Card data-testid={`card-stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid={`card-stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold" data-testid={`text-stat-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {change !== undefined && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            {trend === "up" ? (
              <TrendingUp className="h-3 w-3 text-chart-2" />
            ) : trend === "down" ? (
              <TrendingDown className="h-3 w-3 text-destructive" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
            <span className={trend === "up" ? "text-chart-2" : trend === "down" ? "text-destructive" : ""}>
              {change > 0 ? "+" : ""}{change}%
            </span>
            <span>from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

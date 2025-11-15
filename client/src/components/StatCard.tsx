import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  trend?: "up" | "down";
  subtitle?: string;
}

export function StatCard({ title, value, change, icon: Icon, trend, subtitle }: StatCardProps) {
  return (
    <Card
      data-testid={`card-stat-${title.toLowerCase().replace(/\s+/g, '-')}`}
      className="rounded-xl border bg-card border-card-border shadow-sm hover-elevate"
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 p-6 pb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="text-2xl font-bold" data-testid={`text-stat-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {change !== undefined && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            {trend === "up" ? (
              <TrendingUp className="h-3 w-3 text-chart-2" />
            ) : (
              <TrendingDown className="h-3 w-3 text-destructive" />
            )}
            <span className={trend === "up" ? "text-chart-2" : "text-destructive"}>
              {Math.abs(change)}%
            </span>
            <span>from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

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
      className="glass-card rounded-xl gold-glow hover-elevate group transition-all duration-300"
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 p-6 pb-2">
        <p className="text-sm font-medium text-sf-text-secondary">{title}</p>
        <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center gold-border group-hover:bg-primary/20 transition-colors">
          <Icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="text-2xl font-bold luxury-text" data-testid={`text-stat-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>{value}</div>
        {subtitle && (
          <p className="text-xs text-sf-text-muted mt-1">{subtitle}</p>
        )}
        {change !== undefined && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            {trend === "up" ? (
              <TrendingUp className="h-3 w-3 text-primary" />
            ) : (
              <TrendingDown className="h-3 w-3 text-destructive" />
            )}
            <span className={trend === "up" ? "text-primary font-semibold" : "text-destructive"}>
              {Math.abs(change)}%
            </span>
            <span>from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

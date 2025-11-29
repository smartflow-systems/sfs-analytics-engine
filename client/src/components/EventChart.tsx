import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { useDateRange } from "@/lib/dateContext";
import { format } from "date-fns";

interface VolumeData {
  date: string;
  events: number;
}

export function EventChart() {
  const { dateRange } = useDateRange();

  const { data, isLoading } = useQuery<VolumeData[]>({
    queryKey: ["/api/analytics/volume", dateRange],
  });

  const formattedData = data?.map(item => ({
    date: format(new Date(item.date), "MMM d"),
    events: item.events,
  })) || [];

  return (
    <Card data-testid="card-event-chart">
      <CardHeader>
        <CardTitle>Event Volume</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : formattedData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No event data available. Send some events to see the chart.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={formattedData}>
              <defs>
                <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--popover-border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Area
                type="monotone"
                dataKey="events"
                stroke="hsl(var(--chart-1))"
                fillOpacity={1}
                fill="url(#colorEvents)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

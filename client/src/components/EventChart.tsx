import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// todo: remove mock functionality
const mockData = [
  { date: "Nov 7", events: 2400 },
  { date: "Nov 8", events: 3200 },
  { date: "Nov 9", events: 2800 },
  { date: "Nov 10", events: 3900 },
  { date: "Nov 11", events: 3400 },
  { date: "Nov 12", events: 4200 },
  { date: "Nov 13", events: 3800 },
  { date: "Nov 14", events: 4600 },
];

export function EventChart() {
  return (
    <Card data-testid="card-event-chart">
      <CardHeader>
        <CardTitle>Event Volume</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={mockData}>
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
      </CardContent>
    </Card>
  );
}

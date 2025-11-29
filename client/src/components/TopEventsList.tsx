import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useDateRange } from "@/lib/dateContext";

interface TopEvent {
  eventName: string;
  count: number;
  change: number;
}

export function TopEventsList() {
  const { dateRange } = useDateRange();

  const { data, isLoading } = useQuery<TopEvent[]>({
    queryKey: ["/api/analytics/top-events", dateRange],
  });

  return (
    <Card data-testid="card-top-events">
      <CardHeader>
        <CardTitle>Top Events</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-5 w-12" />
              </div>
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-8">
            No events tracked yet.
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((event, index) => (
              <div
                key={event.eventName}
                className="flex items-center justify-between"
                data-testid={`row-event-${index}`}
              >
                <div className="flex-1">
                  <p className="font-mono text-sm font-medium" data-testid={`text-event-name-${index}`}>
                    {event.eventName}
                  </p>
                  <p className="text-xs text-muted-foreground" data-testid={`text-event-count-${index}`}>
                    {event.count.toLocaleString()} events
                  </p>
                </div>
                <Badge
                  variant={event.change >= 0 ? "secondary" : "outline"}
                  className="ml-2"
                  data-testid={`badge-event-change-${index}`}
                >
                  {event.change >= 0 ? "+" : ""}
                  {event.change}%
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

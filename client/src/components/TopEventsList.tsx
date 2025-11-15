import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface TopEventsListProps {
  topEvents: { event: string; count: number }[];
  isLoading?: boolean;
}

export function TopEventsList({ topEvents, isLoading }: TopEventsListProps) {
  return (
    <Card data-testid="card-top-events" className="glass-card rounded-xl gold-glow">
      <CardHeader className="p-6">
        <CardTitle className="text-lg font-semibold luxury-text">Top Events</CardTitle>
        <CardDescription className="text-sm text-sf-text-secondary">
          Most frequently tracked events
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
        ) : topEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No events tracked yet</p>
            <p className="text-xs mt-1">Start tracking events to see them here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {topEvents.map((event, index) => (
              <div
                key={event.event}
                className="flex items-center justify-between hover-elevate-2 rounded-md p-3 -mx-2 gold-border group transition-all"
                data-testid={`row-event-${index}`}
              >
                <div className="flex-1">
                  <p className="font-mono text-sm font-medium luxury-text group-hover:text-primary transition-colors" data-testid={`text-event-name-${index}`}>
                    {event.event}
                  </p>
                  <p className="text-xs text-sf-text-muted" data-testid={`text-event-count-${index}`}>
                    {event.count.toLocaleString()} events
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="ml-2 luxury-badge"
                  data-testid={`badge-event-count-${index}`}
                >
                  {event.count}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

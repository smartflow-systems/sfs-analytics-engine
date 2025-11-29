import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

interface Event {
  id: string;
  eventName: string;
  userId: string;
  timestamp: string;
  properties: Record<string, unknown>;
}

export function RecentEventsTable() {
  const { data, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const events = data?.slice(0, 10) || [];

  return (
    <Card data-testid="card-recent-events">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-8">
            No events recorded yet. Start tracking events using the API.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event ID</TableHead>
                <TableHead>Event Name</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Properties</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event, index) => (
                <TableRow key={event.id} data-testid={`row-recent-event-${index}`}>
                  <TableCell className="font-mono text-xs" data-testid={`text-event-id-${index}`}>
                    {event.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" data-testid={`badge-event-name-${index}`}>
                      {event.eventName}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm" data-testid={`text-user-id-${index}`}>
                    {event.userId}
                  </TableCell>
                  <TableCell className="text-muted-foreground" data-testid={`text-properties-${index}`}>
                    {Object.keys(event.properties || {}).length} properties
                  </TableCell>
                  <TableCell className="text-muted-foreground" data-testid={`text-timestamp-${index}`}>
                    {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

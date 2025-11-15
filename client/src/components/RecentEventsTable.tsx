import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Download, FileJson, FileSpreadsheet } from "lucide-react";
import { exportEventsAsCSV, exportEventsAsJSON, getTimestampedFilename } from "@/lib/export";

interface Event {
  id: string;
  event: string;
  userId: string;
  timestamp: string;
  properties?: Record<string, any>;
}

export function RecentEventsTable() {
  const { data, isLoading } = useQuery<{ events: Event[] }>({
    queryKey: ["/api/analytics/events"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const events = data?.events.slice(0, 10) || [];

  const handleExport = (format: 'csv' | 'json') => {
    if (!events || events.length === 0) return;

    const filename = getTimestampedFilename('events', format);

    if (format === 'csv') {
      exportEventsAsCSV(events, filename);
    } else {
      exportEventsAsJSON(events, filename);
    }
  };

  return (
    <Card data-testid="card-recent-events" className="rounded-xl border bg-card border-card-border shadow-sm">
      <CardHeader className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Latest events tracked in real-time
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('csv')} className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('json')} className="gap-2">
                <FileJson className="h-4 w-4" />
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-10 flex-1" />
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No events tracked yet</p>
            <p className="text-xs mt-1">Events will appear here as they're tracked</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">Event Name</TableHead>
                  <TableHead className="font-semibold">User ID</TableHead>
                  <TableHead className="font-semibold">Properties</TableHead>
                  <TableHead className="font-semibold text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event, index) => (
                  <TableRow
                    key={event.id}
                    data-testid={`row-recent-event-${index}`}
                    className="hover-elevate"
                  >
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="font-mono text-xs bg-primary/10 text-primary hover:bg-primary/20"
                        data-testid={`badge-event-name-${index}`}
                      >
                        {event.event}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm" data-testid={`text-user-id-${index}`}>
                      {event.userId || "Anonymous"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs" data-testid={`text-properties-${index}`}>
                      {event.properties ? Object.keys(event.properties).length + " properties" : "No properties"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs text-right" data-testid={`text-timestamp-${index}`}>
                      {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

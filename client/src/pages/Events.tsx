import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Download, FileJson, FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface EventType {
  name: string;
  count: number;
  users: number;
  avgProps: number;
}

interface Event {
  id: string;
  eventName: string;
  userId: string;
  timestamp: string;
  properties: Record<string, unknown>;
}

export default function Events() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { currentWorkspace, token } = useAuth();
  const { toast } = useToast();

  const { data: eventTypes, isLoading: typesLoading } = useQuery<EventType[]>({
    queryKey: ['event-types', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace) return [];
      const response = await fetch(`/api/workspaces/${currentWorkspace.id}/analytics/event-types`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch event types');
      return response.json();
    },
    enabled: !!currentWorkspace && !!token,
  });

  const { data: eventDetails, isLoading: detailsLoading } = useQuery<Event[]>({
    queryKey: ['events', currentWorkspace?.id, selectedEvent],
    queryFn: async () => {
      if (!currentWorkspace || !selectedEvent) return [];
      const response = await fetch(
        `/api/workspaces/${currentWorkspace.id}/events?eventName=${encodeURIComponent(selectedEvent)}&limit=1000`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    },
    enabled: !!currentWorkspace && !!selectedEvent && !!token,
  });

  const filteredEvents = eventTypes?.filter((event) =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleViewDetails = (eventName: string) => {
    setSelectedEvent(eventName);
    setDialogOpen(true);
  };

  const selectedEventDetails = eventDetails?.filter(e => e.eventName === selectedEvent) || [];

  const exportToCSV = async () => {
    if (!currentWorkspace || !token) return;

    setIsExporting(true);
    try {
      const response = await fetch(
        `/api/workspaces/${currentWorkspace.id}/events?limit=10000`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error('Failed to fetch events');

      const events: Event[] = await response.json();

      // Convert to CSV
      const headers = ['Event ID', 'Event Name', 'User ID', 'Timestamp', 'Properties'];
      const rows = events.map(event => [
        event.id,
        event.eventName,
        event.userId || '',
        new Date(event.timestamp).toISOString(),
        JSON.stringify(event.properties),
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `events-${currentWorkspace.slug}-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      toast({
        title: 'Export Successful',
        description: `Exported ${events.length} events to CSV`,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export events',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToJSON = async () => {
    if (!currentWorkspace || !token) return;

    setIsExporting(true);
    try {
      const response = await fetch(
        `/api/workspaces/${currentWorkspace.id}/events?limit=10000`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error('Failed to fetch events');

      const events: Event[] = await response.json();

      // Download JSON
      const jsonContent = JSON.stringify(events, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `events-${currentWorkspace.slug}-${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      toast({
        title: 'Export Successful',
        description: `Exported ${events.length} events to JSON`,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export events',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" data-testid="text-page-title">Events</h1>
        <p className="text-sm text-muted-foreground">
          Explore and analyze all tracked events
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle>Event Types</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  className="pl-9 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-events"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={isExporting || !eventTypes || eventTypes.length === 0}>
                    <Download className="mr-2 h-4 w-4" />
                    {isExporting ? 'Exporting...' : 'Export'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={exportToCSV}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToJSON}>
                    <FileJson className="mr-2 h-4 w-4" />
                    Export as JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {typesLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              {searchQuery ? "No events match your search." : "No events tracked yet. Send events using the API."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Total Count</TableHead>
                  <TableHead>Unique Users</TableHead>
                  <TableHead>Avg Properties</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event, index) => (
                  <TableRow key={event.name} data-testid={`row-event-type-${index}`}>
                    <TableCell>
                      <Badge variant="secondary" data-testid={`badge-event-name-${index}`}>
                        {event.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold" data-testid={`text-count-${index}`}>
                      {event.count.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground" data-testid={`text-users-${index}`}>
                      {event.users.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground" data-testid={`text-avg-props-${index}`}>
                      {event.avgProps}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewDetails(event.name)}
                        data-testid={`button-view-${index}`}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Event: <Badge variant="secondary" className="ml-2">{selectedEvent}</Badge>
            </DialogTitle>
          </DialogHeader>
          {detailsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : selectedEventDetails.length === 0 ? (
            <p className="text-muted-foreground">No events found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event ID</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Properties</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedEventDetails.slice(0, 20).map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-mono text-xs">{event.id.slice(0, 8)}...</TableCell>
                    <TableCell className="font-mono text-sm">{event.userId}</TableCell>
                    <TableCell className="text-xs max-w-xs truncate">
                      {JSON.stringify(event.properties)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(event.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

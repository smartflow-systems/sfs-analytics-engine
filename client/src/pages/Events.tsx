import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Filter } from "lucide-react";
import { useState } from "react";

// todo: remove mock functionality
const mockEventTypes = [
  { name: "page_view", count: 45230, users: 3421, avgProps: 3 },
  { name: "button_click", count: 28940, users: 2890, avgProps: 5 },
  { name: "form_submit", count: 15680, users: 1840, avgProps: 8 },
  { name: "video_play", count: 12450, users: 1560, avgProps: 4 },
  { name: "search", count: 9870, users: 1230, avgProps: 6 },
  { name: "add_to_cart", count: 7650, users: 980, avgProps: 7 },
  { name: "checkout", count: 4320, users: 560, avgProps: 10 },
];

export default function Events() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEvents = mockEventTypes.filter((event) =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <div className="flex flex-wrap items-center gap-2">
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
              <Button variant="outline" data-testid="button-filter">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
                    <Button variant="ghost" size="sm" data-testid={`button-view-${index}`}>
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

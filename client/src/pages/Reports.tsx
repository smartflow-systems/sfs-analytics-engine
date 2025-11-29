import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Download, Plus, Clock, Trash2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

interface Report {
  id: string;
  name: string;
  description: string | null;
  type: string;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export default function Reports() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("on-demand");
  const { toast } = useToast();

  const { data: reports, isLoading } = useQuery<Report[]>({
    queryKey: ["/api/reports"],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/reports", {
        name,
        description,
        type,
        config: {},
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Report Created",
        description: "Your new report has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      setDialogOpen(false);
      setName("");
      setDescription("");
      setType("on-demand");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create report",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/reports/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Report Deleted",
        description: "The report has been deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete report",
        variant: "destructive",
      });
    },
  });

  const handleExport = (report: Report) => {
    const exportData = {
      report: {
        id: report.id,
        name: report.name,
        description: report.description,
        type: report.type,
        config: report.config,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
      },
      exportedAt: new Date().toISOString(),
    };
    
    const data = JSON.stringify(exportData, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.name.toLowerCase().replace(/\s+/g, "-")}-report.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: `Report "${report.name}" has been exported as JSON.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage custom analytics reports
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-report">
              <Plus className="h-4 w-4 mr-2" />
              New Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="report-name">Report Name</Label>
                <Input
                  id="report-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter report name"
                  data-testid="input-report-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="report-description">Description</Label>
                <Textarea
                  id="report-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this report"
                  data-testid="input-report-description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="report-type">Report Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger data-testid="select-report-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on-demand">On-demand</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={() => createMutation.mutate()}
                disabled={!name || createMutation.isPending}
                className="w-full"
                data-testid="button-create-report"
              >
                {createMutation.isPending ? "Creating..." : "Create Report"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-32 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-24 mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !reports || reports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No reports created yet. Click "New Report" to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Card
              key={report.id}
              className="hover-elevate active-elevate-2"
              data-testid={`card-report-${report.id}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <Badge variant="outline" data-testid={`badge-report-type-${report.id}`}>
                    {report.type}
                  </Badge>
                </div>
                <CardTitle className="text-base mt-2" data-testid={`text-report-name-${report.id}`}>
                  {report.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground" data-testid={`text-report-desc-${report.id}`}>
                  {report.description || "No description provided"}
                </p>
                <div className="flex items-center gap-1 mt-4 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span data-testid={`text-report-updated-${report.id}`}>
                    Updated {formatDistanceToNow(new Date(report.updatedAt), { addSuffix: true })}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1" 
                  onClick={() => handleExport(report)}
                  data-testid={`button-export-report-${report.id}`}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => deleteMutation.mutate(report.id)}
                  disabled={deleteMutation.isPending}
                  data-testid={`button-delete-report-${report.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

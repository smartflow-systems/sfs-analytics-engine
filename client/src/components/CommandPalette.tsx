import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  BarChart3,
  Calendar,
  Settings,
  Activity,
  Filter,
  Download,
  Moon,
  Sun,
  Home,
  Database,
} from "lucide-react";
import { useTheme } from "next-themes";

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: any;
  action: () => void;
  keywords?: string[];
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { setTheme, theme } = useTheme();

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const commands: Command[] = [
    // Navigation
    {
      id: "nav-dashboard",
      label: "Dashboard",
      description: "View analytics overview",
      icon: Home,
      action: () => {
        setLocation("/");
        setOpen(false);
      },
      keywords: ["home", "overview"],
    },
    {
      id: "nav-events",
      label: "Events",
      description: "Browse all tracked events",
      icon: Activity,
      action: () => {
        setLocation("/events");
        setOpen(false);
      },
      keywords: ["tracking", "data"],
    },
    {
      id: "nav-reports",
      label: "Reports",
      description: "View detailed reports",
      icon: BarChart3,
      action: () => {
        setLocation("/reports");
        setOpen(false);
      },
      keywords: ["analytics", "charts"],
    },
    {
      id: "nav-settings",
      label: "Settings",
      description: "Configure your workspace",
      icon: Settings,
      action: () => {
        setLocation("/settings");
        setOpen(false);
      },
      keywords: ["config", "preferences"],
    },

    // Actions
    {
      id: "action-seed",
      label: "Seed Demo Data",
      description: "Generate 1000 demo events",
      icon: Database,
      action: async () => {
        setOpen(false);
        try {
          const response = await fetch("/api/seed/demo-data", { method: "POST" });
          const data = await response.json();
          console.log("Demo data seeded:", data);
          // Optionally show a toast notification
        } catch (error) {
          console.error("Failed to seed demo data:", error);
        }
      },
      keywords: ["test", "sample", "mock"],
    },
    {
      id: "action-export",
      label: "Export Data",
      description: "Download events as CSV",
      icon: Download,
      action: () => {
        setOpen(false);
        // TODO: Implement export
        console.log("Export data");
      },
      keywords: ["download", "csv", "json"],
    },
    {
      id: "action-filter",
      label: "Filter Events",
      description: "Apply custom filters",
      icon: Filter,
      action: () => {
        setOpen(false);
        // TODO: Open filter dialog
        console.log("Open filters");
      },
      keywords: ["search", "query"],
    },
    {
      id: "action-date",
      label: "Change Date Range",
      description: "Select a different time period",
      icon: Calendar,
      action: () => {
        setOpen(false);
        // TODO: Open date picker
        console.log("Open date picker");
      },
      keywords: ["time", "period", "range"],
    },

    // Theme
    {
      id: "theme-light",
      label: "Light Mode",
      description: "Switch to light theme",
      icon: Sun,
      action: () => {
        setTheme("light");
        setOpen(false);
      },
      keywords: ["theme", "appearance"],
    },
    {
      id: "theme-dark",
      label: "Dark Mode",
      description: "Switch to dark theme",
      icon: Moon,
      action: () => {
        setTheme("dark");
        setOpen(false);
      },
      keywords: ["theme", "appearance"],
    },
  ];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          {commands
            .filter((cmd) => cmd.id.startsWith("nav-"))
            .map((cmd) => (
              <CommandItem key={cmd.id} onSelect={cmd.action}>
                <cmd.icon className="mr-2 h-4 w-4" />
                <div className="flex-1">
                  <div className="font-medium">{cmd.label}</div>
                  {cmd.description && (
                    <div className="text-xs text-muted-foreground">
                      {cmd.description}
                    </div>
                  )}
                </div>
              </CommandItem>
            ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          {commands
            .filter((cmd) => cmd.id.startsWith("action-"))
            .map((cmd) => (
              <CommandItem key={cmd.id} onSelect={cmd.action}>
                <cmd.icon className="mr-2 h-4 w-4" />
                <div className="flex-1">
                  <div className="font-medium">{cmd.label}</div>
                  {cmd.description && (
                    <div className="text-xs text-muted-foreground">
                      {cmd.description}
                    </div>
                  )}
                </div>
              </CommandItem>
            ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Theme">
          {commands
            .filter((cmd) => cmd.id.startsWith("theme-"))
            .map((cmd) => (
              <CommandItem key={cmd.id} onSelect={cmd.action}>
                <cmd.icon className="mr-2 h-4 w-4" />
                <span>{cmd.label}</span>
              </CommandItem>
            ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

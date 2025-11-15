import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

export default function Settings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [dataRetention, setDataRetention] = useState(90);

  return (
    <div className="space-y-6">
      <div className="glass-card p-8 gold-glow">
        <h1 className="text-4xl luxury-heading mb-2" data-testid="text-page-title">Settings</h1>
        <p className="text-sm text-sf-text-secondary">
          Manage your account and application preferences
        </p>
      </div>

      <div className="space-y-6">
        <Card className="glass-card gold-glow">
          <CardHeader>
            <CardTitle className="luxury-text">API Configuration</CardTitle>
            <CardDescription className="text-sf-text-secondary">
              Configure your API keys and tracking settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="api-key"
                  type="password"
                  value="sk_test_4eC39HqLyjWDarjtT1zdp7dc"
                  readOnly
                  data-testid="input-api-key"
                />
                <Button variant="outline" data-testid="button-regenerate-key">
                  Regenerate
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-id">Project ID</Label>
              <Input
                id="project-id"
                value="proj_abc123xyz"
                readOnly
                data-testid="input-project-id"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card gold-glow">
          <CardHeader>
            <CardTitle className="luxury-text">Notifications</CardTitle>
            <CardDescription className="text-sf-text-secondary">
              Choose how you want to receive alerts and updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email alerts for important events
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
                data-testid="switch-email-notifications"
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekly-reports">Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">
                  Get a weekly summary of your analytics
                </p>
              </div>
              <Switch
                id="weekly-reports"
                defaultChecked
                data-testid="switch-weekly-reports"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card gold-glow">
          <CardHeader>
            <CardTitle className="luxury-text">Data Management</CardTitle>
            <CardDescription className="text-sf-text-secondary">
              Configure data retention and storage preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="data-retention">Data Retention (days)</Label>
              <Input
                id="data-retention"
                type="number"
                value={dataRetention}
                onChange={(e) => setDataRetention(Number(e.target.value))}
                data-testid="input-data-retention"
              />
              <p className="text-sm text-muted-foreground">
                Events older than this will be automatically deleted
              </p>
            </div>
            <Button variant="destructive" data-testid="button-delete-data">
              Delete All Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

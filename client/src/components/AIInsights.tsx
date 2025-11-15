import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface Insight {
  id: string;
  type: "success" | "warning" | "info" | "trend";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  metric?: string;
  icon: any;
}

const mockInsights: Insight[] = [
  {
    id: "1",
    type: "success",
    title: "Conversion Rate Improving",
    description: "Your checkout completion rate has increased by 23% over the last 7 days. This is driven by the new streamlined payment flow.",
    impact: "high",
    metric: "+23%",
    icon: TrendingUp,
  },
  {
    id: "2",
    type: "warning",
    title: "Cart Abandonment Spike",
    description: "Noticed a 15% increase in cart abandonment on mobile devices. Consider optimizing the mobile checkout experience.",
    impact: "high",
    metric: "+15%",
    icon: AlertTriangle,
  },
  {
    id: "3",
    type: "trend",
    title: "Weekend Traffic Pattern",
    description: "Traffic peaks on Saturdays at 2 PM. Consider scheduling promotions and campaigns around this time for maximum impact.",
    impact: "medium",
    metric: "2 PM SAT",
    icon: Zap,
  },
  {
    id: "4",
    type: "info",
    title: "New User Engagement",
    description: "First-time visitors who view the product demo are 3x more likely to convert. Feature the demo more prominently on landing pages.",
    impact: "high",
    metric: "3x",
    icon: Lightbulb,
  },
];

const impactColors = {
  high: "text-primary",
  medium: "text-chart-2",
  low: "text-sf-text-muted",
};

const typeColors = {
  success: "bg-primary/10 border-primary/30",
  warning: "bg-destructive/10 border-destructive/30",
  info: "bg-chart-2/10 border-chart-2/30",
  trend: "bg-primary/10 border-primary/30",
};

export function AIInsights() {
  return (
    <Card className="glass-card gold-glow">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center gold-border gold-glow">
            <Sparkles className="h-5 w-5 text-primary gold-pulse" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold luxury-text">
              AI-Powered Insights
            </CardTitle>
            <CardDescription className="text-sf-text-secondary">
              Smart recommendations to optimize your analytics
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockInsights.map((insight, index) => {
          const Icon = insight.icon;

          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`glass-panel gold-border rounded-lg p-4 hover-elevate-2 group cursor-pointer transition-all ${typeColors[insight.type]}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg ${typeColors[insight.type]} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-4 w-4 ${insight.type === 'warning' ? 'text-destructive' : 'text-primary'}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold luxury-text text-sm">{insight.title}</h4>
                    <Badge
                      variant="outline"
                      className={`text-xs luxury-badge ${impactColors[insight.impact]}`}
                    >
                      {insight.impact} impact
                    </Badge>
                  </div>
                  <p className="text-sm text-sf-text-secondary leading-relaxed">
                    {insight.description}
                  </p>
                </div>

                {insight.metric && (
                  <div className="glass-panel gold-border rounded-lg px-3 py-1.5 flex-shrink-0">
                    <p className={`text-lg font-bold luxury-heading ${
                      insight.type === 'warning' ? 'text-destructive' : ''
                    }`}>
                      {insight.metric}
                    </p>
                  </div>
                )}
              </div>

              {/* Animated shine on hover */}
              <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none overflow-hidden">
                <div className="absolute inset-0 shine" />
              </div>
            </motion.div>
          );
        })}

        {/* AI Status */}
        <div className="glass-panel gold-border rounded-lg p-3 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary gold-pulse" />
              <span className="text-xs text-sf-text-muted">AI Analysis Active</span>
            </div>
            <Badge className="luxury-badge text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              4 new insights
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  Zap,
  Shield,
  Code,
  TrendingUp,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Lock,
  Gauge,
} from 'lucide-react';

export default function Landing() {
  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Track millions of events with sub-second query times. Built on PostgreSQL with optimized indexes.',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Self-host on your infrastructure or use our cloud. Your data, your control. GDPR compliant.',
    },
    {
      icon: Code,
      title: 'Developer Friendly',
      description: 'Simple REST API, comprehensive docs, and SDKs for every platform. Start tracking in minutes.',
    },
    {
      icon: TrendingUp,
      title: 'Real-Time Insights',
      description: 'See what\'s happening right now. Live dashboards, custom reports, and automated alerts.',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Invite your team, set permissions, share dashboards. Everyone stays in sync.',
    },
    {
      icon: Gauge,
      title: 'No Event Overage Fees',
      description: 'Flat monthly pricing. No surprises. Track what matters without worrying about costs.',
    },
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: 0,
      period: 'forever',
      description: 'Perfect for side projects and testing',
      features: [
        '10,000 events/month',
        '30-day data retention',
        'Basic analytics',
        'API access',
        'Community support',
      ],
      cta: 'Start Free',
      popular: false,
    },
    {
      name: 'Pro',
      price: 49,
      period: 'month',
      description: 'For growing businesses',
      features: [
        '500,000 events/month',
        '90-day data retention',
        'Advanced analytics',
        'Custom funnels',
        'Email support',
        'Data export',
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Business',
      price: 199,
      period: 'month',
      description: 'For scaling companies',
      features: [
        '5M events/month',
        '1-year data retention',
        'Real-time dashboards',
        'Team collaboration',
        'Priority support',
        'Custom integrations',
      ],
      cta: 'Start Free Trial',
      popular: false,
    },
  ];

  const comparisonFeatures = [
    { feature: 'Mixpanel', price: '$89/mo + $0.0003/event', limit: '~300K events' },
    { feature: 'Amplitude', price: '$61/mo + overages', limit: '10M/year cap' },
    { feature: 'Segment', price: '$120/mo', limit: 'Limited sources' },
    { feature: 'SFS Analytics', price: '$49/mo flat', limit: '500K events' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center space-y-8">
            <Badge className="mx-auto" variant="secondary">
              <Sparkles className="mr-1 h-3 w-3" />
              Open Source Analytics Platform
            </Badge>

            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
              Analytics That Don't
              <br />
              <span className="text-primary">Break The Bank</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Track unlimited events, build custom dashboards, and understand your users.
              <br />
              <strong>10x cheaper than Mixpanel.</strong> Self-host or cloud. No event overages.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8">
                  Start Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Sign In
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                10,000 events free forever
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything You Need To Understand Your Users
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built for developers, designed for growth. All the features of enterprise analytics
            without the enterprise price tag.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardHeader>
                <feature.icon className="h-10 w-10 text-primary mb-4" />
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-muted/50 border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free, scale as you grow. No hidden fees, no event overages, no surprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="px-4 py-1">Most Popular</Badge>
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/register">
                    <Button
                      className="w-full"
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground">
              Need more? <strong>Enterprise plans</strong> start at $999/mo with unlimited events.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Save 10x vs Traditional Analytics
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stop paying per event. Get more features for less money.
          </p>
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardContent className="p-8">
            <div className="space-y-4">
              {comparisonFeatures.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    item.feature === 'SFS Analytics'
                      ? 'bg-primary/10 border-2 border-primary'
                      : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.feature === 'SFS Analytics' && (
                      <Badge variant="default">Us</Badge>
                    )}
                    <span className="font-semibold">{item.feature}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{item.price}</div>
                    <div className="text-sm text-muted-foreground">{item.limit}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-8">
          <h2 className="text-3xl sm:text-5xl font-bold">
            Start Tracking Events In Minutes
          </h2>

          <p className="text-xl opacity-90">
            Join hundreds of developers who switched from expensive analytics tools.
            <br />
            Start free, upgrade when you need more.
          </p>

          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>

          <div className="flex items-center justify-center gap-6 text-sm opacity-75">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              No credit card
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              10K free events
            </div>
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Open source
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xl font-bold">
                <BarChart3 className="h-6 w-6 text-primary" />
                SFS Analytics
              </div>
              <p className="text-sm text-muted-foreground">
                Open source analytics platform for modern apps.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
                <li><Link href="/login"><a className="hover:text-foreground">Sign In</a></Link></li>
                <li><Link href="/register"><a className="hover:text-foreground">Get Started</a></Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/docs" className="hover:text-foreground">Documentation</a></li>
                <li><a href="/docs/API.md" className="hover:text-foreground">API Reference</a></li>
                <li><a href="https://github.com/smartflow-systems/sfs-analytics-engine" className="hover:text-foreground">GitHub</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Smartflow Systems. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

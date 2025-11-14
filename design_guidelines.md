# Design Guidelines: Event Tracking & Analytics Platform

## Design Approach

**System-Based Approach**: Drawing from modern analytics platforms (Mixpanel, Amplitude, PostHog) combined with Material Design principles for data-heavy applications. Focus on clarity, scanability, and efficient information density.

## Typography System

**Font Stack**: Inter (via Google Fonts CDN) for exceptional readability at small sizes
- Display/Headers: 600 weight, sizes 24-32px
- Section Titles: 500 weight, 18-20px
- Body/Data: 400 weight, 14-16px
- Data Labels/Meta: 400 weight, 12-14px
- Monospace (metrics/IDs): JetBrains Mono 400, 13-14px

## Layout & Spacing

**Spacing System**: Tailwind units of 2, 4, 6, and 8 for consistent rhythm
- Component padding: p-4 to p-6
- Section gaps: gap-6 to gap-8
- Card spacing: p-6
- Tight data rows: py-2, px-4

**Grid Structure**:
- Dashboard: 12-column grid with 2-3-4 column metric cards
- Responsive breakpoints: Full-width mobile, 2-col tablet, 3-4 col desktop
- Max container width: max-w-7xl with px-6 page margins

## Core Components

### Navigation
- Persistent left sidebar (width: 240px on desktop, collapsible on mobile)
- Two-tier navigation: primary sections + sub-navigation tabs where needed
- Top bar: breadcrumbs, date range picker, user menu
- Icons: Heroicons (outline style via CDN)

### Dashboard Cards
- Stat cards: Prominent metric value (32-40px), label above, trend indicator, sparkline chart
- Cards use rounded corners (rounded-lg), subtle elevation via shadows
- Grid layout: grid-cols-1 md:grid-cols-2 lg:grid-cols-4

### Data Tables
- Sticky headers with sorting indicators
- Row hover states for interaction feedback
- Pagination controls at bottom-right
- Compact row height (h-12) for density
- Alternating row treatment for readability

### Charts & Visualizations
- Chart.js integration for line, bar, and donut charts
- Consistent height constraints: h-64 for dashboard cards, h-96 for full-width
- Legend positioning: top-right for multi-series
- Grid lines for reference, tooltips on hover

### Filtering & Controls
- Date range picker: prominent placement in top bar
- Filter pills: dismissible tags showing active filters
- Dropdown selectors: native styling with custom arrow icons
- Search input: with magnifying glass icon prefix

### Reporting Interface
- Left panel: filter controls (280px width)
- Main area: chart preview + data table
- Export actions: top-right of content area
- Template selector: card grid showing saved report templates

## Page Layouts

### Dashboard Home
- Top metrics row: 4 stat cards
- Main chart section: full-width time series (2/3 width) + top events list (1/3 width)
- Recent activity table: below charts, showing latest 50 events

### Event Details View
- Header: event name, total count, unique users
- Time series chart: full-width
- Properties breakdown: 2-column grid of property cards
- Event log table: filterable, searchable

### Reports Page
- Header with "New Report" CTA
- Saved reports: card grid (3 columns desktop)
- Each card: report name, preview chart, last updated, quick actions

## Animation Guidelines

Minimal, purposeful motion:
- Smooth transitions for navigation (duration-200)
- Chart data loading: subtle fade-in
- No scroll animations or parallax effects
- Focus on instant feedback for interactions

## Accessibility

- Consistent focus states across all interactive elements
- ARIA labels for data visualizations
- Keyboard navigation for all dashboard interactions
- Screen reader friendly table markup with proper headers

## Icons

**Library**: Heroicons (outline variant) via CDN
- Navigation: 20x20px
- Stat indicators: 16x16px  
- Table actions: 16x16px
- Trend arrows: use built-in chevron icons

## Critical Implementation Notes

- Prioritize data density over whitespace in tables and lists
- Maintain consistent card patterns across all dashboard views
- Use sticky positioning for headers during scroll
- Implement efficient data loading states (skeleton screens for charts)
- Date ranges default to "Last 7 days" with quick presets (Today, 7d, 30d, 90d)
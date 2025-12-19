# AGENTS: SFS Analytics Engine

**Project:** sfs-analytics-engine
**Purpose:** Event tracking and analytics platform for SmartFlow Systems ecosystem
**Stack:** Node.js 18+, Express, React 18, TypeScript, Vite, shadcn/ui, Tailwind CSS
**Theme:** SFS brown/black/gold with circuit flow background and glass-morphism cards

## Environment
- **Where:** Shell / Editor / Browser
- **Source of Truth:** GitHub (`smartflow-systems/sfs-analytics-engine`)
- **Deployment:** Replit (mirrors GitHub → push back)
- **Live URL:** https://sfs-analytics-engine--Smart-F-Syst.replit.app

## Secrets & Configuration
Set in GitHub: **Org → Settings → Secrets → Actions**
- `SFS_PAT` - Personal Access Token for SFS operations
- `REPLIT_TOKEN` - Replit deployment token
- `SFS_SYNC_URL` - Sync webhook URL
- `API_KEY` - API key for webhook authentication

## Health Check
```bash
GET /health → {"ok":true, "service":"sfs-analytics-engine", "version":"1.0.0", "timestamp":"..."}
GET /api/health → same response
```
CI/CD must be green ✅

## Development Commands
```bash
npm run dev          # Start dev server (port 5000)
npm run dev:5100     # Start on port 5100
npm run build        # Build for production
npm test             # Run tests
npm run sync         # Auto-sync with Git
```

## Agent Rules
1. **Always show file paths** in brackets: `[client/src/App.tsx]`
2. **VERIFY before destructive operations** - use UNDO if needed
3. **Bash scripts** must use `set -euo pipefail`
4. **Health check** must always return `{"ok":true}`
5. **SFS Theme** - maintain brown/black/gold color scheme
6. **Glass cards** - use `.sfs-glass-card` or `.sfs-flow-card` classes
7. **Circuit flow** - background animation via `#circuit-canvas`

## Key Files
- `[server/index.ts]` - Server entry point
- `[server/routes.ts]` - API routes and health checks
- `[server/storage.ts]` - In-memory data storage
- `[client/src/App.tsx]` - React app root
- `[client/src/index.css]` - SFS theme styles
- `[client/index.html]` - HTML with circuit canvas
- `[sfs-circuit-flow.js]` - Circuit flow animation
- `[sfs-complete-theme.css]` - Complete SFS theme file
- `[.github/workflows/ci.yml]` - CI/CD pipeline
- `[.github/workflows/sfs-ci-deploy.yml]` - SFS deployment workflow

## API Endpoints
- `GET /health` - Health check
- `POST /api/events` - Track event
- `GET /api/events` - Retrieve events (with filters)
- `GET /api/analytics/summary` - Analytics overview
- `GET /api/analytics/top-events` - Most frequent events
- `GET /api/analytics/trends` - Event trends over time
- `POST /api/webhook/event` - Bulk event tracking
- `GET /api/integrations/:service/analytics` - Service-specific analytics

## SFS Integration
This service integrates with:
- SmartFlowSite
- SocialScaleBooster
- SFSDataQueryEngine
- sfs-marketing-and-growth
- Other SFS ecosystem services

Track events from any SFS service using the webhook endpoint with proper authentication.

#!/bin/bash
set -euo pipefail

# ════════════════════════════════════════════════════════════════
# Setup Git Authentication for Replit
# ════════════════════════════════════════════════════════════════
# This script configures git to use GitHub authentication via PAT
# ════════════════════════════════════════════════════════════════

echo "════════════════════════════════════════════════════════════════"
echo "   Replit Git Authentication Setup"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Check if running on Replit
if [ -z "${REPL_ID:-}" ]; then
  echo "⚠️  WARNING: Not running on Replit"
  echo "This script is designed for Replit environments"
  echo ""
fi

# Check for existing git config
echo "Current git remote:"
git remote -v
echo ""

# Instructions for manual setup
echo "════════════════════════════════════════════════════════════════"
echo "   Setup Instructions:"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "1️⃣  Create GitHub Personal Access Token:"
echo "   → https://github.com/settings/tokens"
echo "   → Click 'Generate new token (classic)'"
echo "   → Name: 'Replit Git Push - sfs-analytics-engine'"
echo "   → Scopes: Check 'repo' (full control)"
echo "   → Generate and COPY the token"
echo ""
echo "2️⃣  Store in Replit Secrets:"
echo "   → Click the lock icon (🔒) in Replit sidebar"
echo "   → Click 'Create secret'"
echo "   → Key: SFS_PAT"
echo "   → Value: paste your token (starts with <GITHUB_PAT>)"
echo "   → Click 'Add secret'"
echo ""
echo "3️⃣  Configure Git Remote:"
echo ""

# Check if SFS_PAT exists
if [ -n "${SFS_PAT:-}" ]; then
  echo "✅ SFS_PAT found in environment"
  echo ""
  echo "Updating git remote to use authenticated URL..."

  # Update remote URL
  git remote set-url origin "https://boweazy:${SFS_PAT}@github.com/smartflow-systems/sfs-analytics-engine.git"

  echo "✅ Git remote updated!"
  echo ""
  echo "New remote URL:"
  git remote -v | sed "s/${SFS_PAT}/***HIDDEN***/g"
  echo ""
  echo "════════════════════════════════════════════════════════════════"
  echo "   ✅ Setup Complete!"
  echo "════════════════════════════════════════════════════════════════"
  echo ""
  echo "You can now push to GitHub:"
  echo "  git push origin main"
  echo ""
else
  echo "❌ SFS_PAT not found in Replit Secrets"
  echo ""
  echo "Please complete steps 1-2 above, then run this script again."
  echo ""
  echo "Quick test after adding secret:"
  echo "  source ~/.bashrc  # Reload environment"
  echo "  ./setup-replit-git.sh  # Run this script again"
  echo ""
fi

echo "════════════════════════════════════════════════════════════════"

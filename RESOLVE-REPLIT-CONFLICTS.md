# Resolve Replit Merge Conflicts

## Current Conflicts (from Replit UI)

You have merge conflicts in these files:

### Conflicting Files:
- `.env.example`
- `.replit`
- `README.md`
- `index.html` (likely `client/index.html`)
- `index.css` (likely `client/src/index.css`)
- `routes.ts` (likely `server/routes.ts`)
- `storage.ts` (likely `server/storage.ts`)
- `schema.ts` (likely `shared/schema.ts`)

## How to Resolve in Replit

### Option 1: Accept All Incoming Changes (Recommended)
If you trust the latest GitHub changes (which include the SFS theme we just added):

1. In Replit, click **"Resolve merge conflicts"**
2. For each file, click **"Accept incoming"** or **"Accept current"** based on:
   - **Accept incoming** = Use GitHub version (recommended for theme files)
   - **Accept current** = Use Replit version

For the SFS theme files, **accept incoming** for:
- `client/index.html` (has circuit canvas)
- `client/src/index.css` (has full SFS theme)
- `README.md` (has new badges)
- `.env.example` (if updated)

### Option 2: Resolve via Replit Shell

In Replit shell:

```bash
# See which files have conflicts
git status

# For each conflicting file, choose a strategy:

# Accept their changes (GitHub/incoming)
git checkout --theirs path/to/file

# Or accept our changes (Replit/current)
git checkout --ours path/to/file

# After resolving all conflicts:
git add .
git commit -m "fix: resolve merge conflicts"
git push origin main
```

### Option 3: Manual Resolution

For each file with `<<<<<<<` markers:

1. Open the file in Replit editor
2. Find the conflict markers:
   ```
   <<<<<<< HEAD
   (your local changes)
   =======
   (incoming changes from GitHub)
   >>>>>>> origin/main
   ```
3. Delete the markers and keep the version you want
4. Save the file
5. Stage it: `git add filename`
6. After all files: `git commit -m "fix: resolve conflicts"`

## Recommended Resolution Strategy

Since we just pushed SFS theme changes to GitHub, I recommend:

```bash
# In Replit shell:

# Accept GitHub version for theme files
git checkout --theirs client/index.html
git checkout --theirs client/src/index.css
git checkout --theirs README.md
git checkout --theirs AGENTS.md
git checkout --theirs tailwind.config.ts

# For other files, check and decide:
git diff HEAD origin/main -- .replit
git diff HEAD origin/main -- .env.example

# If .replit is fine on GitHub, accept it:
git checkout --theirs .replit

# Stage all resolved files
git add .

# Complete the merge
git commit -m "fix: resolve merge conflicts, accept SFS theme updates"

# Push to GitHub
git push origin main
```

## If .replit Parse Error Persists

The error says:
```
toml: line 10 (last key "ports"): expected '.' or '=', but got '<' instead
```

This means there's a merge conflict marker `<<<<<<<` in the `.replit` file.

**Fix:**
1. Open `.replit` in Replit editor
2. Look for lines with `<<<<<<<`, `=======`, or `>>>>>>>`
3. Remove ALL conflict markers
4. Keep only valid TOML syntax
5. Save and commit

## Quick Fix Script

Run this in Replit shell:

```bash
#!/bin/bash
# Quick conflict resolution - accept GitHub version for theme files

echo "Resolving conflicts with GitHub version..."

# Accept incoming (GitHub) for SFS theme files
git checkout --theirs client/index.html 2>/dev/null || echo "Skipping client/index.html"
git checkout --theirs client/src/index.css 2>/dev/null || echo "Skipping client/src/index.css"
git checkout --theirs README.md 2>/dev/null || echo "Skipping README.md"
git checkout --theirs AGENTS.md 2>/dev/null || echo "Skipping AGENTS.md"
git checkout --theirs tailwind.config.ts 2>/dev/null || echo "Skipping tailwind.config.ts"

# Check .replit for conflicts
if grep -q "<<<<<<" .replit 2>/dev/null; then
  echo "⚠️  .replit has merge conflicts - please resolve manually"
else
  git checkout --theirs .replit 2>/dev/null || echo ".replit OK"
fi

# Check for remaining conflicts
CONFLICTS=$(git diff --name-only --diff-filter=U)

if [ -z "$CONFLICTS" ]; then
  echo "✅ All conflicts resolved!"
  git add .
  git commit -m "fix: resolve merge conflicts, accept SFS theme updates"
  echo "Ready to push!"
else
  echo "⚠️  These files still have conflicts:"
  echo "$CONFLICTS"
  echo "Please resolve them manually"
fi
```

## After Resolution

1. Verify build works: `npm run dev`
2. Check health endpoint: `curl localhost:5000/health`
3. Push changes: `git push origin main`

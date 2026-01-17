# Onde CI/CD Pipeline Documentation

This document describes the CI/CD pipeline for the Onde PR Bot production system.

## Overview

The pipeline consists of two main workflows:
1. **CI (Continuous Integration)** - Runs on every push and PR
2. **Deploy (Continuous Deployment)** - Runs on main branch after CI passes

## CI Workflow (`ci.yml`)

### Trigger Events
- Push to `main` or `develop` branches
- Pull requests targeting `main` or `develop`

### Jobs

| Job | Purpose | Duration |
|-----|---------|----------|
| `lint` | ESLint + Prettier check | ~1 min |
| `typecheck` | TypeScript compilation check | ~1 min |
| `build` | Build all packages | ~2 min |
| `test` | Run unit tests with coverage | ~2 min |
| `security` | npm audit for vulnerabilities | ~1 min |
| `bot-health` | Validate bot configuration | ~1 min |
| `ci-gate` | Final pass/fail decision | <1 min |

### Required Checks for Merge
All of the following must pass:
- Lint
- TypeScript Check
- Build
- Tests
- Bot Health Check

## Deploy Workflow (`deploy.yml`)

### Trigger Events
- Push to `main` branch (after CI passes)
- Manual trigger via workflow_dispatch

### Environments
- `staging` - For pre-production testing
- `production` - Live bot deployment

### Jobs

| Job | Purpose |
|-----|---------|
| `validate` | Check for deployable changes |
| `build` | Create production bundle |
| `deploy-production` | Deploy to server via SSH |
| `smoke-test` | Verify deployment works |
| `rollback` | Auto-rollback on failure |
| `notify` | Send Telegram notification |

### Safety Features
1. **Automatic Rollback**: If smoke test fails, automatically reverts to previous version
2. **Deployment Manifest**: Each deploy includes version, commit, timestamp
3. **Backup Creation**: Previous deployment is backed up before new deploy
4. **Concurrency Control**: Only one deployment can run at a time

## Required Secrets

Configure these in GitHub repository Settings > Secrets:

### CI Secrets
| Secret | Description |
|--------|-------------|
| `CODECOV_TOKEN` | (Optional) For coverage reporting |

### Deployment Secrets
| Secret | Description |
|--------|-------------|
| `DEPLOY_SSH_KEY` | SSH private key for server access |
| `DEPLOY_HOST` | Production server hostname |
| `DEPLOY_USER` | SSH username |
| `DEPLOY_PATH` | Path on server (e.g., `/home/user/onde`) |
| `ONDE_PR_TELEGRAM_TOKEN` | Telegram bot token |
| `ALERT_CHAT_ID` | Chat ID for deployment notifications |
| `SMOKE_TEST_CHAT_ID` | Chat ID for smoke tests |

## Local Development Commands

```bash
# Run linting
npm run lint

# Run type checking
npm run typecheck

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Health check
npm run health:check

# Smoke test (requires .env)
npm run smoke:test

# Build all packages
npm run build

# Format code
npm run format
```

## Branch Protection Rules

Configure in GitHub Settings > Branches > Add rule for `main`:

1. **Require status checks to pass before merging**
   - CI Gate
   - Lint
   - TypeScript Check
   - Build
   - Test
   - Bot Health Check

2. **Require branches to be up to date before merging**

3. **Require pull request reviews before merging**
   - Required approving reviews: 1 (optional for solo projects)

4. **Do not allow bypassing the above settings**

## Deployment Process

### Automatic (Recommended)
1. Create feature branch from `main`
2. Make changes and push
3. CI runs automatically
4. Create PR when ready
5. All checks must pass
6. Merge to `main`
7. Deployment runs automatically
8. Receive Telegram notification

### Manual Emergency Deploy
```bash
gh workflow run deploy.yml --ref main
```

### Manual Rollback
```bash
# SSH to server
ssh user@production-server

# Find latest backup
ls -la /path/to/onde.backup.*

# Restore manually
cd /path/to
rm -rf onde
mv onde.backup.YYYYMMDD_HHMMSS onde
pm2 restart onde-pr-bot
```

## Monitoring

### Check Bot Status
```bash
pm2 status onde-pr-bot
pm2 logs onde-pr-bot
```

### View Deployment History
```bash
gh run list --workflow=deploy.yml
```

## Troubleshooting

### CI Fails on Lint
```bash
npm run format  # Auto-fix formatting
npm run lint    # Check remaining issues
```

### CI Fails on TypeScript
```bash
npm run typecheck  # See detailed errors
```

### Deployment Fails
1. Check GitHub Actions logs
2. Check if rollback succeeded
3. SSH to server and check pm2 logs
4. Verify environment variables

### Smoke Test Fails
1. Check Telegram bot token is valid
2. Verify server has internet access
3. Check Twitter API credentials

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-06 | 1.0.0 | Initial CI/CD setup |

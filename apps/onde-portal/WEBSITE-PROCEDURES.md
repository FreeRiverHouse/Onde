# Onde Portal - Website Procedures

## Golden Rule: SURGICAL CHANGES ONLY

**NEVER rebuild the entire site for small changes.**
**ALWAYS make incremental, surgical edits.**

---

## Snapshot System

### Current Snapshots:
| Name | Date | Description | Status |
|------|------|-------------|--------|
| `snapshot-001-2books-free-20260111` | 2026-01-11 | 2 books, free download, futuristic design | WORKING |

### Taking a New Snapshot
```bash
cd /Users/mattia/Projects/Onde/apps/onde-portal
SNAPSHOT_NAME="snapshot-XXX-description-$(date +%Y%m%d)"
cp -r out "snapshots/$SNAPSHOT_NAME"
# Add SNAPSHOT-INFO.md with description
```

### Restoring a Snapshot (Rollback)
```bash
cd /Users/mattia/Projects/Onde/apps/onde-portal
# 1. Backup current state first
cp -r out snapshots/backup-before-rollback-$(date +%Y%m%d-%H%M)

# 2. Restore the working snapshot
rm -rf out
cp -r snapshots/snapshot-001-2books-free-20260111 out

# 3. Deploy
npx wrangler pages deploy out --project-name=onde-portal
```

---

## Incremental Change Procedure

### For TEXT changes (titles, descriptions, copy):

1. **Identify the exact file** in `out/` that needs changing
2. **Make a backup**: `cp file.html file.html.bak`
3. **Edit surgically** using sed or direct edit
4. **Test locally**: `npx serve out` then check localhost:3000
5. **Deploy only if working**: `npx wrangler pages deploy out`
6. **Verify on onde.la**

### For STYLE changes (CSS, colors):

1. Find the CSS file in `out/_next/static/css/`
2. Make surgical edit to the specific class
3. Test locally first
4. Deploy

### For STRUCTURAL changes (new pages, sections):

1. **STOP** - This requires a full rebuild
2. Edit source in `src/app/`
3. `npm run build`
4. Test locally
5. **Take a snapshot BEFORE deploying**
6. Deploy

---

## Quick Commands

### Test locally
```bash
cd /Users/mattia/Projects/Onde/apps/onde-portal
npx serve out -p 3000
# Open http://localhost:3000
```

### Deploy to production
```bash
npx wrangler pages deploy out --project-name=onde-portal
```

### Rollback to last working snapshot
```bash
./scripts/rollback.sh snapshot-001-2books-free-20260111
```

---

## DO NOT:
- Run `npm run build` for small text changes
- Delete the `out/` folder without a backup
- Deploy without testing locally first
- Make changes without knowing what snapshot to rollback to

## ALWAYS:
- Take a snapshot before risky changes
- Test locally before deploying
- Keep at least 3 working snapshots
- Document what each snapshot contains

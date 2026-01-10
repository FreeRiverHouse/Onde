#!/usr/bin/env node
/**
 * Onde Backup System
 *
 * Crea snapshot del codice prima di cambiamenti strutturali.
 * Permette rollback a qualsiasi versione precedente.
 *
 * Usage:
 *   node backup.js create "descrizione"   - Crea nuovo backup
 *   node backup.js list                   - Lista tutti i backup
 *   node backup.js restore <id>           - Ripristina un backup
 *   node backup.js diff <id>              - Mostra differenze con backup
 *   node backup.js delete <id>            - Elimina un backup
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  projectRoot: '/Users/mattia/Projects/Onde',
  backupDir: '/Volumes/DATI-SSD/onde-backups',
  manifestFile: 'backup-manifest.json',
  exclude: [
    'node_modules',
    '.next',
    '.git',
    'dist',
    'build',
    '.cache',
    '*.log',
    '.env'
  ]
};

// Ensure backup directory exists
if (!fs.existsSync(CONFIG.backupDir)) {
  fs.mkdirSync(CONFIG.backupDir, { recursive: true });
}

// Load or create manifest
function loadManifest() {
  const manifestPath = path.join(CONFIG.backupDir, CONFIG.manifestFile);
  if (fs.existsSync(manifestPath)) {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  }
  return { backups: [] };
}

function saveManifest(manifest) {
  const manifestPath = path.join(CONFIG.backupDir, CONFIG.manifestFile);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

// Generate backup ID
function generateId() {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

// Create backup
function createBackup(description) {
  const id = generateId();
  const backupPath = path.join(CONFIG.backupDir, id);

  console.log(`\n📦 Creating backup: ${id}`);
  console.log(`📝 Description: ${description || 'No description'}`);
  console.log(`📁 Destination: ${backupPath}\n`);

  // Create backup directory
  fs.mkdirSync(backupPath, { recursive: true });

  // Build exclude args for rsync
  const excludeArgs = CONFIG.exclude.map(e => `--exclude='${e}'`).join(' ');

  // Use rsync for efficient backup
  const cmd = `rsync -av ${excludeArgs} "${CONFIG.projectRoot}/" "${backupPath}/"`;

  try {
    console.log('⏳ Copying files...');
    execSync(cmd, { stdio: 'pipe' });

    // Get git info if available
    let gitInfo = {};
    try {
      gitInfo = {
        branch: execSync('git branch --show-current', { cwd: CONFIG.projectRoot }).toString().trim(),
        commit: execSync('git rev-parse HEAD', { cwd: CONFIG.projectRoot }).toString().trim(),
        status: execSync('git status --short', { cwd: CONFIG.projectRoot }).toString().trim()
      };
    } catch (e) {
      gitInfo = { note: 'Git info not available' };
    }

    // Calculate size
    const sizeOutput = execSync(`du -sh "${backupPath}"`, { encoding: 'utf8' });
    const size = sizeOutput.split('\t')[0];

    // Save backup metadata
    const metadata = {
      id,
      description: description || 'No description',
      createdAt: new Date().toISOString(),
      size,
      git: gitInfo,
      path: backupPath
    };

    fs.writeFileSync(
      path.join(backupPath, 'backup-metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

    // Update manifest
    const manifest = loadManifest();
    manifest.backups.push(metadata);
    saveManifest(manifest);

    console.log(`\n✅ Backup created successfully!`);
    console.log(`   ID: ${id}`);
    console.log(`   Size: ${size}`);
    console.log(`   Path: ${backupPath}\n`);

    return metadata;

  } catch (err) {
    console.error(`\n❌ Backup failed: ${err.message}`);
    // Cleanup failed backup
    if (fs.existsSync(backupPath)) {
      fs.rmSync(backupPath, { recursive: true });
    }
    process.exit(1);
  }
}

// List backups
function listBackups() {
  const manifest = loadManifest();

  if (manifest.backups.length === 0) {
    console.log('\n📭 No backups found.\n');
    console.log('Create one with: node backup.js create "description"\n');
    return;
  }

  console.log(`\n📦 Onde Backups (${manifest.backups.length} total)\n`);
  console.log('─'.repeat(80));

  for (const backup of manifest.backups.reverse()) {
    const date = new Date(backup.createdAt).toLocaleString('it-IT');
    console.log(`\n🔹 ${backup.id}`);
    console.log(`   📝 ${backup.description}`);
    console.log(`   📅 ${date}`);
    console.log(`   💾 ${backup.size}`);
    if (backup.git?.commit) {
      console.log(`   🔀 ${backup.git.branch} @ ${backup.git.commit.slice(0, 7)}`);
    }
  }

  console.log('\n' + '─'.repeat(80));
  console.log('\nCommands:');
  console.log('  restore <id>  - Restore a backup');
  console.log('  diff <id>     - Show differences');
  console.log('  delete <id>   - Delete a backup\n');
}

// Restore backup
function restoreBackup(id) {
  const manifest = loadManifest();
  const backup = manifest.backups.find(b => b.id === id);

  if (!backup) {
    console.error(`\n❌ Backup not found: ${id}`);
    console.log('Use "node backup.js list" to see available backups.\n');
    process.exit(1);
  }

  console.log(`\n⚠️  RESTORE BACKUP`);
  console.log(`   ID: ${backup.id}`);
  console.log(`   Description: ${backup.description}`);
  console.log(`   Created: ${new Date(backup.createdAt).toLocaleString('it-IT')}`);
  console.log(`\n⚠️  This will OVERWRITE current code in ${CONFIG.projectRoot}`);
  console.log(`   A pre-restore backup will be created first.\n`);

  // Create pre-restore backup
  console.log('📦 Creating pre-restore backup...');
  createBackup(`Pre-restore backup before restoring ${id}`);

  // Build exclude args
  const excludeArgs = CONFIG.exclude.map(e => `--exclude='${e}'`).join(' ');

  // Restore using rsync
  const cmd = `rsync -av --delete ${excludeArgs} "${backup.path}/" "${CONFIG.projectRoot}/"`;

  try {
    console.log('\n⏳ Restoring files...');
    execSync(cmd, { stdio: 'pipe' });

    console.log(`\n✅ Backup restored successfully!`);
    console.log(`   Restored from: ${backup.id}`);
    console.log(`   Pre-restore backup created for safety.\n`);

  } catch (err) {
    console.error(`\n❌ Restore failed: ${err.message}`);
    process.exit(1);
  }
}

// Show diff
function showDiff(id) {
  const manifest = loadManifest();
  const backup = manifest.backups.find(b => b.id === id);

  if (!backup) {
    console.error(`\n❌ Backup not found: ${id}`);
    process.exit(1);
  }

  console.log(`\n📊 Differences: Current vs ${backup.id}\n`);

  // Build exclude args
  const excludeArgs = CONFIG.exclude.map(e => `--exclude='${e}'`).join(' ');

  try {
    const cmd = `diff -rq ${excludeArgs} "${backup.path}" "${CONFIG.projectRoot}" 2>/dev/null | head -50`;
    const output = execSync(cmd, { encoding: 'utf8' });

    if (output.trim()) {
      console.log(output);
    } else {
      console.log('No differences found (excluding node_modules, .git, etc.)');
    }
  } catch (err) {
    // diff returns non-zero if there are differences
    if (err.stdout) {
      console.log(err.stdout);
    } else {
      console.log('No differences found.');
    }
  }

  console.log('');
}

// Delete backup
function deleteBackup(id) {
  const manifest = loadManifest();
  const backupIndex = manifest.backups.findIndex(b => b.id === id);

  if (backupIndex === -1) {
    console.error(`\n❌ Backup not found: ${id}`);
    process.exit(1);
  }

  const backup = manifest.backups[backupIndex];

  console.log(`\n🗑️  Deleting backup: ${id}`);
  console.log(`   Description: ${backup.description}\n`);

  try {
    // Remove backup directory
    if (fs.existsSync(backup.path)) {
      fs.rmSync(backup.path, { recursive: true });
    }

    // Update manifest
    manifest.backups.splice(backupIndex, 1);
    saveManifest(manifest);

    console.log(`✅ Backup deleted.\n`);

  } catch (err) {
    console.error(`\n❌ Delete failed: ${err.message}`);
    process.exit(1);
  }
}

// Main CLI
const args = process.argv.slice(2);
const command = args[0];
const param = args.slice(1).join(' ');

switch (command) {
  case 'create':
    createBackup(param);
    break;
  case 'list':
    listBackups();
    break;
  case 'restore':
    if (!param) {
      console.error('\n❌ Please provide backup ID to restore.\n');
      process.exit(1);
    }
    restoreBackup(param);
    break;
  case 'diff':
    if (!param) {
      console.error('\n❌ Please provide backup ID to compare.\n');
      process.exit(1);
    }
    showDiff(param);
    break;
  case 'delete':
    if (!param) {
      console.error('\n❌ Please provide backup ID to delete.\n');
      process.exit(1);
    }
    deleteBackup(param);
    break;
  default:
    console.log(`
📦 Onde Backup System

Usage:
  node backup.js create "description"   Create new backup
  node backup.js list                   List all backups
  node backup.js restore <id>           Restore a backup
  node backup.js diff <id>              Show differences
  node backup.js delete <id>            Delete a backup

Backups are stored in: ${CONFIG.backupDir}
    `);
}

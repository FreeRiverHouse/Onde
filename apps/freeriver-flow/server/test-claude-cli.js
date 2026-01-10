/**
 * Test Claude CLI direttamente per verificare che funzioni
 */

import { spawn } from 'child_process';

const claudePath = '/opt/homebrew/bin/claude';

console.log('Testing Claude CLI...');
console.log(`Path: ${claudePath}`);
console.log('Prompt: "Say hello"');
console.log('-'.repeat(40));

const claude = spawn(claudePath, ['-p', 'Say hello'], {
  env: { ...process.env },
  shell: false,
  stdio: ['pipe', 'pipe', 'pipe']
});

let stdout = '';
let stderr = '';

claude.stdout.on('data', (data) => {
  const text = data.toString();
  stdout += text;
  console.log('STDOUT:', text);
});

claude.stderr.on('data', (data) => {
  const text = data.toString();
  stderr += text;
  console.log('STDERR:', text);
});

claude.on('close', (code) => {
  console.log('-'.repeat(40));
  console.log(`Exit code: ${code}`);
  console.log(`Total stdout: ${stdout.length} chars`);
  console.log(`Total stderr: ${stderr.length} chars`);
  process.exit(code || 0);
});

claude.on('error', (err) => {
  console.error('Spawn error:', err);
  process.exit(1);
});

// Timeout dopo 30 secondi
setTimeout(() => {
  console.log('TIMEOUT after 30 seconds');
  claude.kill();
  process.exit(1);
}, 30000);

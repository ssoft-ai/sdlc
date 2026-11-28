'use strict';
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..');
const TOOLS = fs.readdirSync(path.join(__dirname, '..', 'tools')).filter((file) => file.endsWith('.js')).sort();
const CHECKS = [['tests', ['--test']], ...TOOLS.map((file) => [path.basename(file, '.js'), [path.join('scripts', 'tools', file)]])];

const runEachInItsOwnProcess = (root) => (args) => spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit' });

function main({ checks = CHECKS, run = runEachInItsOwnProcess(ROOT), log = console.error } = {}) {
  let passed = true;
  for (const [name, args] of checks) {
    const result = run(args);
    if (result.status === 0) continue;
    passed = false;
    log(result.error ? `check: ${name} did not run - ${result.error.code}` : `check: ${name} failed`);
  }
  return passed ? 0 : 1;
}

if (require.main === module) process.exitCode = main();

module.exports = { main };

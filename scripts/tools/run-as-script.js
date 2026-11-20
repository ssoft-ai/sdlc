'use strict';
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..');

// Runs a tool alone: each breach on stderr, exit code 1 where there is one.
function runAsScript(check) {
  const problems = check(ROOT);
  for (const problem of problems) console.error(problem);
  process.exitCode = problems.length > 0 ? 1 : 0;
}

module.exports = { ROOT, runAsScript };

'use strict';
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

function validateWithSkillsRef(dir) {
  const result = spawnSync('skills-ref', ['validate', dir], { encoding: 'utf8' });
  if (result.error) return { error: result.error.code };
  return { status: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` };
}

const INSTALL =
  'install the pinned tools into an active virtual environment of Python 3.11 or later with pip 25.3 or later, ' +
  'from the root of the repository: ' +
  'pip install --no-deps --build-constraint scripts/ci/build-constraints.txt -r scripts/ci/requirements.txt';

function check(root, validate = validateWithSkillsRef) {
  const skillsDir = path.join(root, 'skills');
  const problems = [];
  const entries = fs.readdirSync(skillsDir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const result = validate(path.join(skillsDir, entry.name));
    if (result.error) return [`frontmatter: cannot run skills-ref (${result.error}); ${INSTALL}`];
    if (result.status !== 0) problems.push(`${entry.name}: ${result.output.split('\n').map((line) => line.trim()).filter(Boolean).join(' ')}`);
  }
  return problems;
}

if (require.main === module) require('../lib/run-as-script').runAsScript(check);

module.exports = { check };

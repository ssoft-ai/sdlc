'use strict';
const fs = require('node:fs');
const path = require('node:path');

const needs = ['skills-ref'];

function validateWithSkillsRef(dir) {
  const result = require('node:child_process').spawnSync('skills-ref', ['validate', dir], { encoding: 'utf8' });
  if (result.error) return { error: result.error.code };
  return { status: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` };
}

function check(root, validate = validateWithSkillsRef) {
  const skillsDir = path.join(root, 'skills');
  const problems = [];
  for (const entry of fs.readdirSync(skillsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const result = validate(path.join(skillsDir, entry.name));
    if (result.error) problems.push(`${entry.name}: cannot run skills-ref: ${result.error}`);
    else if (result.status !== 0) problems.push(`${entry.name}: ${result.output.split('\n').map((line) => line.trim()).filter(Boolean).join(' ')}`);
  }
  return problems;
}

if (require.main === module) require('./run-as-script').runAsScript(check);

module.exports = { needs, check };

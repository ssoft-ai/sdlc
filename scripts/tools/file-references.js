'use strict';
const fs = require('node:fs');
const path = require('node:path');

// A path under references/ is a file of the skill even where the directory is missing.
const OWN_DIR = 'references';
const BYTE_ORDER_MARK = 0xfeff;

function readSkills(skillsDir) {
  return fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(skillsDir, entry.name, 'SKILL.md')))
    .map((entry) => entry.name)
    .sort()
    .map((name) => {
      const raw = fs.readFileSync(path.join(skillsDir, name, 'SKILL.md'), 'utf8');
      const text = raw.charCodeAt(0) === BYTE_ORDER_MARK ? raw.slice(1) : raw;
      const body = text.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '');
      return { name, dir: path.join(skillsDir, name), body };
    });
}

function existsWithLetterCase(root, segments) {
  let dir = root;
  for (const segment of segments) {
    if (!fs.statSync(dir).isDirectory() || !fs.readdirSync(dir).includes(segment)) return false;
    dir = path.join(dir, segment);
  }
  return true;
}

function checkReferences(skills) {
  const problems = [];
  for (const skill of skills) {
    // Another first directory counts only where the skill has it, since a skill may name a
    // user's file.
    const ownDirs = new Set(
      fs.readdirSync(skill.dir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name.toLowerCase()),
    );
    ownDirs.add(OWN_DIR);
    const seen = new Set();
    for (const [, span] of skill.body.matchAll(/`([^`\s]+)`/g)) {
      const ref = span.split('#')[0].replace(/^\.\//, '');
      const segments = ref.split('/');
      const placeholder = /[*<>{}]/.test(ref);
      if (segments.length < 2 || segments.at(-1) === '' || placeholder || !ownDirs.has(segments[0].toLowerCase()) || seen.has(ref)) continue;
      seen.add(ref);
      if (segments.length > 2) problems.push(`${skill.name}: refers to ${ref}, more than one level below SKILL.md`);
      if (!existsWithLetterCase(skill.dir, segments)) problems.push(`${skill.name}: refers to ${ref}, which does not exist`);
    }
  }
  return problems;
}

const needs = [];

function check(root) {
  return checkReferences(readSkills(path.join(root, 'skills')));
}

if (require.main === module) require('./run-as-script').runAsScript(check);

module.exports = { needs, check, readSkills, checkReferences };

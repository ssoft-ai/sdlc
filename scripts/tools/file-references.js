'use strict';
const fs = require('node:fs');
const path = require('node:path');

const ALWAYS_A_SKILL_DIR = 'references';
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
    const dirsOfTheSkill = new Set(
      fs.readdirSync(skill.dir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name.toLowerCase()),
    );
    dirsOfTheSkill.add(ALWAYS_A_SKILL_DIR);
    const mayNameAUserFile = (segments) => !dirsOfTheSkill.has(segments[0].toLowerCase());
    const seen = new Set();
    for (const [, span] of skill.body.matchAll(/`([^`\s]+)`/g)) {
      const ref = span.split('#')[0].replace(/^\.\//, '');
      const segments = ref.split('/');
      const placeholder = /[*<>{}]/.test(ref);
      if (segments.length < 2 || segments.at(-1) === '' || placeholder || mayNameAUserFile(segments) || seen.has(ref)) continue;
      seen.add(ref);
      if (segments.length > 2) problems.push(`${skill.name}: refers to ${ref}, not directly inside a directory of the skill`);
      if (!existsWithLetterCase(skill.dir, segments)) problems.push(`${skill.name}: refers to ${ref}, which does not exist`);
    }
  }
  return problems;
}

function check(root) {
  return checkReferences(readSkills(path.join(root, 'skills')));
}

if (require.main === module) require('../lib/run-as-script').runAsScript(check);

module.exports = { check };

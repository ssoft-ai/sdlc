'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { readSkills, checkReferences } = require('../scripts/ci/lint/file-references');

function check(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'file-references-'));
  try {
    for (const [file, text] of Object.entries(files)) {
      fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
      fs.writeFileSync(path.join(dir, file), text);
    }
    return checkReferences(readSkills(dir));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const skillMd = (body) => `---\nname: verification\ndescription: Checks work.\n---\n\n${body}`;
const withFile = { 'verification/references/process.md': 'Process.\n' };

test('passes a reference to a file of the skill directory', () => {
  assert.deepStrictEqual(check({ 'verification/SKILL.md': skillMd('See `references/process.md`.\n'), ...withFile }), []);
});

test('reports a reference in backticks to a file that does not exist', () => {
  assert.deepStrictEqual(check({ 'verification/SKILL.md': skillMd('See `references/proces.md`.\n'), ...withFile }), [
    'verification: refers to references/proces.md, which does not exist',
  ]);
});

test('reports a missing file once however often it is referred to', () => {
  assert.deepStrictEqual(check({ 'verification/SKILL.md': skillMd('See `references/a.md`, then `references/a.md`.\n'), ...withFile }), [
    'verification: refers to references/a.md, which does not exist',
  ]);
});

test('reports a file under references/ where the skill has no such directory', () => {
  assert.deepStrictEqual(check({ 'verification/SKILL.md': skillMd('See `references/process.md`.\n') }), [
    'verification: refers to references/process.md, which does not exist',
  ]);
});

test('reports a path that runs through a file', () => {
  assert.deepStrictEqual(check({ 'verification/SKILL.md': skillMd('See `references/process.md/x`.\n'), ...withFile }), [
    'verification: refers to references/process.md/x, more than one level below SKILL.md',
    'verification: refers to references/process.md/x, which does not exist',
  ]);
});

test('leaves alone a directory named with its trailing slash', () => {
  assert.deepStrictEqual(check({ 'verification/SKILL.md': skillMd('Put the notes in `references/`.\n'), ...withFile }), []);
});

test('reports a reference more than one level below SKILL.md', () => {
  assert.deepStrictEqual(
    check({ 'verification/SKILL.md': skillMd('See `references/deep/process.md`.\n'), 'verification/references/deep/process.md': 'P.\n' }),
    ['verification: refers to references/deep/process.md, more than one level below SKILL.md'],
  );
});

test('reads a reference written with ./ and an anchor as the path of the file', () => {
  assert.deepStrictEqual(check({ 'verification/SKILL.md': skillMd('See `./references/b.md#steps`.\n'), ...withFile }), [
    'verification: refers to references/b.md, which does not exist',
  ]);
});

test('reports a reference whose letter case differs from the file', () => {
  assert.deepStrictEqual(check({ 'verification/SKILL.md': skillMd('See `references/Process.md`.\n'), ...withFile }), [
    'verification: refers to references/Process.md, which does not exist',
  ]);
});

test('leaves alone a path whose first directory the skill does not have', () => {
  assert.deepStrictEqual(
    check({ 'verification/SKILL.md': skillMd('Edit `src/main.cpp`, run `scripts/build.sh`, read `https://example.com/references/a.md`.\n'), ...withFile }),
    [],
  );
});

test('reads the references of the body, not of the frontmatter', () => {
  assert.deepStrictEqual(
    check({ 'verification/SKILL.md': '---\r\nname: verification\r\ndescription: See `references/x.md`.\r\n---\r\n\r\nSee `references/process.md`.\r\n', ...withFile }),
    [],
  );
});

test('reports a missing file under another directory the skill has', () => {
  assert.deepStrictEqual(check({ 'verification/SKILL.md': skillMd('Run `scripts/run.sh`.\n'), 'verification/scripts/other.sh': 'x\n' }), [
    'verification: refers to scripts/run.sh, which does not exist',
  ]);
});

test('reports a reference whose directory differs in letter case from the skill directory', () => {
  assert.deepStrictEqual(check({ 'verification/SKILL.md': skillMd('See `References/process.md`.\n'), ...withFile }), [
    'verification: refers to References/process.md, which does not exist',
  ]);
});

test('leaves alone a placeholder or a pattern standing for files', () => {
  assert.deepStrictEqual(check({ 'verification/SKILL.md': skillMd('Add `references/<topic>.md`; read `references/*.md`.\n'), ...withFile }), []);
});

test('reads the body of a file that starts with a byte order mark', () => {
  assert.deepStrictEqual(
    check({ 'verification/SKILL.md': String.fromCharCode(0xfeff) + '---\nname: verification\ndescription: See `references/x.md`.\n---\n\nBody.\n', ...withFile }),
    [],
  );
});

test('reads a directory without SKILL.md as no skill', () => {
  assert.deepStrictEqual(check({ 'verification/SKILL.md': skillMd('See `references/process.md`.\n'), ...withFile, 'notes/readme.txt': 'x\n' }), []);
});

test('reads the body of a SKILL.md that ends at its closing frontmatter line', () => {
  assert.deepStrictEqual(check({ 'verification/SKILL.md': '---\nname: verification\ndescription: See `references/x.md`.\n---' }), []);
});

test('finds no broken file reference in the catalog of this repository', () => {
  assert.deepStrictEqual(checkReferences(readSkills(path.join(__dirname, '..', 'skills'))), []);
});
